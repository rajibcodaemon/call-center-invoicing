import React, { useState, useContext, useEffect } from "react";
import { CSVLink, CSVDownload } from "react-csv";
import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import Pagination from "./user-pagination";
import SortingIcon from "../../components/sortingicon/sortingicon";
import { Row, Col, Button, Container, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

import AuthContext from '../../context/auth/authContext';
import UserContext from '../../context/user/userContext';

function Users(props) {
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);
  const { users, csv_data, fetch_page, per_page, sort_by, sort_order, search_term, total_page, loading } = userContext;

  const list_users = () => {    
    return users.map( (user, index) => (
      <React.Fragment key={user.id}>
        <Link style={{ textDecoration: 'none' }} to={`/edit-user/${user.id}`}>
          <div className="table-body">
            <div className="check-box-area">
              <label className="custom-checkbox">
                <input 
                  type="checkbox"
                  id={`user_${index}`}
                />
                <span className="checkmark" />
              </label>
            </div>
            <div className="fname">{user.first_name}</div>
            <div className="lname">{user.last_name}</div>
            <div className="email">{user.email_id}</div>
            <div className="phone">{user.contact_no}</div>
            <div className="dispatching-system">            
              <Button onClick={handleToggleUserStatus} variant={ user.status === 1 ? 'success' : 'danger' } size="sm" key={user.id} primary={user.id} status={user.status}>
                {user.status === 1 ? 'Block' : 'Unblock' }
              </Button>
            </div>
            <div className="edit">
              <Link to={`/edit-user/${user.id}`}><i className="fa fa-pencil" aria-hidden="true" /></Link>
              {/* <a onClick={handleEdit} datakey={user.id} ><i datakey={user.id} className="fa fa-pencil" aria-hidden="true" /></a> */}
            </div>
          </div>
        </Link>
      </React.Fragment>
    ));    
  }

  const [searchTerms, setSearchTerms] = useState(search_term);

  const handleSearchTermsChange = (e) => {
    setSearchTerms(e.target.value);
  }

  const handleEdit = (e) => {
    e.preventDefault();
    console.log('Handle edit: ', e.target.getAttribute('datakey'));
    const dataKey = e.target.getAttribute('datakey');
    userContext.info_user(dataKey);
    window.setTimeout(() => (props.history.push(`/edit-user/${dataKey}`)), 2000);
  }

  const handleToggleUserStatus = async (e) => {
    e.preventDefault();
    const user_id = e.target.getAttribute('primary');
    const user_status = e.target.getAttribute('status');
    const new_status = (user_status === '1') ? 0 : 1;    
    const values = {id: user_id, status: new_status};
    authContext.refreshSpinnerLoading(true);
    // userContext.toggle_loader(true);
    const user_update = await userContext.update_status(values);    
    const user_result = await userContext.get_users(fetch_page, per_page, sort_by, sort_order, search_term);
    authContext.refreshSpinnerLoading(false);
  }

  const handleSearchTermsSubmit = async (e) => {
    e.preventDefault();
    authContext.refreshSpinnerLoading(true);
    const page_no = 1;
    userContext.toggle_loader(true);
    userContext.update_search_terms(searchTerms);
    userContext.update_fetch_page(page_no);
    const user_result = await userContext.get_users(page_no, per_page, sort_by, sort_order, searchTerms);
    authContext.refreshSpinnerLoading(false);
  };

  const handleSearchTermsReset = async (e) => {
    e.preventDefault();
    authContext.refreshSpinnerLoading(true);
    const page_no = 1;
    setSearchTerms('');
    userContext.update_search_terms('');        
    userContext.toggle_loader(true);    
    userContext.update_fetch_page(page_no);
    const user_result = await userContext.get_users(page_no, per_page, sort_by, sort_order, '');
    authContext.refreshSpinnerLoading(false);
  }

  const [mainCheckbox, setMainCheckbox] = useState(false);

  const handleMainCheckboxChange = (e) => {
    setMainCheckbox(!mainCheckbox);
    // Make the checkboxes checked or unchecked    
    const total_checkbox = users.length;
    for (let i = 0; i < total_checkbox; i++) {
      document.getElementById(`user_${i}`).checked = !mainCheckbox;
    }
    
  }

  const handlePagination = () => {
    if (total_page > 0) {
      return <Pagination />;
    } else {
      return null;
    }
  }

  const handleSortOrder = async (sortBy, sortOrder) => {
    authContext.refreshSpinnerLoading(true);
    userContext.update_sort_order({sortBy, sortOrder});
    const user_result = await userContext.get_users(fetch_page, per_page, sortBy, sortOrder, search_term);
    authContext.refreshSpinnerLoading(false);
  }

  useEffect(() => {
    authContext.refreshSpinnerLoading(true);
    userContext.clear_error();
    userContext.clear_success();
    const fetchUserData = async () => {
      const user_result = await userContext.get_users(fetch_page, per_page, sort_by, sort_order, search_term);
      authContext.refreshSpinnerLoading(false);
    }
    fetchUserData(); 
    //eslint-disable-next-line
  }, []);

  // For unmount
  useEffect( () => () => {
    console.log("unmount user list");
    userContext.clear_user_list();    
  }, [] );

  return (
    <React.Fragment>
      {/* <Header loading={loading} />
      <Container fluid={true} className="content-area">
        <Row className="main-content">
          <Col md={3} className="align-self-stretch">
            <Sidebar />
          </Col>
          <Col md={9} className="right-part"> */}
            <div className="data-table-area">
              <header>
                <Row className="align-items-center">
                  <Col md={8}>
                    <form className="search-area" onSubmit={handleSearchTermsSubmit}>
                      <input
                        className="form-control mr-sm-2"
                        type="text"
                        placeholder="Search"
                        aria-label="Search"
                        name="user_search"
                        value={searchTerms}
                        onChange={handleSearchTermsChange}
                      />
                      {
                        !loading ? (
                          <button
                            className="btn btn-danger my-2 my-sm-0"
                            type="submit"
                            >
                            <i className="fa fa-search" aria-hidden="true" />
                          </button>) : (
                          <button className="btn btn-danger my-2 my-sm-0" type="button" disabled>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                            />
                            <span className="sr-only">Loading...</span>
                          </button>
                        )
                      }
                      <button
                        className="btn btn-primary my-2 my-sm-0"
                        type="button"
                        style={{
                          marginLeft: '5px'
                        }}
                        onClick={handleSearchTermsReset}
                        >
                        Reset Search
                      </button>
                    </form>
                  </Col>
                  <Col className="text-right export">
                    {
                      csv_data ? (
                        <CSVLink
                          data={csv_data}
                          filename={"towCallAgents.csv"}
                          className=""
                          style={{
                            color: '#dd2d3e'
                          }}
                          target="_blank"
                        >
                          Export <i className="fa fa-share" aria-hidden="true" />                      
                        </CSVLink>
                      ) : (
                        <React.Fragment>Export <i className="fa fa-share" aria-hidden="true" /></React.Fragment>
                      )
                    }                   
                  </Col>
                  <Col className="text-right">
                    <Link to="/create-new-user">
                      <Button variant="primary" className="create-new-user">
                        Create New User
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </header>
              <div className="hr-scroll">
                <div className="table-content">
                  <header>
                    <div className="check-box-area">
                      <label className="custom-checkbox">
                        <input 
                          type="checkbox"                          
                          onChange={handleMainCheckboxChange}
                        />
                        <span className="checkmark" />
                      </label>
                    </div>
                    <div className="fname">
                      First Name <SortingIcon workAction={(sort_by == 'first_name') ? true : false} sortBy={'first_name'} handleSortOrderClick={handleSortOrder} sortOrder={sort_order} />
                    </div>
                    <div className="lname">
                      Last Name <SortingIcon workAction={(sort_by == 'last_name') ? true : false} sortBy={'last_name'} handleSortOrderClick={handleSortOrder} sortOrder={sort_order} />
                    </div>
                    <div className="email">Email</div>
                    <div className="phone">Phone Number</div>
                    <div className="dispatching-system">&nbsp;</div>
                    <div className="edit">&nbsp;</div>
                  </header>
                  { 
                    users.length > 0 ? list_users() : (<div style={{ color: '#000' }}>No records found!</div>)
                  }
                </div>
              </div>
              { handlePagination() }
            </div>
          {/* </Col>
        </Row>
      </Container> */}
    </React.Fragment>
  );
}

export default Users;
