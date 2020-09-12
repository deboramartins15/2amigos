import React, { useState } from "react";

import {
  Container,
  Wrapper,
  Header,
  FormLogin,
  Input,
  Button,
} from "./styles";

import api from "../../services/api";
import { login as SignIn } from "../../services/auth";

const initialState = {
  login: "",
  senha: "",
};

function Login(props) {
  const [user, setUser] = useState(initialState);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    const { login, senha } = user;

    if (!login || !senha) {
      setError("Preencha e-mail e senha para continuar!");
    } else {
      try {
        const response = await api.post("/login", { login, senha });
        SignIn(response.data.token, response.data.lojaId, response.data.matriz);
        props.history.push("/dashboard");
      } catch (err) {
        console.log(err)
        setError("Houve um problema com o login, verifique suas credenciais.");
      }
    }
  };

  return (
    <Container>
      {error && <span>{error}</span>}
      <Wrapper>
        <Header>
          <span></span>
          <h3>Transportadora 2 Amigos</h3>
        </Header>
        <FormLogin onSubmit={handleSignIn}>
          <Input
            placeholder="Login"
            onChange={(e) => setUser({ ...user, login: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Senha"
            onChange={(e) => setUser({ ...user, senha: e.target.value })}
          />
          <Button value="ENTRAR" type="submit" />
        </FormLogin>
      </Wrapper>
    </Container>
  );
}

export default Login;
