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
  transportadora: false
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
  const [perfilUser,setPerfilUser] = useState(0)

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
    setPerfilUser(0)
    fetchData();
  };

  const fetchLoja = async (e, id) => {
    e.preventDefault();

    try {
      const response = await api.get(`/loja/${id}`);
      setLoja(response.data);
      setDisabled(true);

      if(response.data.matriz){
        setPerfilUser(1)
      }else if(response.data.transportadora){
        setPerfilUser(3)
      }else{
        setPerfilUser(2)
      }
      
    } catch (error) {
      setMsg(error.data.error);
    }
  };

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
  };

  const handlePerfilUsuario = e => {
    setPerfilUser(e.target.value)

    switch(e.target.value.toString()){
      case '1':
        setLoja({ ...loja, matriz: true , transportadora: false });
        break;
      case '2':
        setLoja({ ...loja, matriz: false , transportadora: false });
        break;
      case '3':
        setLoja({ ...loja, matriz: false , transportadora: true });
        break;
      default:
        setLoja({ ...loja, matriz: false , transportadora: false });
        break;
    }    
  }

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
              <Col>
              <FormGroup>
                  <Label for="perfil">Perfil</Label>
                  <Input
                    type="select"
                    name="perfil"
                    id="perfil"
                    placeholder="Perfil usuário.."
                    value={perfilUser}
                    onChange={(e) => handlePerfilUsuario(e)}
                  >
                    <option value="0">Perfil usuário..</option>
                    <option value="1">Matriz</option>
                    <option value="2">Loja</option>
                    <option value="3">Transportadora</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row className="row-buttons">
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
              footerTitulo={'Total usuários:'}
            />
          </TableWrapper>
        </Container>
      </Wrapper>
    </PageDefault>
  );
}

export default Config;
