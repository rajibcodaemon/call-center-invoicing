const pool = require('../config/database');

const Invoice = {};

Invoice.getMsaFromZip = async (zipcode) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT id, zip_code, msa_id FROM `zip_msa_id` WHERE zip_code=?', [zipcode]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getPriceForMSA = async (msa_id) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT id, msa, msa_id, retail_tow_rate, retail_light_service_rate, per_mile_rate_over_ten_miles, system_for_towing, system_for_light_service, system FROM `price_lookup_msa` WHERE msa_id=?', [msa_id]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getLastInvoiceNumber = async () => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT id, invoice_id FROM `user_invoice` ORDER BY id DESC LIMIT 1;');
    console.log(result);
    if (result.length > 0) {
      response.result = result;
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getNewInvoiceNumber = async (newInvoiceId, user_id) => {
  let response = {};
  try {
    const [resultInsert, fieldsInsert] = await pool.query('INSERT INTO `user_invoice` SET invoice_id=?, user_id=?', [newInvoiceId, user_id]);
    const [result, fields] = await pool.query('SELECT invoice_id FROM `user_invoice` ORDER BY id DESC LIMIT 1;');
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getInvoiceById = async (invoice_number) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(`SELECT invoice_id FROM user_invoice WHERE invoice_id=?`, [invoice_number]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
}

Invoice.saveInvoice = async (invoice) => {
  let response = {};
  try {
    const [result, fields] =
      await pool.query(`UPDATE user_invoice SET 
        first_name=?, 
        last_name=?,
        payment_email=?,
        notes=?, 
        phone_number=?,
        service_type=?,
        problem_type=?,
        amount=?,
        distance=?,
        status=?,
        start_address=?,
        end_address=?,
        origin_zipcode=?,
        destination_zipcode=?,
        is_sms_sent=?,
        is_email_sent=?,
        pickup_location=?,
        model=?,
        color=?,
        make=?,
        year=?,
        anyone_with_vehicle=?,
        keys_for_vehicle=?,
        four_wheels_turn=?,
        back_wheels_turn=?,
        front_wheels_turn=?,
        is_neutral=?,
        fuel_type=?,
        pickup_notes=?,
        is_draft=?,
        date_edit_timestamp=NOW(),
        msa_system=?,
        send_payment_to=?,        
        user_id=?,
        origin_latlng=?,
        destination_latlng=?
      WHERE invoice_id=?`,
        [
          invoice.fname,
          invoice.lname,
          invoice.paymentemail,
          invoice.paymentnotes, 
          invoice.phone, 
          invoice.servicetype,
          invoice.problemtype,
          invoice.paymenttotalamount,
          invoice.tmiles,
          'Yet_to_pay',
          invoice.originaddress,
          invoice.destinationaddress,
          invoice.ozip,
          invoice.dzip,
          (invoice.sendpaymentto === 'Phone') ? 'Yes' : 'No',
          (invoice.sendpaymentto === 'Email') ? 'Yes' : 'No',
          invoice.pickuplocation,
          invoice.model,
          invoice.color,
          invoice.make,
          invoice.year,                        
          invoice.anyonewithvehicle, 
          invoice.keysforvehicle, 
          invoice.fourwheelsturn,
          invoice.backwheelsturn,
          invoice.frontwheelsturn,
          invoice.neutral,          
          invoice.fueltype,
          invoice.paymentnotes,
          'No',          
          invoice.msa_system,
          invoice.sendpaymentto,          
          invoice.user_id,
          invoice.origin,
          invoice.destination,
          invoice.invoicenumber]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.updateInvoice = async (invoice) => {
  let response = {};
  try {
    const [result, fields] =
      await pool.query(`UPDATE user_invoice SET 
          first_name=?, 
          last_name=?,
          phone_number=?,
          year=?,
          make=?,
          model=?,
          color=?,
          status=?,
          pickup_location=?,
          pickup_notes=?,
          notes=?,
          amount=?,
          payment_email=?,
          send_payment_to=? 
        WHERE invoice_id=?`,
        [invoice.first_name,
        invoice.last_name,
        invoice.phone_number,
        invoice.year,
        invoice.make,
        invoice.model,
        invoice.color,
        invoice.status,
        invoice.pickup_location,
        invoice.pickup_notes,
        invoice.notes,
        invoice.amount,
        invoice.payment_email,
        invoice.send_payment_to,
        invoice.invoice_id
        ]);
    console.log(result);
    response.result = invoice;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.updateLinkDate = async (invoice) => {
  let response = {};
  try {
    const [result, fields] =
      await pool.query(`UPDATE user_invoice SET           
            send_payment_to=?,
            date_edit_timestamp=NOW() 
          WHERE invoice_id=?`, [
            invoice.send_payment_to,
            invoice.invoice_id
          ]);
    console.log(result);
    response.result = invoice;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getInvoiceByInvoiceId = async (invoice_number) => {
  let response = {};
  try {
    const [result, fields] = await pool.query(`SELECT * FROM user_invoice WHERE invoice_id=?`, [invoice_number]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};

Invoice.getSortedInvoices = async (sqlQuery) => {
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

Invoice.getAllInvoice = async (user_id) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('SELECT * FROM `user_invoice` WHERE user_id=? ORDER BY invoice_id ASC', [user_id]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};


Invoice.updateInvoicePaymentStatus = async (updateInvoice) => {
  let response = {};
  try {
    const [result, fields] = await pool.query('UPDATE user_invoice SET status = ?,date_payment = NOW() WHERE invoice_id =?', [updateInvoice.status, updateInvoice.invoice_id]);
    console.log(result);
    response.result = result;
    return response;
  } catch (error) {
    console.log(`Error: ${error.sqlMessage}`);
    response.error = error.sqlMessage;
    return response;
  }
};


module.exports = Invoice;