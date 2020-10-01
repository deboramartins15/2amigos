import React from "react";

import Header from "../../components/Header";

import { Container } from "./styles";

function PageDefault({ children }) {
  return (
    <Container>
      <Header />
      {children}
    </Container>
  );
}

export default PageDefault;
