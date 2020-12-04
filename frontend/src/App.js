import React from "react";
import { GlobalStyles } from "./styles/GlobalStyles.js";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Config from "./pages/Configuracao";
import Leitura from "./pages/LeituraNF";
import Romaneios from "./pages/Romaneios/index.js";
import Romaneio from "./pages/Romaneio/index.js";
import LeituraRomaneio from "./pages/LeituraRomaneio/index.js";
import Motorista from "./pages/Motorista/index.js";

function App() {
  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Login}></Route>
          <Route path="/dashboard" component={Dashboard}></Route>
          <Route path="/configuracao" component={Config}></Route>
          <Route path="/leitura" component={Leitura}></Route>
          <Route path="/romaneios" component={Romaneios}></Route>
          <Route path="/romaneio/leitura/:id" component={LeituraRomaneio}></Route>
          <Route path="/romaneio/:id" component={Romaneio}></Route>
          <Route path="/romaneio" component={Romaneio}></Route>
          <Route path="/motoristas" component={Motorista}></Route>
        </Switch>
      </BrowserRouter>
      <GlobalStyles />
    </>
  );
}

export default App;
