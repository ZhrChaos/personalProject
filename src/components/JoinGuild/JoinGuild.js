import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios'
import JoinGuildList from '../JoinGuildList/JoinGuildList'
import './JoinGuild.css'
import backArrow from './backArrow.png'
import settings from './settings.svg'

class JoinGuild extends Component {
      constructor() {
            super()
            this.state = {
                  message: "",
                  guilds: [],
                  account: {}
            }
      }

      handleChange(e) {
            this.setState({ message: e.target.value })
            console.log(this.state.message)
      }

      handleKeyup(e) {
            if (e.key === "Enter") {
                  axios.post('/api/findguild', { message: this.state.message })
                        .then(res => this.setState({ guilds: res.data }))
                  e.target.value = ""
            }
      }

      handleAdd = (id) => {
            axios.put('/api/addguild', { id: id })
                  .then(alert("Added to guild"))
      }

      backArrow() {
            this.props.history.push("/")
      }

      settingsButton() {
            this.props.history.push("/settings")
      }

      render() {
            return (
                  <div className="background-box">

                        <div className="container-join">
                              <div className="top-bar-container">
                                    <img src={backArrow} alt="Back" onClick={() => this.backArrow()} className="back-button" />

                                    <div className="header">Join a Guild</div>
                                    <img src={settings} alt='settings' className="settings-button" onClick={() => this.settingsButton()} />
                              </div>
                              <div className="joinguild-container">
                                    <div className="account-name">{this.props.account.account_name}</div>
                                    <input onChange={(e) => this.handleChange(e)} onKeyUp={(e) => this.handleKeyup(e)} placeholder="Enter a Guild name" />
                                    <div className="list-section">
                                          {this.state.guilds.map((guild, i) => (
                                                <JoinGuildList key={i} guild={guild} handleAdd={this.handleAdd} />
                                          ))}
                                    </div>
                              </div>
                        </div>
                  </div>
            )
      }
}


function mapStateToProps(state) {
      return {
            account: state.account
      }
}

export default connect(mapStateToProps)(JoinGuild)