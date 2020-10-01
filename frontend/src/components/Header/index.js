import React, { useState } from "react";

import { Container, BurguerButton } from "./styles";
import Menu from "../Menu";

function Header() {
  const [showMenu, setShowMenu] = useState(false);

  function toggleMenu(e) {
    e.preventDefault();

    setShowMenu(!showMenu);
  }

  return (
    <>
      <Container>
        <BurguerButton onClick={(e) => toggleMenu(e)} />
        <span>2 Amigos</span>
      </Container>
      {showMenu && <Menu />}
    </>
  );
}

export default Header;
