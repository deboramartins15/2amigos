import React from "react";
import { GlobalStyles } from "./styles/GlobalStyles.js";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Config from "./pages/Configuracao";

function App() {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Login}></Route>          
          <Route path='/dashboard' component={Dashboard}></Route>
          <Route path='/configuracao' component={Config}></Route>
        </Switch>
      </BrowserRouter>
      <GlobalStyles />
    </>
  );
}

export default App;
