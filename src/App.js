import React, { Component } from 'react';
import './clear.css';
import './App.css';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Channel from './components/Channel/Channel';
import Settings from './components/Settings/Settings';
import CreateGuild from './components/CreateGuild/CreateGuild';
import JoinGuild from './components/JoinGuild/JoinGuild';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route path='/' component={Channel} exact />
          <Route path='/login' component={Login} />
          <Route path='/settings' component={Settings} />
          <Route path='/createguild' component={CreateGuild} />
          <Route path='/joinguild' component={JoinGuild} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
