import React, { useReducer, useContext } from 'react';
import axios from 'axios';

import {
  INVOICE_LIST,
  INVOICE_NUMBER,
  INVOICES_CLEAR,
  INVOICE_ERROR,
  SERVER_URL,
  INVOICE_PERPAGE,
  INVOICE_FETCHPAGE,
  INVOICE_SEARCHTERM,
  INVOICE_SORTORDER,
  USER_SAVE,
  CLEAR_SUCCESS,
  CLEAR_ERROR,
  INVOICE_INFO,
  INVOICE_CLEAR,
  INVOICE_UPDATE,
  INVOICE_SAVE,
  INVOICE_LOADING,
  INVOICE_SENDLINK,
  INVOICE_SENDRECEIPT,
  INVOICE_LINKLOADING
} from '../Types';
import InvoiceContext from './invoiceContext';
import InvoiceReducer from './invoiceReducer';

const InvoiceState = (props) => {
  const initialState = {
    invoices: [],
    invoice: null,
    invoice_number: null,    
    csv_data: null,
    sort_by: 'invoice_id',
    sort_order: 'DESC',
    search_term: '',
    fetch_page: 1,
    per_page: 10,
    total_page: 0,
    error: null,
    success: null,
    loading: false,
    linkloading: false
  };

  const [state, dispatch] = useReducer(InvoiceReducer, initialState);

  const get_invoices = async (fetch_page, per_page, sort_by, sort_order, search_term) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      sort_by,
      sort_order,
      search_term,
      fetch_page,
      per_page
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order`, formData, config);
      
      if (response) {
        dispatch({
          type: INVOICE_LIST,
          payload: response.data
        });
        return true;
      }
    } catch (error) {
      console.log('Invoice list error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
      return true;
    }
  }

  const get_invoice_number = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {};
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/order/getInvoiceNumber`, formData, config);
      
      dispatch({
        type: INVOICE_NUMBER,
        payload: response.data
      });
    } catch (error) {
      console.log('Invoice number error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const save_invoice = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order/saveinvoice`, formData, config);
      
      if (formData.draft === 1){
        // Re populate the invoice number for next invoice
        get_invoice_number();
      } else {
        dispatch({
          type: INVOICE_SAVE,
          payload: response.data
        });
      }      
    } catch (error) {
      console.log('Invoice save error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const get_invoice_info = async (invoice_id) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {};
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/order/${invoice_id}`, formData, config);
      
      dispatch({
        type: INVOICE_INFO,
        payload: response.data
      });
    } catch (error) {
      console.log('Invoice info error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const update_invoice = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order/updateinvoice`, formData, config);
      
      dispatch({
        type: INVOICE_UPDATE,
        payload: response.data
      });
    } catch (error) {
      console.log('Invoice update error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const resend_invoice = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order/resendlink`, formData, config);
      
      dispatch({
        type: INVOICE_SENDLINK,
        payload: response.data
      });
    } catch (error) {
      console.log('Invoice resend error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const resend_receipt = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order/resendreceipt`, formData, config);
      
      dispatch({
        type: INVOICE_SENDRECEIPT,
        payload: response.data
      });
    } catch (error) {
      console.log('Invoice resend error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const get_invoice_price = async (data) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const formData = {
      ozip: data.ozip,
      dzip: data.dzip,
      oaddress: data.originaddress,
      daddress: data.destinationaddress,
      servicetype: data.servicetype,
      lat: data.origin.lat,
      lng: data.origin.lng,
      addlcharges: data.additionalprice
    };
    
    try {
      const response = await axios.post(`${SERVER_URL}/api/order/pricing`, formData, config);
      return response;
    } catch (error) {
      console.log('Invoice price error');
      console.log(error);
      dispatch({
        type: INVOICE_ERROR,
        payload: error.response.data.errors
      });
    }
  }

  const clear_invoice_list = async () => {
    dispatch({
      type: INVOICES_CLEAR      
    });
  }

  const clear_invoice = async () => {
    dispatch({
      type: INVOICE_CLEAR      
    });
  }

  const update_search_terms = async (value) => {
    dispatch({
      type: INVOICE_SEARCHTERM,
      payload: value
    });
  }

  const update_fetch_page = async (value) => {
    dispatch({
      type: INVOICE_FETCHPAGE,
      payload: value
    });
  }

  const update_per_page = async (value) => {
    dispatch({
      type: INVOICE_PERPAGE,
      payload: value
    });
  }

  const update_sort_order = async (value) => {
    dispatch({
      type: INVOICE_SORTORDER,
      payload: value
    });
  }

  const toggle_loader = async (value) => {
    dispatch({
      type: INVOICE_LOADING,
      payload: value
    });
  }

  const toggle_link_loader = async (value) => {
    dispatch({
      type: INVOICE_LINKLOADING,
      payload: value
    });
  }

  const clear_success = () => dispatch({ type: CLEAR_SUCCESS });

  const clear_error = () => dispatch({ type: CLEAR_ERROR });

  return <InvoiceContext.Provider
    value={{
      invoices: state.invoices,
      invoice_number: state.invoice_number,
      invoice: state.invoice,
      csv_data: state.csv_data,
      sort_by: state.sort_by,
      sort_by: state.sort_by,
      sort_order: state.sort_order,
      search_term: state.search_term,
      fetch_page: state.fetch_page,
      per_page: state.per_page,
      total_page: state.total_page,
      error: state.error,
      success: state.success,
      loading: state.loading,
      linkloading: state.linkloading,
      get_invoices,
      clear_invoice_list,
      update_search_terms,
      update_fetch_page,
      update_per_page,
      update_sort_order,
      get_invoice_info,
      clear_invoice,
      update_invoice,
      toggle_loader,
      resend_invoice,
      resend_receipt,
      toggle_link_loader,
      get_invoice_price,
      get_invoice_number,
      save_invoice,
      clear_success,
      clear_error
    }}
  >
    { props.children }
  </InvoiceContext.Provider>
}

export default InvoiceState;