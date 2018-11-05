import React from 'react';
import smallX from './smallX.png'

export default function Messages(props) {
  // console.log(props)
  return (
    <section className="message-section">
      <div>
        <img src={smallX} alt="Exit" className="smallX" onClick={() => props.handleDelete(props.message)} />
      </div>
      < div className="message-container">
        <div className='message-image-container'>
          <img src={props.message.account_img} alt={props.message.account_name} className="message-box-image" />
        </div>
        <div className="content">
          <h1 className="account_name">{props.message.account_name}</h1>
          <h3 className="messages">{props.message.message_content}</h3>
        </div>
      </div >
    </section>
  )
}