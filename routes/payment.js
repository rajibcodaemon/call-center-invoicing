const express = require('express');
const InvoiceModel = require('../models/Invoice');
const PaymentModel = require('../models/Payment');
const UserModel = require('../models/User');
const fetch = require('node-fetch');
var md5 = require('md5');
const router = express.Router();
const date = require('date-and-time');

const { sendPaymentConfirmationEmail, callDispatcherAPI } = require('../helpers/helpers');

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
    const unique_ref = req.query.UNIQUEREF;
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

    const paymentResponseStored = await PaymentModel.getPaymentResponseExists(invoice_id, unique_ref);

    if (paymentResponseStored.result.length == 0) {
        const payment = await PaymentModel.savePaymentResponse(newPaymentResponse);
        var phraseResponseText = approval_code;
        var responsePhrase = phraseResponseText.indexOf('OK') !== -1 ? true : false;

        if (responsePhrase && (response_code == 'A' || response_code == 'E')) {

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
        } else {
            contextFlag = 2;
            responseText = "Payment Failed";
        }

        res.render('payment/payment-response', {
            responseText,
            contextFlag
        });

    } else {
        contextFlag = 3;
        responseText = "Payment already processed";
        res.render('payment/payment-response', {
            responseText,
            contextFlag
        });
    }
});

router.get('/:invoicenumber', async (req, res) => {
    const invalidInvoice = "Invalid Invoice Number";
    const invoice_number = req.params.invoicenumber;
    if (invoice_number != 0 && invoice_number != '' && invoice_number < 1011290101) {
        res.render('payment/invoice-not-found', {
            invalidInvoice
        });
    }
    const isResponse = await InvoiceModel.getInvoiceById(invoice_number);
    const timeNow = new Date();
    if (isResponse.error) {
        res.render('payment/invoice-not-found', {
            invalidInvoice
        });
    } else if (isResponse.result && isResponse.result.length > 0) {
        const invoice_data = await InvoiceModel.getInvoiceByInvoiceId(invoice_number);

        if (invoice_data.result && invoice_data.result[0].status === 'Paid') {
            contextFlag = 3;
            responseText = "Payment already processed";
            return res.render('payment/payment-response', {
                responseText,
                contextFlag,
                invoice_id: invoice_number
            });
        } else {
            const response = await InvoiceModel.getInvoiceByInvoiceId(invoice_number);
            const time_differ = diff_minutes(response.result[0].date_edit_timestamp, timeNow);
            const amount = Number(response.result[0].amount).toFixed(2);
            const conv_amount = 3.5;
            const sub_total_deduct = Number((response.result[0].amount * conv_amount) / 100).toFixed(2);
            const sub_total = Number(amount - sub_total_deduct).toFixed(2);;

            // Anywherecommerce payment parameters
            const CURRENCY = 'USD';
            const ORDERID = invoice_number;
            const AMOUNT = amount;
            const DATETIME = date.format(response.result[0].date_edit_timestamp, 'DD-MM-YYYY:HH:MM:SS:SSS');
            const RECEIPTPAGEURL = `${process.env.PAYMENTLINK}receipt/payment-status/`;
            const HASH = md5(TERMINALID + ORDERID + AMOUNT + DATETIME + RECEIPTPAGEURL + secret);
            const PAYMENTFORMLINK = process.env.PAYMENTFORMLINK;

            if (response.error) {
                return res.status(500).json({
                    errors: [{
                        msg: 'Internal server error!'
                    }]
                });
            } else if (time_differ > 10) {
                res.render('payment/expired', {
                    time_differ,
                    invoice_number
                });
            } else {
                res.render('payment/index', {
                    response: response.result,
                    sub_total_deduct,
                    sub_total,
                    HASH,
                    DATETIME,
                    AMOUNT,
                    RECEIPTPAGEURL,
                    TERMINALID,
                    PAYMENTFORMLINK
                });
            }
        }
        
    } else {
        res.render('payment/invoice-not-found', {
            invalidInvoice
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