import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import './styles/variables.css';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/" component={LoginPage} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
