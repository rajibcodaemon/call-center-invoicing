const express = require('express');
const bcrypt = require('bcryptjs');
const generator = require('generate-password');
const json2csv = require('json2csv').parse;
const {check, validationResult} = require('express-validator');
const { sendEmail } = require('../helpers/helpers');

const authMiddleware = require('../middleware/auth');
const UserModel = require('../models/User');

const router = express.Router();

// @route     POST /api/users
// @desc      Get user list
// @access    Private
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const roleId = req.body.role_id || 2;  

  // Pagination
  const sortBy = req.body.sort_by || 'first_name';
  const sortOrder = req.body.sort_order || 'ASC';
  const searchTerm = req.body.search_term || '';
  const fetchPage = req.body.fetch_page || 1;
  const perPage = req.body.per_page || 3;
  let searchQuery = '';

  if (searchTerm !== '') {
    searchQuery = `AND (first_name LIKE "%${searchTerm.toLowerCase()}%" OR last_name LIKE "%${searchTerm.toLowerCase()}%" OR email_id LIKE "%${searchTerm.toLowerCase()}%" OR contact_no LIKE "%${searchTerm.toLowerCase()}%")`;
  }
  const sql_query = `SELECT id, role_id, first_name, last_name, email_id, contact_no, status FROM user WHERE role_id=${roleId} ${searchQuery} ORDER BY ${sortBy} ${sortOrder}`;  

  const users = await UserModel.getSortedUsers(sql_query);

  const csvFields = ['ID', 'Role', 'First Name', 'Last Name', 'Email', 'Phone Number', 'Status'];

  const csv = json2csv(users.result, { csvFields });
  console.log('CSV');
  console.log(csv);

  total_users = users.result.length;
  total_pages = parseInt(Math.ceil(total_users/perPage));
  start_page = (perPage * (fetchPage - 1));
  next_start = (perPage * fetchPage);
  next_page = 0; // Count for next page records
  
  const sql_query_final = `SELECT id, role_id, first_name, last_name, email_id, contact_no, status FROM user WHERE role_id=${roleId} ${searchQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT ${start_page},${perPage}`;
  dataArray = await UserModel.getSortedUsers(sql_query_final); // perPage, start_page
  
  if (users.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else {
    return res.status(200).json({ errors: [], data: {
      msg: 'Users listed', 
      users: dataArray.result,
      total_users,
      fetchPage,
      perPage,
      start_page,
      next_start,
      next_page,
      total_pages,
      csv
    }});
  }  
});

// @route     POST /api/users/create
// @desc      Create user agents
// @access    Private
router.post('/create', [authMiddleware, [
    check('first_name', 'Please enter a valid first name').not().isEmpty(),
    check('last_name', 'Please enter a valid last name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('user_role', 'Please select the user role').not().isEmpty(),
    check('password', 'Please enter a password with min 6 characters').isLength({ min: 6 })
  ]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, phone, user_role, password } = req.body;
    const response = await UserModel.getUserByEmail(email);

    if (response.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else if (response.result && response.result.length > 0) {
      return res.status(400).json({ errors: [{msg: 'Email id is already registered!'}]});
    } else {
      let newUser = { first_name, last_name, email, phone, user_role, password };
      
      // Encrypt password using bcrypt
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);
      newUser.user_role = parseInt(newUser.user_role);
      
      const user = await UserModel.saveUser(newUser);

      if (user.error) {
        return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
      } else {        
        delete user.result.password;        
        return res.status(200).json({ errors: [], data: {msg: 'User registered successfully', user: user.result}});
      }
    }    
});

// @route     POST /api/users/update/:id
// @desc      Create user agents
// @access    Public
router.post('/update/:id', [authMiddleware, [
  check('first_name', 'Please enter a valid first name').not().isEmpty(),
  check('last_name', 'Please enter a valid last name').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('user_role', 'Please select the user role').not().isEmpty()
]], async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, phone, user_role } = req.body;
  const response = await UserModel.getUserByEmailAndID(email, id);

  if (response.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (response.result && response.result.length > 0) {
    return res.status(400).json({ errors: [{msg: 'Email id is already registered!'}]});
  } else {
    let newUser = { id, first_name, last_name, email, phone, user_role };
    console.log(newUser);
    const user = await UserModel.updateUser(newUser);

    if (user.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else {      
      return res.status(200).json({ errors: [], data: {msg: 'User profile updated successfully'}});
    }
  }    
});

router.post('/update-user/:id', [authMiddleware, [
  check('first_name', 'Please enter a valid first name').not().isEmpty().trim().escape(),
  check('last_name', 'Please enter a valid last name').not().isEmpty().trim().escape(),
  check('email', 'Please include a valid email').isEmail().trim().escape(),
  check('user_role', 'Please select the user role').not().isEmpty().escape()
]], async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, email, phone, user_role } = req.body;
  console.log('Check update user email');
  const response = await UserModel.getUserByEmailAndID(email, id);

  if (response.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (response.result && response.result.length > 0) {
    return res.status(400).json({ errors: [{msg: 'Email id is already registered!'}]});
  } else {
    let newUser = { id, first_name, last_name, email, phone, user_role };
    console.log(newUser);
    
    // const user = await UserModel.updateUser(newUser);
    const sql = `UPDATE user SET role_id=${newUser.user_role}, first_name='${newUser.first_name}', last_name='${newUser.last_name}', email_id='${newUser.email}', contact_no='${newUser.phone}' WHERE id=${newUser.id}`;
    console.log('SQL Update', sql);
    const user = await UserModel.editUser(sql);    
    if (user.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else {
      return res.status(200).json({ errors: [], data: {msg: 'User profile updated successfully'}});
    }
  }

});

// @route     GET /api/users/:id
// @desc      Get a user profile information
// @access    Private
router.get('/profile/:id', authMiddleware, async (req, res) => {  
  const id = req.params.id;
  
  // Check if user exists
  const user = await UserModel.getUserById(id);
  if (user.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (user.result.length < 1) {
    return res.status(404).json({ errors: [{msg: 'User not found!'}] });
  } else {    
    return res.status(200).json({ errors: [], data: {msg: 'User profile', user: user.result[0] }});
  }    
});

// @route     PUT /api/users/:id
// @desc      Update a user agent password
// @access    Private
router.put('/:id', [authMiddleware, [
  check('password', 'Please enter the user password').not().isEmpty().escape()
]], async (req, res) => {  
  const id = req.params.id;
  const { password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ 
      errors: [
        {
          "value": "",
          "msg": "Please enter a password with min 6 characters",
          "param": "password",
          "location": "body"
        }
      ] 
    });
  }

  // Check if user exists
  const user = await UserModel.getUserById(id);
  if (user.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (user.result.length < 1) {
    return res.status(404).json({ errors: [{msg: 'User not found!'}] });
  } else {
    const newUser = { id, password };

    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    const response = await UserModel.updateUserPassword(newUser);
    if (response.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else {
      return res.status(200).json({ errors: [], data: {msg: 'User profile password updated' }});
    }
  }    
});

// @route     POST /api/users/:id
// @desc      Block a user agent
// @access    Private
router.post('/:id', [authMiddleware, [
  check('status', 'Please enter a valid user status').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const id = req.params.id;  
  const { status } = req.body;
  
  // Check if user exists
  const user = await UserModel.getUserById(id);
  if (user.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (user.result.length < 1) {
    return res.status(404).json({ errors: [{msg: 'User not found!'}] });
  } else {
    const newUser = { id, status };    
    const response = await UserModel.updateUserStatus(newUser);
    if (response.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else {
      return res.status(200).json({ errors: [], data: {msg: 'User status updated' }});
    }
  }    
});

// @route     POST /api/users/forgot-password
// @desc      Forget password
// @access    Public ** Not being used
router.post('/forgot-password', [
  check('email_id', 'Please enter a valid email id').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email_id } = req.body;
  
  // Check if user exists
  const user = await UserModel.getUserByEmail(email_id);

  if (user.error) {
    return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
  } else if (user.result.length < 1) {
    return res.status(404).json({ errors: [{msg: 'Invalid email id or account is blocked!'}] });
  } else if (user.result[0]['status'] != 1) {
    return res.status(404).json({ errors: [{msg: 'Invalid email id or account is blocked!'}] });
  } else {
    // Encrypt password using bcrypt
    const newUser = {};
    const random_password = generator.generate({ length: 6, numbers: true })
    console.log('Random Password: ', random_password);
    newUser.password = random_password;

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
    newUser.id = user.result[0]['id'];
    
    const emailTemplate = `
                      <html>
                      <head>
                        <title>Forget Password</title>
                      </head>
                      <body>
                          <table>
                              <tr>
                                  <td>
                                    <table>
                                      <tr>                                
                                        <td>Hello ${user.result[0]['first_name']},</td>                                  
                                      </tr>
                                      <tr>                                  
                                        <td>
                                          <p>
                                            Your password has been reset. Your new password is <strong>${random_password}</strong>.
                                          </p>
                                        </td>
                                      </tr>                                  
                                      <tr>
                                        <td><hr /></td>
                                      </tr>
                                      <tr>
                                        <td>Thank you</td>
                                      </tr>
                                    </table>
                                  </td>
                              </tr>
                          </table>
                      </body>
                    </html>
    `;
    
    const response = await UserModel.updateUserPassword(newUser);
    if (response.error) {
      return res.status(500).json({ errors: [{msg: 'Internal server error!'}] });
    } else {
      sendEmail(user.result[0]['email'], 'Reset Password', emailTemplate, 'Reset Password');
      return res.status(200).json({ errors: [], data: {msg: 'An email has been sent you with your new password!' }});
    }
  }    
});

module.exports = router;