import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

import { Container, MenuList, MenuItem } from "./styles";
import { logout, getUserId } from "../../services/auth";
import api from "../../services/api";

function Menu(props) {
  const handleSignOut = async (e) => logout();
  const [showMenuItem,setShowMenuItem] = useState(false)

  const fetchData = async () => {
    try {
      const loja = await api.get(`/loja/${getUserId()}`);
  
      setShowMenuItem(loja.data.transportadora)
    } catch (error) {
      return error;
    }
  }

  useMemo(() => fetchData(), []);

  return (
    <Container>
      <MenuList>
        <MenuItem>
          <Link to="/dashboard">Início</Link>
        </MenuItem>
        {showMenuItem && (
          <MenuItem>
            <Link to="/configuracao">Configuração</Link>
          </MenuItem>
        )}
        {showMenuItem && (
          <MenuItem>
            <Link to="/leitura">Leitura NF</Link>
          </MenuItem>
        )}
        {showMenuItem && (
          <MenuItem>
            <Link to="/romaneios">Romaneios</Link>
          </MenuItem>
        )}
        <MenuItem>
          <Link to="/" onClick={handleSignOut}>
            Sair
          </Link>
        </MenuItem>
      </MenuList>
    </Container>
  );
}

export default Menu;
