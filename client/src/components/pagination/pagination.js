import React from 'react';
import './pagination.scss';

function Pagination(){
  return(
    <div className="pagination-area">
      <div className="rows-area">
        <p>Rows per page 
          <select>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
          </select>
        </p>
      </div>
      <div className="pagination-in">
        <p>1-8 of 100</p>
        <ul>
          <li className="number">
            1
          </li>
          <li className="number">
            2
          </li>
          <li>Next</li>
        </ul>
      </div>
    </div>
  );
};

export default Pagination;