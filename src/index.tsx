import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import Add from './pg/Add'
import { BrowserRouter, Routes, Router, Route } from 'react-router-dom';
ReactDOM.render(
<BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} >
      <Route path="add" element={<Add />} />
    </Route>
  </Routes>
</BrowserRouter>,
  document.getElementById("root")
);
