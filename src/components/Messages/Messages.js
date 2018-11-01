import React from 'react';

export default function Messages(props) {
  // console.log(props)
  return (
    <section className="message-section">
      < div className="message-container">
        <img src={props.message.account_img} alt={props.message.account_name} />
        <div className="content">
          <h1 className="account_name">{props.message.account_name}</h1>
          <h3 className="messages">{props.message.message_content}</h3>
        </div>
      </div >
      <hr className="breakline" />
    </section>
  )
}