import React from "react";
import "./sortingicon.scss";

function SortingIcon(props) {

  const handleSortOrderClick = (e) => {
    // console.log(e.target.getAttribute('order'));
    props.handleSortOrderClick(props.sortBy, e.target.getAttribute('order'));
  }

  let asc_class = '', desc_class = '';

  if (props.workAction != false) {
    if (props.sortOrder === 'ASC') {
      asc_class = 'active';
    } else if (props.sortOrder === 'DESC') {
      desc_class = 'active';
    }
  }  

  return (
    <div className="sortingicon">

      <p className={asc_class}>
        <i className="fa fa-caret-up" aria-hidden="true" order="ASC" onClick={handleSortOrderClick} />
      </p>
      <p className={desc_class}>
        <i className="fa fa-caret-down" aria-hidden="true" order="DESC" onClick={handleSortOrderClick} />
      </p>
    </div>
  );
}

export default SortingIcon;
