const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generator = require('generate-password');
const {check, validationResult} = require('express-validator');

const authMiddleware = require('../middleware/auth');
const UserModel = require('../models/User');

const { sendEmail } = require('../helpers/helpers');

dotenv.config();
const router = express.Router();

// @route     GET /api/auth
// @desc      Get logged in user
// @access    Private
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const user = await UserModel.getUserById(userId);

  if (user.error) {
    return res.status(400).json({ errors: [{msg: exist.error}]});
  } else if (user.result.length === 0) {
    return res.status(401).json({ errors: [{msg: 'Invalid token or token has expired'}]});
  } else {
    return res.status(200).json({ errors: [], data: {msg: 'User authenticated', user: user.result[0] }});
  }  
});

// @route     POST /api/auth
// @desc      Login a user & get token
// @access    Public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  const {email, password} = req.body;
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Check if user exists
  const userExist = await UserModel.getUserByEmail(email);
  if (userExist.error) {
    return res.status(400).json({ errors: [{msg: exist.error}]});
  }  else if (userExist.result[0] && userExist.result[0].status === 0) {
    return res.status(400).json({ errors: [{msg: 'Invalid login credentials!'}]});
  } else if (userExist.result[0]) {
    const isMatch = await bcrypt.compare(password, userExist.result[0].password);
    if (isMatch) {
      // Generate JWT Token
      const payload = {
            user: {
              id: userExist.result[0].id
            }
          };
      const token = await jwt.sign(
                        payload,
                        process.env.JWTSECRET,
                        { expiresIn: 3600000 });
      userExist.result[0].token = token;
      delete userExist.result[0].password;
      return res.status(200).json({ errors: [], data: {msg: 'Login successful', user: userExist.result[0] }});
    } else {
      return res.status(400).json({ errors: [{msg: 'Invalid login credentials!'}]});
    }      
  } else {
    return res.status(400).json({ errors: [{msg: 'Invalid login credentials!'}]});
  }
});

// @route     POST /api/auth/forget-password
// @desc      Forget password
// @access    Public
router.post('/forget-password', [
  check('email', 'Please enter a valid email id').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email } = req.body;
  
  // Check if user exists
  const user = await UserModel.getUserByEmail(email);
  console.log('Search user by email');
  console.log(user.result[0]);
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
      sendEmail(user.result[0]['email_id'], 'Reset Password', emailTemplate, 'Reset Password');
      return res.status(200).json({ errors: [], data: {msg: 'An email has been sent you with your new password!' }});
    }
  }    
});

var distance = require('google-distance-matrix');

router.get('/distance', (req, res) => {  
  distance.key(process.env.GOOGLEAPIKEY);
  distance.units('imperial');
  var origins = ['Starbucks Miami Gardens, 19401 NW 27th Ave #101, Miami Gardens, FL 33056'];
  var destinations = ['Miami International Airport'];
  
  distance.matrix(origins, destinations, function (err, distances) {
      if (!err){
        console.log(distances);
        res.json(distances.rows[0]['elements'][0]);
      }else{
        res.json(err);
      }
  });
});

module.exports = router;