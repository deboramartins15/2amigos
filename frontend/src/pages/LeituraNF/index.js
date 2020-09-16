import React, { useState } from "react";

import PageDefault from "../Default";
import api from "../../services/api";

import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";

import { Wrapper } from "./styles.js";
import { getUserId, isMatriz } from "../../services/auth";

function Leitura() {
  const [codBarra, setCodBarra] = useState("");
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);

  const onDismiss = () => setVisible(false);

  const handleLeitura = async (e) => {
    e.preventDefault();

    try {
      let nf;

      if (isMatriz()) {
        nf = await api.get(`/leitura/${codBarra}`);
      } else {
        const loja = await api.get(`loja/${getUserId()}`);
        nf = await api.get(`/leitura/${codBarra}`, {
          headers: { CNPJ: loja.data.CNPJ },
        });
      }

      if (nf.status === 204) {
        setMsg({ color: "warning", message: "Nota fiscal não importada !" });
      } else {
        const response = await api.put(`nf/${nf.data.id}`, {
          status: "Recebida",
          acao: "recebimento",
          login: getUserId(),
        });
        
        if (response.status === 200) {
          setMsg({
            color: "success",
            message: "Nota fiscal recebida com sucesso !",
          });
        }
      }
    } catch (error) {
      setMsg({ color: "danger", message: error });
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setCodBarra("");
    setMsg({ color: "", message: "" });
  };

  return (
    <PageDefault>
      <Wrapper>
        {msg.message && (
          <Alert color={msg.color} isOpen={visible} toggle={onDismiss}>
            <span>{msg.message}</span>
          </Alert>
        )}
        <Container>
          <Form>
            <Row xs="2">
              <Col>
                <FormGroup>
                  <Label for="cod_barra">Cód. Barras</Label>
                  <Input
                    type="text"
                    name="cod_barra"
                    id="cod_barra"
                    placeholder="Cód. Barras.."
                    value={codBarra}
                    onChange={(e) => setCodBarra(e.target.value)}
                    autoFocus
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row xs="2">
              <Col xs="auto">
                <Button color="primary" onClick={handleLeitura}>
                  Conferir
                </Button>
              </Col>
              <Col xs="auto">
                <Button color="secondary" onClick={handleReset}>
                  Cancelar
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </Wrapper>
    </PageDefault>
  );
}

export default Leitura;
