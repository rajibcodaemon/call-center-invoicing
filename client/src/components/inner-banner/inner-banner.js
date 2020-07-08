import React from "react";
import innerBanner from "../../assets/img/dashboard-banner.jpg";
import "./inner-banner.scss";

function InnerBanner() {
  return (
    <div className="inner-banner">
      <figure>
        <img src={innerBanner} alt="roadside assistance"/>
        <figcaption>
          <h1>Roadside Assistance</h1>
        </figcaption>
      </figure>
    </div>
  );
}

export default InnerBanner;
