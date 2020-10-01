import React, { useEffect, useState } from "react";

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

const initialState = {
  id: 0,
  login: "",
  senha: "",
  CNPJ: "",
  matriz: false,
  transportadora: false,
};

const columnsLoja = [
  {
    prop: "login",
    name: "Login",
  },
  {
    prop: "CNPJ",
    name: "CNPJ",
  },
  {
    prop: "matriz",
    name: "Matriz",
  },
  {
    prop: "transportadora",
    name: "Transportadora",
  },
];

function Config() {
  const [loja, setLoja] = useState(initialState);
  const [lojas, setLojas] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const onDismiss = () => {
    setVisible(false);
    setMsg({ color: "", message: "" });
  };

  async function fetchData() {
    try {
      const response = await api.get(`/loja`);

      setLojas(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const { login, senha, CNPJ, matriz, transportadora } = loja;

      if (!login || !senha || !CNPJ) {
        setMsgError("danger", "Campos Login e/ou Senha e/ou CNPJ em branco !");
        return;
      }

      if (loja.id) {
        await api.put(`/loja/${loja.id}`, { matriz, transportadora });
      } else {
        await api.post(`/loja`, { login, senha, CNPJ, matriz, transportadora });
      }

      setMsgError("success", "Loja alterada com sucesso !");
      handleReset();
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
    setLoja(initialState);
    setDisabled(false);
    fetchData();
  };

  const fetchLoja = async (e, id) => {
    e.preventDefault();

    try {
      const response = await api.get(`/loja/${id}`);
      setLoja(response.data);
      setDisabled(true);
    } catch (error) {
      setMsg(error.data.error);
    }
  };

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
  };

  return (
    <PageDefault title="Configuração">
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
                  <Label for="login">Login</Label>
                  <Input
                    type="text"
                    name="login"
                    id="login"
                    placeholder="Login.."
                    value={loja.login}
                    disabled={disabled}
                    onChange={(e) =>
                      setLoja({ ...loja, login: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label for="senha">Senha</Label>
                  <Input
                    type="password"
                    name="senha"
                    id="senha"
                    placeholder="Senha.."
                    value={loja.senha}
                    disabled={disabled}
                    onChange={(e) =>
                      setLoja({ ...loja, senha: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row xs="2">
              <Col>
                <FormGroup>
                  <Label for="CNPJ">CNPJ</Label>
                  <Input
                    type="text"
                    name="CNPJ"
                    id="CNPJ"
                    placeholder="CNPJ.."
                    value={loja.CNPJ}
                    disabled={disabled}
                    onChange={(e) => setLoja({ ...loja, CNPJ: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs="auto">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={loja.matriz}
                      onChange={(e) =>
                        setLoja({ ...loja, matriz: !loja.matriz })
                      }
                    />{" "}
                    Matriz
                  </Label>
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={loja.transportadora}
                      onChange={(e) =>
                        setLoja({
                          ...loja,
                          transportadora: !loja.transportadora,
                        })
                      }
                    />{" "}
                    Transportadora
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs="auto">
                <Button color="primary" className="mt-2" onClick={handleSave}>
                  Salvar
                </Button>
              </Col>
              <Col xs="auto">
                <Button
                  color="secondary"
                  className="mt-2"
                  onClick={handleReset}
                >
                  Cancelar
                </Button>
              </Col>
            </Row>
          </Form>
          <TableWrapper>
            <TabelaPaginacao
              registrosPorPagina={2}
              fonteDeDados={lojas}
              colunas={[...columnsLoja]}
              acoes={[
                { nome: "Editar", click: fetchLoja, class: "btn btn-info" },
              ]}
            />
          </TableWrapper>
        </Container>
      </Wrapper>
    </PageDefault>
  );
}

export default Config;
