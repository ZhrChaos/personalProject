import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import Messages from '../Messages/Messages'
import Guilds from '../Guilds/Guilds'
import '../Channel/channel.css'
import menu from './menu.svg'
import exit from './exit.svg'
import io from 'socket.io-client';


const socket = io()



class Channel extends Component {
  constructor() {
    super()
    this.state = {
      message: '',
      messages: [],
      guilds: [],
      guild: null
    }

    socket.on("generalMessage", (data) => {
      console.log(data)
      let m = this.state.messages.slice()
      console.log(m)
      // m.filter()
      m.push(data)
      this.setState({ messages: m })
    })

    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.updateMessages = this.updateMessages.bind(this)
  }

  scrollToBottom() {
    this.el.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" })
  }

  componentDidMount() {
    this.updateMessages()

    axios.get(`/api/guilds`)
      .then(res => {
        this.setState({ guilds: res.data })
        this.setState({ guild: res.data[0].guild_id })
        console.log(res.data[0].guild_id)
      })

    this.scrollToBottom();
  }

  updateMessages() {
    axios.get(`/api/messages`)
      .then(res => {
        let data = res.data
        let messages = data.filter(el => el.guild_id === this.state.guild)
        this.setState({ messages: messages })
      })
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleChange(e) {
    this.setState({ message: e.target.value })
  }

  handleKeyup(e) {
    if (e.key === "Enter") {
      socket.emit("newMessage", {
        message: this.state.message,
        roomId: this.state.guild
      })
      this.updateMessages()
      console.log(this.state.message)
      e.target.value = ''
    }
  }

  openNav() {
    this.guilds.style.width = "325px"
  }
  closeNav() {
    this.guilds.style.width = "0"
  }

  joinRoom(room) {
    this.setState({ guild: room })
    socket.emit("join-room", { roomName: room })
    this.updateMessages()
    this.closeNav()
  }


  render() {
    // console.log(this.state.messages)
    return (
      <div className='app-window'>
        <section className='guild-channels' ref={el => { this.guilds = el }}>
          <div className='channel-select-window'>
            <div className='guild-name-bar'>
              <div>Guild name here</div>
              <img src={exit} alt="Close" className="closebtn" onClick={() => this.closeNav()} />
            </div>
            <ul className='channels'>
              {this.state.guilds.map((guild, i) => (
                <Guilds key={i} guild={guild} joinRoom={this.joinRoom} />
              ))}
            </ul>
            <div className='user-bar'></div>
          </div>
        </section>
        <section className='channel-window'>
          <nav className='channel-bar'>
            <img src={menu} alt="menu" onClick={() => this.openNav()} />
            <h1 className='channel-name'>
              Channel Name Here
            </h1>
          </nav>
          <div className='messages-window'>
            <ul className='messages-box' ref={el => { this.el = el; }}>
              {this.state.messages.map((message, i) => (
                <Messages key={i} message={message} />
              ))}
            </ul>
          </div>
          <div className='bottom-bar'>
            <input onChange={(e) => this.handleChange(e)} onKeyUp={(e) => this.handleKeyup(e)}></input>
          </div>
        </section>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    messages: state.messages
  }
}

export default connect(mapStateToProps)(Channel)