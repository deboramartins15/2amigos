import React, { useState, useEffect } from "react";

import { Container, BurguerButton, Wrapper } from "./styles";
import Menu from "../Menu";

import { getUserId } from "../../services/auth";
import api from "../../services/api";

function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [userLogado, setUserLogado] = useState("");

  function toggleMenu(e) {
    e.preventDefault();

    setShowMenu(!showMenu);
  }

  const fetchData = async () => {
    try {
      const loja = await api.get(`/loja/${getUserId()}`);

      setUserLogado(loja.data.login);
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Container>
        <Wrapper>
        <BurguerButton onClick={(e) => toggleMenu(e)} />
        <span>Bem vindo, {userLogado}</span>
        </Wrapper>
        <span>2 Amigos</span>
      </Container>
      {showMenu && <Menu />}
    </>
  );
}

export default Header;
