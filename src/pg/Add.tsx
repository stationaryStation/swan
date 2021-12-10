import React from 'react';
import BTN from '../ui/button';
import './add.css';

function Add() {
  return(
    <div>
      <h1 className="title">Add Event</h1>
      <BTN type="button-primary" text="Create" />
    </div>
  )
}

export default Add;
