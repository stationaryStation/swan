import React from 'react';
import './nav.css';
import { Outlet , Link } from 'react-router-dom';
function Nav() {
  return (
  <div>
    <nav>
    <ul className="topnav">
        <Link to={"./Add"}>
          <li><a>Add Event</a></li>
        </Link>
        <Link to={"/"}>
          <li><a className="active">Home</a></li>
        </Link>
    </ul>
    </nav>
    <Outlet />
  </div>
  );
}

export default Nav;
