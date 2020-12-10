import React, { useEffect, useState, memo } from "react";
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
  // {
  //   name: "CNPJ",
  //   prop: "CNPJ_FAVORECIDO",
  // },
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
  const [codBarra, setCodBarra] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [motorista, setMotorista] = useState("");
  const [nfs, setNfs] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [tipoVeiculos, setTipoVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [conferido, setConferido] = useState(false);
  const [embarcado, setEmbarcado] = useState(false);
  const [entregue, setEntregue] = useState(false);
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
      const motoristas = await api.get("/motoristas");

      setTipoVeiculos(veiculos.data);
      setMotoristas(motoristas.data);

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

        if (response.data[0].status[0].descricao === "Entregue")
          setEntregue(true);

        setNfs(response.data[0].nota_fiscal);
        setPlaca(response.data[0].PLACAVEICULO);
        setMotorista(response.data[0].MOTORISTA);
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

  const handleLeitura = async (chave) => {
    try {
      setCodBarra(chave.trim());

      if (!chave) {
        setMsgError("danger", "Informe o código de barra da NF !");
        return;
      }

      const nf = await api.get(`/leitura/${chave.trim()}`);

      if (nf.data[0].ROMANEIO_ID) {
        setCodBarra("");
        return setMsgError("danger", "Nota fiscal já pertence a um romaneio");
      }

      if (nf.data[0].status[0].descricao !== "Recebida") {
        setCodBarra("");
        return setMsgError("danger", "Nota fiscal não recebida");
      }

      const exists = nfs.filter((nf) => nf.CHAVE_NF === chave.trim());

      if (exists.length === 0) setNfs([...nfs, nf.data[0]]);
      setCodBarra("");
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data ? error.response.data.error : error.response
      );

      setCodBarra("");
    }
  };

  function handleDeleteNf(e, id) {
    e.preventDefault();

    if (conferido || embarcado)
      return setMsgError(
        "danger",
        "Não é possível remover nota fiscal de romaneio conferido ou embarcado"
      );

    setNfs(nfs.filter((nf) => nf.id !== id));
  }

  async function handleEntregaNF(e, id) {
    e.preventDefault();

    try {
      if (!embarcado)
        return setMsgError(
          "danger",
          "Não é possível conferir a entrega da nota fiscal de um romaneio não embarcado"
        );

      await api.put(`nf/${id}`, {
        status: "Entregue",
        acao: "entrega",
        login: getUserId(),
      });

      fetchData();
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data ? error.response.data.error : error.response
      );
    }
  }

  async function handleSave() {
    try {
      if (!placa || !motorista || !veiculo || veiculo === 0)
        return setMsgError("danger", "Campos obrigatórios em branco");

      if (codRomaneio) {
        if (conferido) {
          const requestData = {
            acao: "update",
            placa: placa,
            motorista: motorista,
          };

          await api.put(`romaneios/${codRomaneio}`, requestData);
        } else if (embarcado) {
          await api.put(`romaneios/${codRomaneio}`, {
            status: "Entregue",
            acao: "entrega",
            login: getUserId(),
          });
        } else {
          const requestData = {
            acao: "update",
            placa: placa,
            motorista: motorista,
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
          motorista: motorista,
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

  function handleBotoesAcoes() {
    if (embarcado) {
      return [
        {
          nome: "Entregue",
          click: handleEntregaNF,
          class: "btn btn-primary",
        },
      ];
    } else if (entregue) {
      return false;
    } else {
      return [
        {
          nome: "Excluir",
          click: handleDeleteNf,
          class: "btn btn-danger",
        },
      ];
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
                  disabled={embarcado || entregue}
                />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label for="docMotorista">Doc. Motorista</Label>
                <Input
                  type="select"
                  name="motorista"
                  id="motorista"
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  disabled={embarcado || entregue}
                >
                  <option value="0">Motorista..</option>
                  {motoristas.map((motorista, index) => (
                    <option key={index} value={motorista.id}>
                      {motorista.NOME}
                    </option>
                  ))}
                </Input>
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
                  disabled={!criado || conferido || embarcado || entregue}
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
                  disabled={embarcado || entregue}
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
          filterDate={true}
          StatusValues={statusValues}
          acoes={handleBotoesAcoes}
        />
        <Row className="row-buttons">
          <Col xs="auto">
            <Button
              color="primary"
              className="mt-2"
              onClick={handleSave}
              disabled={entregue}
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
