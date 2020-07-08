import React from "react";
import "./sidebar.scss";
import SidebarNav from "../sidebarnav/sidebarnav";

function Sidebar() {
  return (
    <aside className="sidebar">
      <SidebarNav />
    </aside>
  );
}

export default Sidebar;
