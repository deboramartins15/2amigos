import React from "react";
// import { Link } from 'react-router-dom'

import Header from "../../components/Header";

import { Container, Wrapper } from "./styles";

function PageDefault({ children }) {
  return (
    <Container>
      <Header />
      {children}
    </Container>
  );
}

export default PageDefault;
