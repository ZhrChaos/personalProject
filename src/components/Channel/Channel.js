import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { updateAccount } from '../../dux/account'
import Messages from '../Messages/Messages'
import Guilds from '../Guilds/Guilds'
import '../Channel/channel.css'
import menu from './menu.svg'
import exit from './exit.svg'
import settings from './settings.svg'
import add from './add.png'
import io from 'socket.io-client';






class Channel extends Component {
  constructor() {
    super()
    this.state = {
      message: '',
      messages: [],
      guilds: [],
      guild: null,
      account: {},
      guildName: ""
    }



    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.updateMessages = this.updateMessages.bind(this)
  }

  scrollToBottom() {
    this.el.scrollIntoView({ behavior: "smooth", block: "end", inline: "end" })
  }

  componentDidMount() {
    this.socket = io()

    this.socket.on("generalMessage", (data) => {
      // console.log(data)
      let m = this.state.messages.slice()
      // console.log(m)
      m.push(data)
      this.setState({ messages: m })
    })

    this.socket.on("refreshMessages", () => {
      this.updateMessages()
    })


    this.updateMessages()

    axios.get(`/api/guilds`)
      .then(res => {
        if (res.data[0]) {
          this.setState({ guilds: res.data })
          this.setState({ guild: res.data[0].guild_id })
          // console.log(res.data[0])
        } else {
          this.props.history.push('/joinguild')
          console.log("No guilds")
        }
      })

    axios.get(`/api/account`)
      .then(res => {
        // console.log(res.data)
        if (!res.data) {
          this.props.history.push("/login")
        } else {
          this.setState({ account: res.data })
          this.props.updateAccount(res.data)
        }

      })

    this.guildDisplay()
    this.updateMessages()
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  updateMessages() {
    // console.log("Updated")
    axios.get(`/api/messages`)
      .then(res => {
        let data = res.data
        let messages = data.filter(el => el.guild_id === this.state.guild)
        this.setState({ messages: messages })
      })
  }


  handleChange(e) {
    this.setState({ message: e.target.value })
    this.updateMessages()
  }

  handleKeyup(e) {
    if (e.key === "Enter") {
      this.socket.emit("newMessage", {
        message: this.state.message,
        roomId: this.state.guild
      })
      this.updateMessages()
      console.log(this.state.message)
      e.target.value = ''
    }
  }

  handleDelete = (e) => {
    this.socket.emit("deleteMessage", (e))
    // this.updateMessages()
  }

  settingsPage() {
    this.props.history.push("/settings")
  }

  createGuildPage() {
    this.props.history.push('/createguild')
  }

  joinGuildPage() {
    this.props.history.push('/joinguild')
  }

  openNav() {
    this.guilds.style.width = "325px"
  }
  closeNav() {
    this.guilds.style.width = "0"
  }

  joinRoom = (room) => {
    this.setState({ guild: room })
    this.socket.emit("join-room", { roomName: room })
    this.updateMessages()
    this.closeNav()
  }

  guildDisplay() {
    let index = this.state.guilds.findIndex(i => i.guild_id === this.state.guild)
    // console.log(index)
    this.setState({ guildName: this.state.guilds[index] })
    // return (this.state.guilds[index])
  }

  // createGuild() {
  //   axios.post('/api/guilds')
  // }


  render() {
    // console.log(this.state.account)
    // console.log(this.state.messages)
    return (
      <div className='app-window'>
        <section className='guild-channels' ref={el => { this.guilds = el }}>
          <div className='channel-select-window'>
            <div className='guild-name-bar'>
              <img src={settings} alt="Settings" className="settingsbtn" onClick={() => this.settingsPage()} />
              <div className="account-bar">
                <div className="account-wrapper">
                  <img src={this.state.account.account_img} alt="Account" className="account-image" />
                </div>
                <div>{this.state.account.account_name}</div>
              </div>
              <img src={exit} alt="Close" className="closebtn" onClick={() => this.closeNav()} />
            </div>
            <ul className='channels'>
              {this.state.guilds.map((guild, i) => (
                <Guilds key={i} guild={guild} joinRoom={this.joinRoom} />
              ))}
            </ul>
            <div className='add-guild-box' onClick={() => this.createGuildPage()}>
              <img src={add} alt="Add Guild" className="addbtn" />
              <div className="add-text">Make a guild</div>
            </div>
            <div className="add-guild-box" onClick={() => this.joinGuildPage()}>
              <img src={add} alt="Find Guild" className="addbtn" />
              <div className="add-text">Find a guild</div>
            </div>
          </div>
        </section>
        <section className='channel-window'>
          <nav className='channel-bar'>
            <img src={menu} alt="menu" onClick={() => this.openNav()} />
            <h1 className='channel-name'>
              Guild Name
            </h1>
          </nav>
          <div className='messages-window'>
            <ul className='messages-box' ref={el => { this.el = el; }}>
              {this.state.messages.map((message, i) => (
                <Messages key={i} message={message} handleDelete={this.handleDelete} />
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
    account: state.account
  }
}

export default connect(mapStateToProps, { updateAccount })(Channel)