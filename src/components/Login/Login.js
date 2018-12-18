import React, { Component } from 'react';
import './login.css'


export default class Login extends Component {

    login() {
        let { REACT_APP_DOMAIN, REACT_APP_CLIENT_ID } = process.env;

        let uri = `${encodeURIComponent(window.location.origin)}/auth/callback`

        window.location = `https://${REACT_APP_DOMAIN}/authorize?client_id=${REACT_APP_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=${uri}&response_type=code`
    }


    render() {
        return (
            <div className='background'>
                <div className='App'>
                    <button onClick={this.login}>Login</button>
                    <h3 className='lh3'>Demo account</h3>
                    <p className='lp'>demo@demo.com</p>
                    <p className='lp'>demo</p>
                </div>
            </div>
        )
    }
}

