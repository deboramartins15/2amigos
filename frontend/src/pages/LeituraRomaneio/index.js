import React, { useEffect, useState } from "react";
import PageDefault from "../Default";

import {
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Button,
} from "reactstrap";

import { Container } from "./styles";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { getUserId } from "../../services/auth";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";

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

const LeituraRomaneio = () => {
  const [codBarra, setCodBarra] = useState("");
  const [nfs, setNfs] = useState([]);
  const [statusValues, setStatusValues] = useState([]);
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const { id: RomaneioId } = useParams();
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

      if (RomaneioId) {
        const response = await api.get(`romaneios/${RomaneioId}`);

        setNfs(response.data[0].nota_fiscal);

        if (response.data[0].status[0].descricao !== "Pendente") {
          setMsgError(
            "danger",
            "Não é possível conferir o romaneio. Verifique o status do mesmo."
          );

          setDisabled(true);
        }
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

      if (RomaneioId) {
        const exists = nfs.filter((n) => n.CHAVE_NF === nf.data[0].CHAVE_NF);

        if (exists.length === 0)
          return setMsgError("danger", "Nota fiscal não pertence ao romaneio");

        await api.put(`nf/${nf.data[0].id}`, {
          status: "Em Processo",
          acao: "processamento",
          login: getUserId(),
        });

        await fetchData();
      }
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data ? error.response.data.error : error.response
      );
    }
  }

  async function handleSave() {
    try {
      let canConferir = true;

      nfs.forEach((nf) => {
        if (nf.status[0].descricao !== "Em Processo") {
          canConferir = false;
        }
      });

      if (canConferir) {
        const requestData = {
          status: "Conferido",
          acao: "conferir",
          login: getUserId(),
        };

        await api.put(`romaneios/${RomaneioId}`, requestData);

        setMsgError("success", "Romaneio conferido com sucesso !");
        history.push(`/romaneios`);
      } else {
        setMsgError("danger", "Existem notas fiscais não conferidas");
      }
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
                <Label for="cod_barra">Cód. Barras</Label>
                <Input
                  type="text"
                  name="cod_barra"
                  id="cod_barra"
                  placeholder="Cód. Barras.."
                  value={codBarra}
                  onChange={(e) => handleLeitura(e.target.value)}
                  autoFocus
                  disabled={disabled}
                />
              </FormGroup>
            </Col>
          </Row>
        </Form>

        <TabelaPaginacao
          registrosPorPagina={5}
          fonteDeDados={nfs}
          colunas={[...columnsNF]}
          footerTitulo={"Total NF:"}
          filterStatus={true}
          StatusValues={statusValues}
          exportData={true}
        />

        <Row className="row-buttons">
          <Col xs="auto">
            <Button
              color="primary"
              className="mt-2"
              onClick={handleSave}
              disabled={disabled}
            >
              Salvar
            </Button>
          </Col>
        </Row>
      </Container>
    </PageDefault>
  );
};

export default LeituraRomaneio;
