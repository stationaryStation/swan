import React from 'react';
import './button.css'

function BTN(props){
  return <button type="button" className={props.type}>{props.text}</button>;
}

export default BTN;

