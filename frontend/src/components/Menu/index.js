import React from "react";
import { Link } from "react-router-dom";

import { Container, MenuList, MenuItem } from "./styles";
import { logout } from "../../services/auth";

function Menu(props) {

  const handleSignOut = async (e) => logout(); 

  return (
    <Container>
      <MenuList>
        <MenuItem>
          <Link to="/configuracao">Configuração</Link>
        </MenuItem>
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