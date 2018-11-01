import React, { Component } from 'react';
import './clear.css';
import './App.css';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Channel from './components/Channel/Channel';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path='/' component={Channel} exact />
          <Route path='/login' component={Login} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
