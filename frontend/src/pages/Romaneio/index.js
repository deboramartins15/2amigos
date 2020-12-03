import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

import { Container, Header } from "./styles";
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
  const [veiculo, setVeiculo] = useState("");
  const [nfs, setNfs] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [tipoVeiculos, setTipoVeiculos] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [conferido, setConferido] = useState(false);
  const [embarcado, setEmbarcado] = useState(false);
  const [criado, setCriado] = useState(false);
  const [codRomaneio, setCodRomaneio] = useState("");

  const history = useHistory();
  const { id: RomaneioId } = useParams();

  const onDismiss = () => setVisible(false);

  const setMsgError = (color, msg) => {
    setMsg({ color: color, message: msg });
    setVisible(true);
  };

  async function fetchData() {
    try {
      const status = await api.get("/status");
      const veiculos = await api.get("/veiculos");

      setTipoVeiculos(veiculos.data);

      setStatusValues(
        status.data.filter(
          (status) =>
            status.descricao !== "Pendente" &&
            status.descricao !== "Conferido" &&
            status.descricao !== "Embarcado"
        )
      );

      if (RomaneioId) {
        const response = await api.get(`romaneios/${RomaneioId}`);

        if (response.data[0].status[0].descricao === "Conferido")
          setConferido(true);

        if (response.data[0].status[0].descricao === "Embarcado")
          setEmbarcado(true);

        setNfs(response.data[0].nota_fiscal);
        setPlaca(response.data[0].PLACAVEICULO);
        setDocMot(response.data[0].DOCMOTORISTA);
        setVeiculo(response.data[0].VEICULO);
        setCriado(true);
        setCodRomaneio(RomaneioId);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleLeitura(chave) {
    try {
      const nf = await api.get(`/leitura/${chave}`);

      if (nf.data[0].status[0].descricao !== "Recebida")
        return setMsgError("danger", "Nota fiscal não recebida");

      if (nf.data[0].ROMANEIO_ID)
        return setMsgError("danger", "Nota fiscal já pertence a um romaneio");

      const exists = nfs.filter(nf => nf.CHAVE_NF === chave)

      if (exists.length === 0) setNfs([...nfs, nf.data[0]]);
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data ? error.response.data.error : error.response
      );
    }
  }

  function handleDeleteNf(e, id) {
    e.preventDefault();

    if (conferido || embarcado)
      return setMsgError(
        "danger",
        "Não é possível remover nota fiscal de romaneio conferido ou embarcado"
      );

    setNfs(nfs.filter((nf) => nf.id !== id));
  }

  async function handleSave() {
    try {
      if (!placa || !docMot || !veiculo || veiculo === 0)
        return setMsgError("danger", "Campos obrigatórios em branco");

      if (codRomaneio) {
        if (conferido) {
          const requestData = {
            acao: "update",
            placa: placa,
            docMotorista: docMot,
          };

          await api.put(`romaneios/${codRomaneio}`, requestData);
        } else {
          const requestData = {
            acao: "update",
            placa: placa,
            docMotorista: docMot,
            veiculo,
            nfs: nfs,
          };

          await api.put(`romaneios/${codRomaneio}`, requestData);
        }

        setMsgError("success", "Romaneio alterado com sucesso !");
      } else {
        const romaneio = await api.post("romaneios", {
          nfs: nfs,
          placa: placa,
          docMotorista: docMot,
          veiculo,
          login: getUserId(),
        });

        setCodRomaneio(romaneio.data.id);
        setCriado(true);
        setMsgError("success", "Romaneio criado com sucesso !");
      }
    } catch (error) {
      console.log(error);
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
          {codRomaneio && (
            <Row xs="2">
              <Col>
                <Header>Romaneio {codRomaneio}</Header>
              </Col>
            </Row>
          )}
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
                  disabled={embarcado}
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
                  disabled={embarcado}
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
                  disabled={!criado || conferido || embarcado}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="veiculo">Veículo</Label>
                <Input
                  type="select"
                  name="veiculo"
                  id="veiculo"
                  value={veiculo}
                  onChange={(e) => setVeiculo(e.target.value)}
                >
                  <option value="0">Veículo..</option>
                  {tipoVeiculos.map((veiculo, index) => (
                    <option key={index} value={veiculo.id}>
                      {veiculo.tipo}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </Form>
        <TabelaPaginacao
          registrosPorPagina={2}
          fonteDeDados={nfs}
          colunas={[...columnsNF]}
          footerTitulo={"Total NF:"}
          exportData={false}
          filterStatus={true}
          StatusValues={statusValues}
          acoes={[
            { nome: "Excluir", click: handleDeleteNf, class: "btn btn-danger" },
          ]}
        />
        <Row className="row-buttons">
          <Col xs="auto">
            <Button
              color="primary"
              className="mt-2"
              onClick={handleSave}
              disabled={embarcado}
            >
              Salvar
            </Button>
          </Col>
        </Row>
      </Container>
    </PageDefault>
  );
};

export default Romaneio;
