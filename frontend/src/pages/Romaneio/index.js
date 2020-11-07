import React, { useEffect, useState } from "react";
import PageDefault from "../Default";

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

import { Container } from "./styles";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";
import api from "../../services/api";
import { getUserId } from "../../services/auth";
import { useHistory } from "react-router-dom";

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
  },
  {
    name: "Status",
    prop: "status",
  },
];

const Romaneio = () => {
  const [placa, setPlaca] = useState("");
  const [docMot, setDocMot] = useState("");
  const [codBarra, setCodBarra] = useState("");
  const [nfs, setNfs] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);

  const history = useHistory();

  const onDismiss = () => setVisible(false);

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
  };

  async function fetchData() {
    try {
      const status = await api.get("/status");

      setStatusValues(
        status.data.filter(
          (status) =>
            status.descricao !== "Pendente" &&
            status.descricao !== "Conferido" &&
            status.descricao !== "Embarcado"
        )
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleLeitura(chave) {
    if (!nfs.includes(chave)) setNfs([...nfs, chave]);
  }

  async function handleSave() {
    try {
      if (!placa || !docMot || nfs.length === 0)
        return setMsgError("danger", "Campos obrigatórios em branco");

      await api.post("romaneios", {
        chavesNFE: nfs,
        placa: placa,
        docMotorista: docMot,
        login: getUserId(),
      });

      setMsgError("success", "Romaneio criado com sucesso !");
      history.push(`/romaneios`);
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
    <PageDefault>
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
                <Label for="placaVeiculo">Placa Veículo</Label>
                <Input
                  type="text"
                  name="placaVeiculo"
                  id="placaVeiculo"
                  placeholder="Placa Veículo.."
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="docMotorista">Doc. Motorista</Label>
                <Input
                  type="text"
                  name="docMotorista"
                  id="docMotorista"
                  placeholder="Doc. Motorista.."
                  value={docMot}
                  onChange={(e) => setDocMot(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row xs="2">
            <Col>
              <FormGroup>
                <Label for="cod_barra">Cód. Barras NF</Label>
                <Input
                  type="text"
                  name="cod_barra"
                  id="cod_barra"
                  placeholder="Cód. Barras NF.."
                  value={codBarra}
                  onChange={(e) => handleLeitura(e.target.value)}
                />
              </FormGroup>
            </Col>
          </Row>
        </Form>
        <TabelaPaginacao
          registrosPorPagina={3}
          fonteDeDados={nfs}
          colunas={[...columnsNF]}
          footerTitulo={"Total NF:"}
          exportData={false}
          filterStatus={true}
          StatusValues={statusValues}
        />
        <Row className="row-buttons">
          <Col xs="auto">
            <Button color="primary" className="mt-2" onClick={handleSave}>
              Salvar
            </Button>
          </Col>
        </Row>
      </Container>
    </PageDefault>
  );
};

export default Romaneio;
