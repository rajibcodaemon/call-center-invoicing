const express = require('express');
const InvoiceModel = require('../models/Invoice');
const PaymentModel = require('../models/Payment');
const UserModel = require('../models/User');
const fetch = require('node-fetch');
var md5 = require('md5');
const router = express.Router();
const date = require('date-and-time');

const { sendPaymentConfirmationEmail, sendPaymentConfirmationSMS, callDispatcherAPI } = require('../helpers/helpers');

// Payment Gateway Anywhere Commerce Params
const TERMINALID = process.env.TERMINALID;
const secret = process.env.secret;

router.get('/payment-status', async (req, res) => {
    // Get parameters from payment status redirect url
    const dl_number = req.query.DL_NUMBER;
    const dl_state = req.query.DL_STATE;
    const post_code = req.query.POSTCODE;
    const state = req.query.STATE;
    const invoice_id = req.query.ORDERID; // Invoice Id send with Payment
    const amount = req.query.AMOUNT;
    const region = req.query.REGION;
    const terminal_id = req.query.TERMINALID;
    const city = req.query.CITY;
    const response_text = req.query.RESPONSETEXT;
    const response_code = req.query.RESPONSECODE;
    const approval_code = req.query.APPROVALCODE;
    const avs_response = req.query.AVSRESPONSE;
    const cvv_response = req.query.CVVRESPONSE;
    const date_time = req.query.DATETIME;
    const unique_ref = req.query.UNIQUEREF || '';
    const email = req.query.EMAIL;
    const card_number = req.query.CARDNUMBER;
    const hash = req.query.HASH;
    const total_response = req.protocol + '://' + req.get('host') + req.originalUrl;
    //console.log(total_response);
    var contextFlag = 0;
    var responseText = ''

    let newPaymentResponse = {
        invoice_id,
        dl_number,
        dl_state,
        post_code,
        state,
        region,
        amount,
        terminal_id,
        city,
        response_text,
        response_code,
        approval_code,
        avs_response,
        cvv_response,
        unique_ref,
        email,
        card_number,
        hash,
        total_response,
        date_time
    };

    try {
      const paymentResponseStored = await PaymentModel.getPaymentResponseExists(invoice_id, unique_ref);
      console.log('Payment response ', paymentResponseStored);
      if (paymentResponseStored.result && paymentResponseStored.result.length === 0) {
          var phraseResponseText = approval_code;
          var responsePhrase = phraseResponseText.length === 6 ? true : false;

          if (responsePhrase && (response_code == 'A' || response_code == 'E')) {
              const payment = await PaymentModel.savePaymentResponse(newPaymentResponse);
              // Update Invoice table after successfull payment
              const status = 'Paid';
              let updateInvoice = {
                  invoice_id,
                  status
              };
              const invoicePaymentSatus = await InvoiceModel.updateInvoicePaymentStatus(updateInvoice);

              contextFlag = 1;
              responseText = "Payment Successfully Complete";

              // Call the dispatch helper function

              // Send payment confirmation email
              sendPaymentConfirmationEmail(invoice_id);

              // Send payment confirmation SMS
              sendPaymentConfirmationSMS(invoice_id);
          } else {
              contextFlag = 2;
              responseText = response_text;
          }

          return res.render('payment/payment-response', {
              responseText,
              contextFlag,
              newPaymentResponse
          });

      } else if (paymentResponseStored.result && paymentResponseStored.result.length > 0) {
          contextFlag = 3;
          responseText = "Payment already processed";
          return res.render('payment/payment-response', {
              responseText,
              contextFlag,
              invoice_id
          });
       } 
      // else {
      //   contextFlag = 2;
      //   responseText = "Payment Failed";

      //   return res.render('payment/payment-response', {
      //     responseText,
      //     contextFlag
      //   });  
      // }
    } catch (error) {
      console.log('Payment status error', error);
      contextFlag = 2;
      responseText = "Payment Failed";

      return res.render('payment/payment-response', {
        responseText,
        contextFlag
      });
    }    
});

router.get('/test-payment-email/:invoicenumber', async (req, res) => {
    const invoice_id = req.params.invoicenumber;
    const send = await sendPaymentConfirmationEmail(invoice_id);
});

function diff_minutes(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

module.exports = router;