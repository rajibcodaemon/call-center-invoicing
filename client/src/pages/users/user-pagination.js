import React, { useContext } from 'react';
import './pagination.scss';

import UserContext from '../../context/user/userContext';

function Pagination(){
  const userContext = useContext(UserContext);
  const {fetch_page, per_page, sort_by, sort_order, search_term, total_page} = userContext;
  
  const handleChange = (e) => {    
    userContext.update_per_page(e.target.value);
    userContext.get_users(fetch_page, e.target.value, sort_by, sort_order, search_term);
  }

  const handlePageChange = (e) => {
    e.preventDefault();
    const page_no = parseInt(e.target.getAttribute('page'));
    userContext.update_fetch_page(page_no);
    userContext.get_users(page_no, per_page, sort_by, sort_order, search_term);
  }

  const page_jsx = [];

  const generatePages = () => {     
    if (fetch_page > 1) {
      page_jsx.push(<li key={0} onClick={handlePageChange} page={ (fetch_page - 1) }>Prev</li>);
    }

    // Generate pages
    for (let i = 1; i <= total_page; i++) {
      let link_jsx = null;
      let class_name = 'number';      

      if (i === fetch_page) {
        class_name = 'active';
        link_jsx = (
          <li 
            key={i} 
            className={class_name}
            page={i}            
          >{i}</li>
        );
      } else {
        link_jsx = (
          <li 
            key={i} 
            className={class_name}
            page={i}
            onClick={handlePageChange}
          >{i}</li>
        );
      }
      
      page_jsx.push(link_jsx);
    }
    
    if (fetch_page < total_page) {
      page_jsx.push(<li key={ (total_page + 1) } onClick={handlePageChange} page={ (fetch_page + 1) }>Next</li>);
    }

    return page_jsx;
  }

  const list_per_page = () => {
    const options = [10, 20, 30];

    return options.map(option => (
            <option
              key={option}
              value={option}              
            >
              {option}
            </option>
          ));
  }
  return(
    <div className="pagination-area">
      <div className="rows-area">
        <p>Rows per page 
          <select value={per_page} onChange={handleChange}>
            { list_per_page() }
          </select>
        </p>
      </div>
      <div className="pagination-in">
        <p>Page {fetch_page} of {total_page}</p>
        <ul>          
          { generatePages() }          
        </ul>
      </div>
    </div>
  );
};

export default Pagination;