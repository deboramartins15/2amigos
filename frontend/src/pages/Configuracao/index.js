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
  Table,
} from "reactstrap";

import { Wrapper, TableWrapper } from "./styles.js";

const initialState = {
  id: 0,
  login: "",
  senha: "",
  CNPJ: "",
  matriz: false,
};

const columnsLoja = [
  {
    dataField: "id",
    text: "ID",
  },
  {
    dataField: "login",
    text: "Login",
  },
  {
    dataField: "CNPJ",
    text: "CNPJ",
  },
  {
    dataField: "matriz",
    text: "Matriz",
  },
  {
    dataField: "action",
    text: "Ação",
  },
];

function Config() {
  const [loja, setLoja] = useState(initialState);
  const [lojas, setLojas] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const onDismiss = () => setVisible(false);

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
      const { login, senha, CNPJ, matriz } = loja;

      if (loja.id) {
        await api.put(`/loja/${loja.id}`, { matriz });
      } else {
        await api.post(`/loja`, { login, senha, CNPJ, matriz });
      }

      setMsg({ color: "success", message: "Loja alterada com sucesso !" });
      handleReset();
    } catch (error) {
      setMsg({ color: "danger", message: error });
    }
  };

  const handleReset = async (e) => {
    setLoja(initialState);
    setDisabled(false);
    fetchData();
    setMsg({ color: "", message: "" });
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
                    onChange={(e) => setLoja({ ...loja, CNPJ: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row xs="2">
              <Col>
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
            </Row>
            <Row>
              <Col xs="1">
                <Button color="primary" className="mt-2" onClick={handleSave}>
                  Salvar
                </Button>
              </Col>
              <Col xs="1">
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
            <Table responsive hover className="mt-4">
              <thead>
                <tr>
                  {columnsLoja.map((column) => (
                    <th key={column.dataField}>{column.text}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lojas.map((loja) => {
                  return (
                    <tr key={loja.id}>
                      <td>{loja.id}</td>
                      <td>{loja.login}</td>
                      <td>{loja.CNPJ}</td>
                      <td>
                        {loja.matriz && loja.matriz === true ? "Sim" : "Não"}
                      </td>
                      <td>
                        <Button
                          color="info"
                          onClick={(e) => fetchLoja(e, loja.id)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </Container>
      </Wrapper>
    </PageDefault>
  );
}

export default Config;
