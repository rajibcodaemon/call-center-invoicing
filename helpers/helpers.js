const dotenv = require('dotenv');
const request = require('request-promise');
const moment = require('moment');

const InvoiceModel = require('../models/Invoice');
const UserModel = require('../models/User');

const accountSid = process.env.TWILIOSID;
const authToken = process.env.TWILIOAUTH;

const twilio = require('twilio')(accountSid, authToken);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRIDKEY);

const sendSMS = async (message, receiver='+919874259153') => {
  console.log('Send SMS Twilio', receiver);
  const msg_body = message;
  const msg_sender = '+16827171861';
  const msg_receiver = receiver;

  try {
    const sms_response = await twilio.messages
      .create({
        body: msg_body,
        from: msg_sender,
        to: msg_receiver      
      });
    console.log('SMS Sent');
    return sms_response ? true : false;    
  } catch (error) {
    console.log('SMS send error');
    console.log(error);
    return false;
  }  
}

const sendPaymentLinkSMS = async (invoice_id) => {
  const InvoiceModel = require('../models/Invoice');

  try {
    const response = await InvoiceModel.getInvoiceById(invoice_id);
    console.log(response.result[0].invoice_id);
    if (response.result.length <= 0) {
      return false;
    } else {
      // Get the invoice details
      const info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);

      if (info.result.length <= 0) {
        return false;
      } else {
        const { status, payment_email, first_name, last_name, phone_number, service_type, model, color, make, year, start_address, end_address, amount, date_payment } = info.result[0];
        const paymentUrl = `${process.env.PAYMENTLINK}payment/${invoice_id}`;
        const sms_content = `
        Roadside Assistance: \n\nHi ${first_name},\n\nYou can pay for your service using the following link: ${paymentUrl}`;        
        return await sendSMS(sms_content, `+1${phone_number}`);
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const sendEmail = async (receiver ='aninda.kar@codaemonsoftwares.com', mail_subject, mail_message, mail_text='Send mail test dummy') => {
  console.log('Send Email Sendgrid'); // info@eastindiatrading.co
  const msg = {
    to: receiver,
    from: 'no-reply@roadsideassistanceltd.com',
    subject: mail_subject,
    text: mail_text,
    html: mail_message,
  };

  try {
    const mail = await sgMail.send(msg);
    console.log('Mail Send');
    return mail ? true : false;
  } catch (error) {
    console.log('Email send error');
    console.log(error);
    return false;
  }  
}

const sendPaymentConfirmationEmail = async (invoice_id) => {
  const InvoiceModel = require('../models/Invoice');

  try {
    const response = await InvoiceModel.getInvoiceById(invoice_id);
    console.log(response.result[0].invoice_id);
    if (response.result.length <= 0) {
      return false;
    } else {
      // Get the invoice details
      const info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);

      if (info.result.length <= 0) {
        return false;
      } else {
        const { status, payment_email, first_name, last_name, phone_number, service_type, model, color, make, year, start_address, end_address, amount, date_payment } = info.result[0];
        const date_paid = moment(date_payment).format('ddd MMM D YYYY kk:mm:ss') + ' GMT ' + moment().format('Z');
        const mail_subject = 'Roadside Assistance Payment Confirmation';
        const mail_message = `
                    <html>
                    <head>
                      <title>Roadside Assistance Payment Confirmation</title>
                    </head>
                    <body>
                        <table>
                            <tr>
                                <td>
                                  <table>
                                    <tr>                                
                                      <td>Hello ${first_name},</td>                                  
                                    </tr>
                                    <tr>                                  
                                      <td>
                                        <p>Below is the payment confirmation for your roadside assistance service:</p>
                                        <p>
                                          <b>Invoice Number:</b> ${invoice_id} <br/>                                         
                                          <b>Customer Name:</b> ${first_name} ${last_name} <br/>
                                          <b>Telephone Number:</b> ${phone_number} <br/>
                                          <b>Vehicle Year:</b> ${year} <br/>
                                          <b>Vehicle Make:</b> ${make} <br/>
                                          <b>Vehicle Model:</b> ${model} <br/>
                                          <b>Vehicle Color:</b> ${color} <br/>
                                          <b>Service Type:</b> ${service_type} <br/>
                                          <b>Location Origin:</b> ${start_address} <br/>
                                          <b>Location Destination:</b> ${end_address} <br/>
                                          <b>Amount:</b> $ ${amount} <br/>
                                          <b>Time of Payment:</b> ${date_paid} (Central Daylight Time)<br/>
                                          <b>VIN:</b> Not Provided <br/>
                                        </p>                                        
                                      </td>
                                    </tr>                                    
                                    <tr>
                                      <td>
                                        <p>Thank you <br/>Dispatch Team</p>                                        
                                        <p>
                                          Roadside Assistance Limited <br/>
                                          3753 Howard Hughes Parkway <br/>
                                          Suite 200 <br/>
                                          Las Vegas, NV 89169 <br/>
                                          <img src="${process.env.PAYMENTLINK}images/logo.png" height="65" width="90" />
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                  </html>
        `;

        if (status === 'Paid') {
          return await sendEmail(payment_email, mail_subject, mail_message, mail_subject);          
        } else {
          console.log('Customer has not paid yet!');
          return false;
        }        
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }

}

const sendPaymentConfirmationSMS = async (invoice_id) => {
  const InvoiceModel = require('../models/Invoice');

  try {
    const response = await InvoiceModel.getInvoiceById(invoice_id);
    console.log(response.result[0].invoice_id);
    if (response.result.length <= 0) {
      return false;
    } else {
      // Get the invoice details
      const info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);

      if (info.result.length <= 0) {
        return false;
      } else {
        const { status, payment_email, first_name, last_name, phone_number, service_type, model, color, make, year, start_address, end_address, amount, date_payment } = info.result[0];
        const paymentUrl = `${process.env.PAYMENTLINK}payment/${invoice_id}`;
        const sms_content = `
        Roadside Assistance: \n\nHi ${first_name},\nWe received your payment of ${amount} for the Service Call you requested to the location you provided.\n\nThis is your Digital Receipt for payment of the Service Call Invoice, # ${invoice_id}.\n\nA service truck is being dispatched to your location now.\nThank you.`;
        return await sendSMS(sms_content, `+1${phone_number}`);
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const sendPaymentLinkEmail = async (invoice_id) => {
  const InvoiceModel = require('../models/Invoice');

  try {
    const response = await InvoiceModel.getInvoiceById(invoice_id);
    console.log(response.result[0].invoice_id);
    if (response.result.length <= 0) {
      return false;
    } else {
      // Get the invoice details
      const info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);

      if (info.result.length <= 0) {
        return false;
      } else {
        const { status, payment_email, first_name, last_name, phone_number, service_type, model, color, make, year, start_address, end_address, amount, date_payment } = info.result[0];
        const paymentUrl = `${process.env.PAYMENTLINK}payment/${invoice_id}`;
        const mail_subject = 'Payment Link For Roadside Assistance';
        const mail_message = `
                    <html>
                    <head>
                      <title>Payment Link For Roadside Assistance</title>
                    </head>
                    <body>
                        <table>
                            <tr>
                                <td>
                                  <table>
                                    <tr>                                
                                      <td>Hello ${first_name},</td>                                  
                                    </tr>
                                    <tr>                                  
                                      <td>
                                      <p>
                                      <b>Invoice Number:</b> ${invoice_id} <br/>                                         
                                      <b>You can pay for your Tow @ this link:</b> ${paymentUrl} <br/>
                                      <b>Service Type:</b> ${service_type} <br/>                                      
                                      <b>Amount:</b> $ ${amount} <br/>                                      
                                    </p>
                                      </td>
                                    </tr>                                    
                                    <tr>
                                      <td>
                                        <p>Thank you <br/>Dispatch Team</p>                                        
                                        <p>
                                          Roadside Assistance Limited <br/>
                                          3753 Howard Hughes Parkway <br/>
                                          Suite 200 <br/>
                                          Las Vegas, NV 89169 <br/>
                                          <img src="${process.env.PAYMENTLINK}images/logo.png" height="65" width="90" />
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                  </html>
        `;
        return await sendEmail(payment_email, mail_subject, mail_message, mail_subject);        
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const resendPaymentLinkEmail = async (invoice_id) => {
  const InvoiceModel = require('../models/Invoice');

  try {
    const response = await InvoiceModel.getInvoiceById(invoice_id);
    console.log(response.result[0].invoice_id);
    if (response.result.length <= 0) {
      return false;
    } else {
      // Get the invoice details
      const info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);

      if (info.result.length <= 0) {
        return false;
      } else {
        const { status, payment_email, first_name, last_name, phone_number, service_type, model, color, make, year, start_address, end_address, amount, date_payment } = info.result[0];
        const paymentUrl = `${process.env.PAYMENTLINK}payment/${invoice_id}`;
        const mail_subject = 'Payment Link For Roadside Assistance';
        const mail_message = `
                    <html>
                    <head>
                      <title>Payment Link For Roadside Assistance</title>
                    </head>
                    <body>
                        <table>
                            <tr>
                                <td>
                                  <table>
                                    <tr>                                
                                      <td>Hello ${first_name},</td>                                  
                                    </tr>
                                    <tr>                                  
                                      <td>
                                        <p><b>You can pay for your service using the following link:</b> ${paymentUrl}</p>                                                                               
                                      </td>
                                    </tr>                                    
                                    <tr>
                                      <td>
                                        <p>Thank you <br/>Dispatch Team</p>                                        
                                        <p>
                                          Roadside Assistance Limited <br/>
                                          3753 Howard Hughes Parkway <br/>
                                          Suite 200 <br/>
                                          Las Vegas, NV 89169 <br/>
                                          <img src="${process.env.PAYMENTLINK}images/logo.png" height="65" width="90" />
                                        </p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                  </html>
        `;
        return await sendEmail(payment_email, mail_subject, mail_message, mail_subject);        
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

const checkLocalTime = async (lat, lng) => {
  const loc = `${lat},${lng}`; // Tokyo expressed as lat,lng tuple
  const targetDate = new Date(); // Current date/time of user computer
  const timestamp = targetDate.getTime()/1000 + targetDate.getTimezoneOffset() * 60; // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
  const apikey = process.env.GOOGLEAPIKEY;
  const apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey;

  try {
    console.log('Timezone API call');
    let response = await request.get(apicall);
    response = JSON.parse(response);
    console.log('Response');
    console.log(response);

    if (response.status == 'OK'){
      console.log(response.status);
      const offsets = response.dstOffset * 1000 + response.rawOffset * 1000; // get DST and time zone offsets in milliseconds
      const localdate = new Date(timestamp * 1000 + offsets); // Date object containing current time of Tokyo (timestamp + dstOffset + rawOffset)
      console.log(`Current time: ${localdate.getHours()} Hrs ${localdate.getMinutes()} mins`);
      return {
        'hour': localdate.getHours(),
        'min': localdate.getMinutes()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.log('Timezone API error');
    console.log(error);
  }  
}

const calculateDistance = async (origin, destination) => {
  const apikey = process.env.GOOGLEAPIKEY;
  const apicall = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${origin}&destinations=${destination}&key=` + apikey;

  try {
    console.log('Distance API call');
    let response = await request(apicall);
    response = JSON.parse(response);
    console.log('Response');
    console.log(response);

    if (response.status == 'OK'){
      console.log(response.status);      
    } else {
      return null;
    }
  } catch (error) {
    console.log('Distance API error');
    console.log(error);
  } 
}

const callDispatcherAPI = async (invoice_id) => {
  // Get invoice info
  const invoice_info = await InvoiceModel.getInvoiceByInvoiceId(invoice_id);            

  // Caller Object            
  const caller_info = await UserModel.getUserById(invoice_info.result[0].user_id);

  console.log(invoice_info, caller_info);

  const callerObject = {
      firstName: caller_info.result[0]['first_name'], // (string),
      lastName: caller_info.result[0]['last_name'], // (string),
      phone1: caller_info.result[0]['contact_no'], // (string),
  };

  // Customer Object
  const customerObject = {
      customerNo: invoice_info.result[0]['invoice_id'], // (string),
      companyCode: '2630', //(string, optional): This is the Road America Associated Company Code. This field is only required if you have more than one Road America company code. ,
      programCode: 'AA', // (string): You Road America Associated Program Code ,
      firstName: invoice_info.result[0]['first_name'], // (string),
      lastName: invoice_info.result[0]['last_name'], // (string),
      address: '', //(string, optional),
      city: '', // (string, optional),
      state: '', // (string, optional),
      zipCode: '', // (string),
      country: '', // (string, optional),
      phone: invoice_info.result[0]['phone_number'], // (string, optional),
      statusCode: 'N', // (string): Get it from "Customer Status" lookup ,
      // effectiveDate:  (string, optional): Format: MM/dd/yyyy ,
      // expirationDate (string, optional): Format: MM/dd/yyyy
  };

  // Vehicle Object            
  const vehicleObject = {
      class: 'LD', // (string): Get it from "vehicleclassestypes" lokup. If vehicle type is truck, this field must be the code selected from "Truck Weight Ranges" lookups. for any other vehicle type this field must be the class obtained from "vehicles" lookup. ,
      type: 'AU', // (string): Get it from "vehicleclassestypes" lokup ,
      make: invoice_info.result[0]['make'], // (string),
      model: invoice_info.result[0]['model'], // (string, optional),
      color: invoice_info.result[0]['color'], // (string),
      year: parseInt(invoice_info.result[0]['year']), // (integer),
      vin: '', // (string, optional),
      weight: 0, // (number, optional),
      currentMileage: 1, // (integer),
      effectiveMileage: '', // (string, optional),
      expirationMileage: '', // (string, optional)
  };

  // Services Object
  let serviceType = '',
      serviceCode = [];

  switch (invoice_info.result[0]['service_type']) {
      case 'Fuel / Fluids':
          serviceType = 'FL';
          serviceCode = [1,2,3,4,5,6];
          break;
      case 'Jump Start':
          serviceType = 'JS';
          serviceCode = [1,2,3];
          break;
      case 'Lockout':
          serviceType = 'LO';
          serviceCode = [1,2,3];
          break;
      case 'Towing':
          serviceType = 'ME';
          serviceCode = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
          break;
      case 'Tire Change':
          serviceType = 'TC';
          serviceCode = [1,2,3];
          break;
  };

  const servicesObject = {
      type: serviceType, // (string): "Type" obtained from "Service Types" lookup. ,
      isPrimary: true, // (boolean): Only one service can be the primary ,
      details: serviceCode, // (Array[integer]): Array of service details codes. Get the codes from "ServiceType Details" lookup. ,
      otherSpecified: '', // (string, optional): Only for "Jump Start" or "Tow" Services and only when the Service Detail Description is "Other" ,
      isDiesel: false, // (boolean): Only for "Fuel/Fluids" Service ,
      manualRelease: (serviceType === 'LO' ? true : false), // (boolean): Only for "Lockout" Service ,
      powerRelease: (serviceType === 'LO' ? true : false), // (boolean): Only for "Lockout" Service ,
      noRelease: (serviceType === 'LO' ? true : false), // (boolean): Only for "Lockout" Service ,
      dualTires: (serviceType === 'TC' ? true : false), // (boolean): Only for Tire Change Service. ,
      flatBedRequested: (serviceType === 'ME' ? true : false), // (boolean, optional): Only for "Towing" Service ,
      distanceFromRoad: 0, // (number, optional): Only for "Winching" Service ,
      stuckUnit: 0, // (integer, optional): Only for "Winching" Service. Code obtained from "Vehicle Stuck Units" lookup ,
      stuckIn: 0, // (integer, optional): Only for "Winching" Service. Code obtained from "Vehicle Stuck Options" lookup ,
      stuckDeep: 0, // (number, optional): Only for "Winching" Service.
  };

  // Breakdown Object
  const origin_location = invoice_info.result[0]['origin_latlng'].split(',');

  const breakdownObject = {
      address: invoice_info.result[0]['start_address'], // (string),
      city: '', // (string),
      state: '', // (string),
      zipCode: invoice_info.result[0]['origin_zipcode'], // (string),
      country: 'US', // (string),
      latitude: parseFloat(origin_location[0]), // (number),
      longitude: parseFloat(origin_location[1]), // (number)
  };

  // Breakdown Location Object
  let bdloType = '';
  switch (invoice_info.result[0]['pickup_location']) {
      case 'House':
          bdloType = '1';
          break;
      case 'Business':
          bdloType = '10';
          break;
      case 'Highway':
          bdloType = '16';
          break;
      case 'Apartment':
          bdloType = '7';
          break;
  }

  const breakdownLocationObject = {
      type: bdloType, // (string, optional): Code obtained from "Location Types" lookup (level1) ,
      spec1: '', // (string, optional): Code obtained from "Location Types" lookup (level2) ,
      spec2: '', // (string, optional): Code obtained from "Location Types" lookup (level3) ,
      additionalInfo: invoice_info.result[0]['notes'], // (string, optional): Any additional information.
  };

  // Destination Object
  const destination_location = invoice_info.result[0]['destination_latlng'].split(',');

  const destinationObject = {
      businessCode: '', // (string, optional),
      businessName: '', // (string, optional),
      address: invoice_info.result[0]['end_address'], // (string),
      city: '', // (string),
      state: '', // (string),
      zipCode: invoice_info.result[0]['destination_zipcode'], // (string),
      country: 'US', // (string),
      latitude: parseFloat(destination_location[0]), // (number),
      longitude: parseFloat(destination_location[1]), // (number)
  }

  // Call the dispatcher API
  const dispatchObject = {
      // poNumber (string): This field is required only if a PO was previously created. ,
      tollFreeNumber: '', // (string, optional),
      isCustomerSafe: true, // (boolean),
      additionalInformation: '', // (string, optional),
      issuingDealerDestination: false, // (boolean, optional): Only useful when "Tow" Service is requested. This specify if the vehicle will be towed to the issuing dealer. Default value is false ,
      caller: callerObject, // (caller, optional),
      customer: customerObject, // (customer),
      vehicle: vehicleObject, // (vehicle),
      services: servicesObject, // (Array[service]),
      breakdownAddress: breakdownObject, // (breakdownAddress),
      breakdownLocationInfo: breakdownLocationObject, // (breakdownLocationInfo, optional),
      destinationAddress: destinationObject, // (destinationAddress, optional): Only required when "Tow" Service is requested.
  }
  
  return dispatchObject;
} 

module.exports = { 
                    sendSMS, 
                    sendEmail, 
                    checkLocalTime, 
                    calculateDistance, 
                    sendPaymentConfirmationEmail,
                    sendPaymentConfirmationSMS,
                    sendPaymentLinkEmail,
                    resendPaymentLinkEmail,
                    sendPaymentLinkSMS,
                    callDispatcherAPI
                  };