const pool = require('../config/database');

const Payment = {};

Payment.savePaymentResponse = async (newPaymentResponse) => {
  let response = {};
  try {
    const [result, fields] =
      await pool.query(`INSERT INTO user_payment SET invoice_id=?,dl_number=?,dl_state=?,post_code=?,
      state=?,region=?,amount=?,terminal_id=?,city=?,response_text=?,response_code=?,approval_code=?,
      avs_response=?,cvv_response=?,unique_ref=?,email=?,card_number=?,hash=?,total_response=?,date_time=?`, 
        [newPaymentResponse.invoice_id, newPaymentResponse.dl_number, newPaymentResponse.dl_state,
          newPaymentResponse.post_code, newPaymentResponse.state, newPaymentResponse.region,
          newPaymentResponse.amount, newPaymentResponse.terminal_id, newPaymentResponse.city,
          newPaymentResponse.response_text, newPaymentResponse.response_code, newPaymentResponse.approval_code,
          newPaymentResponse.avs_response, newPaymentResponse.cvv_response, newPaymentResponse.unique_ref,
          newPaymentResponse.email, newPaymentResponse.card_number, newPaymentResponse.hash,
          newPaymentResponse.total_response, newPaymentResponse.date_time
        ]
      );
    console.log(result);
    response.result = newPaymentResponse;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Payment.getPaymentResponseExists = async (invoice_id, unique_ref) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(`SELECT * FROM user_payment WHERE invoice_id=? AND unique_ref=?`, [invoice_id, unique_ref]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

module.exports = Payment;