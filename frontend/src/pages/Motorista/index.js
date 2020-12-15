import React, { useEffect, useState } from 'react';

import PageDefault from "../Default";
import api from "../../services/api";

import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";

import { Container } from "./styles.js";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";

const initialState = {
  id: 0,
  NOME: "",
  DOCUMENTO: "",
};

const columnsMotorista = [
  {
    prop: "NOME",
    name: "Nome",
  },
  {
    prop: "DOCUMENTO",
    name: "Documento",
  }
];

const Motorista = () => {
  const [motorista, setMotorista] = useState(initialState);
  const [motoristas, setMotoristas] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);

  const onDismiss = () => {
    setVisible(false);
    setMsg({ color: "", message: "" });
  };

  async function fetchData() {
    try {
      const response = await api.get(`/motoristas`);

      setMotoristas(response.data);
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
      const { NOME, DOCUMENTO } = motorista;

      if (!NOME || !DOCUMENTO) {
        setMsgError("danger", "Campos Nome e/ou Documento em branco !");
        return;
      }

      if (motorista.id) {
        await api.put(`/motoristas/${motorista.id}`, { nome: NOME, documento:DOCUMENTO });
      } else {
        await api.post(`/motoristas`, { nome: NOME, documento:DOCUMENTO });
      }

      setMsgError("success", "Motorista alterado com sucesso !");
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
    setMotorista(initialState);
    fetchData();
  };

  const fetchMotorista = async (e, id) => {
    e.preventDefault();

    try {
      const response = await api.get(`/motoristas/${id}`);
      setMotorista(response.data);     
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  };

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
  };


  const handleDelete = async (e, id) => {
    e.preventDefault();

    try {
      await api.delete(`/motoristas/${id}`);
      
      setMsgError("success", "Motorista excluído com sucesso !");
      handleReset()
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  }
  return (
    <PageDefault title="Motoristas">    
        <Container>
        {msg.message && (
          <Alert color={msg.color} isOpen={visible} toggle={onDismiss}>
            <span>{msg.message}</span>
          </Alert>
        )}
          <Form>
            <Row xs="2">
              <Col>
                <FormGroup>
                  <Label for="nome">Nome</Label>
                  <Input
                    type="text"
                    name="nome"
                    id="nome"
                    placeholder="Nome.."
                    value={motorista.NOME}
                    onChange={(e) =>
                      setMotorista({ ...motorista, NOME: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label for="documento">Documento</Label>
                  <Input
                    type="text"
                    name="documento"
                    id="documento"
                    placeholder="Documento.."
                    value={motorista.DOCUMENTO}
                    onChange={(e) =>
                      setMotorista({ ...motorista, DOCUMENTO: e.target.value })
                    }
                  />
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
            <TabelaPaginacao
              registrosPorPagina={2}
              fonteDeDados={motoristas}
              colunas={[...columnsMotorista]}
              acoes={[
                { nome: "Editar", click: fetchMotorista, class: "btn btn-info" },
                { nome: "Excluir", click: handleDelete, class: "btn btn-danger" },
              ]}
              footerTitulo={'Total motoristas:'}
              exportData={false}
            />
        </Container>
    </PageDefault>
  );
};

export default Motorista;
