const pool = require('../config/database');

const User = {};

User.getUserByEmail = async (email) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(`SELECT id, role_id, first_name, last_name, email_id, contact_no, password, status FROM user WHERE email_id=?`, [email]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
}

User.getUserByEmailAndID = async (email, id) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(`SELECT id, role_id, first_name, last_name, email_id, contact_no, password, status FROM user WHERE email_id=? AND id!=?`, [email, parseInt(id)]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
}

User.saveUser = async (user) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('INSERT INTO `user` SET role_id=?, first_name=?, last_name=?, email_id=?, contact_no=?, password=?', [user.user_role, user.first_name, user.last_name, user.email, user.phone, user.password]);
    console.log(result);
    user.id = result.insertId;
    response.result = user;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.updateUser = async (user) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('UPDATE `user` SET role_id=?, first_name=?, last_name=?, email_id=?, contact_no=? WHERE id=?', [user.user_role, user.first_name, user.last_name, user.email, user.phone, user.password, parseInt(user.id)]);
    console.log(result);    
    response.result = user;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.editUser = async (sql_query) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(sql_query);
    console.log(result);    
    response.result = user;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.updateUserPassword = async (user) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('UPDATE `user` SET password=? WHERE id=?', [user.password, user.id]);
    console.log(result);    
    response.result = user;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.updateUserStatus = async (user) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('UPDATE `user` SET status=? WHERE id=?', [user.status, user.id]);
    console.log(result);    
    response.result = user;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.getUserById = async (id) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT id, role_id, first_name, last_name, email_id, contact_no FROM `user` WHERE `id`=?', [id]);        
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.getUsers = async (user_role) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT id, role_id, first_name, last_name, email_id, contact_no, status FROM `user` WHERE role_id=? ORDER BY id ASC', [user_role]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

User.getSortedUsers = async (sqlQuery) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(sqlQuery);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

module.exports = User;