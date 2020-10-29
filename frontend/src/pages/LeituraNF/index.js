import React, { useState, useEffect } from "react";

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

import { Wrapper, TableWrapper } from "./styles.js";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";
import { getUserId, isMatriz, isTransportadora } from "../../services/auth";

const columnsNF = [
  {
    name: "CNPJ",
    prop: "CNPJ_FAVORECIDO",
  },
  {
    name: "Razão Social",
    prop: "RAZAOSOCIAL_FAVORECIDO",
  },
  {
    name: "Emissão",
    prop: "DT_EMISSAO",
  },
  {
    name: "Chave",
    prop: "CHAVE_NF",
  },
  {
    name: "Numero",
    prop: "NUMERO_NF",
  },
  {
    name: "Total",
    prop: "TOTAL_NF",
  },
  {
    name: "Volume",
    prop: "VOLUME",
  },
  {
    name: "Peso",
    prop: "PESO_LIQ",
  }
];

function Leitura() {
  const [codBarra, setCodBarra] = useState("");
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [nfs, setNfs] = useState([]);

  const onDismiss = () => setVisible(false);

  async function fetchData() {
    try {
      let response = {};

      if (isMatriz() || (await isTransportadora())) {
        response = await api.get("nf");
      } else {
        const loja = await api.get(`loja/${getUserId()}`);
        response = await api.get("nf", { headers: { CNPJ: loja.data.CNPJ } });
      }
      setNfs(response.data);
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeitura = async (e) => {
    e.preventDefault();

    try {
      if (!codBarra) {
        setMsgError("danger", "Informe o código de barra da NF !");
        return;
      }

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
        setMsgError("warning", "Nota fiscal não importada !");
      } else {
        const response = await api.put(`nf/${nf.data.id}`, {
          status: "Recebida",
          acao: "recebimento",
          login: getUserId(),
        });

        if (response.status === 200) {
          setMsgError("success", "Nota fiscal recebida com sucesso !");
          handleReset();
        }
      }
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  };

  const handleReset = async () => {
    setCodBarra("");
  };

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
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
        <TableWrapper>
          <TabelaPaginacao
            registrosPorPagina={5}
            fonteDeDados={nfs}
            colunas={[...columnsNF]}
            footerTitulo={"Total usuários:"}
          />
        </TableWrapper>
      </Wrapper>
    </PageDefault>
  );
}

export default Leitura;
