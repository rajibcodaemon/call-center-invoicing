import React, { useState, useContext, useEffect, Fragment } from "react";
import "./sidebarnav.scss";
import { NavLink, Link } from "react-router-dom";

import AuthContext from "../../context/auth/authContext";

function SidebarNav() {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const [collapseMenu, setCollapseMenu] = useState(true);
  const [iconClass, setIconClass] = useState('icon-only');

  const loadUserMenu = () => {
    if (user && user.role_id === 1) {
      return (
        <li>
          <NavLink activeClassName="active" to="/users">
            <i className="fa fa-user" aria-hidden="true" />
            <span>Users</span>
          </NavLink>
        </li>
      );
    }
  };

  const handleMenuCollapse = (e) => {    
    const newState = !collapseMenu;
    setCollapseMenu(newState);
    if (newState === true) {
      setIconClass('icon-only');
      authContext.collapseMenuCol(newState);
    } else {
      setIconClass('');
      authContext.collapseMenuCol(newState);
    }    
  }

  useEffect(() => {
    loadUserMenu();
  }, [user]);

  return (
    <Fragment>
      <div className={ collapseMenu ? 'navToggleIconFalse' : 'navToggleIcon' }>
        <i onClick={handleMenuCollapse} className={ collapseMenu ? 'fa fa-angle-right' : 'fa fa-angle-left' } aria-hidden="true"></i>
      </div>      
      <ul className={`sidebarnav ${iconClass}`}>
        <li>
          <NavLink activeClassName="active" to="/all-purchase-orders">
            <i className="fa fa-file-text-o" aria-hidden="true" />
            <span>All Purchase Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName="active" to="/new-purchase-order">
            <i className="fa fa-pencil" aria-hidden="true" />
            <span>New Purchase Order</span>
          </NavLink>
        </li>
        <li>
          <a rel="noopener noreferrer" href="https://refundlink.roadsideassistanceltd.com/" target="_blank">
            <i className="fa fa-scissors" aria-hidden="true" />
            <span>Refund Request</span>
          </a>
        </li>
        {loadUserMenu()}
      </ul>
    </Fragment>
  );
}

export default SidebarNav;
