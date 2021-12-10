import React from 'react';
import './nav.css';
import { Outlet , Link } from 'react-router-dom';
function Nav() {
  return (
  <div>
    <nav>
    <ul>
        <Link to={"./Add"}>
          <li><a>Add Event</a></li>
        </Link>
        <Link to={"/"}>
          <li><a>Go Back</a></li>
        </Link>
    </ul>
    </nav>
    <Outlet />
  </div>
  );
}

export default Nav;
