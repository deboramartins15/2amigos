import React, { useState, useEffect } from "react";

import PageDefault from "../Default";
import api from "../../services/api";

import { Row, Col, Form, FormGroup, Label, Input, Alert } from "reactstrap";

import { Container } from "./styles.js";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";
import { getUserId } from "../../services/auth";

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
];

function Leitura() {
  const [codBarra, setCodBarra] = useState("");
  const [msg, setMsg] = useState({ color: "", message: "" });
  const [visible, setVisible] = useState(true);
  const [nfs, setNfs] = useState([]);
  const [romaneios, setRomaneios] = useState([]);
  const [romaneio, setRomaneio] = useState();

  const onDismiss = () => setVisible(false);

  async function fetchData() {
    try {
      const response = await api.get("nf");
      const romaneiosResponse = await api.get("/romaneios/entrada")

      const nfsFiltered = response.data.filter((nf) => {
        return nf.status[0].descricao === "Previsao de Recebimento";
      });

      setNfs(nfsFiltered);
      setRomaneios(romaneiosResponse.data)
    } catch (error) {
      console.log(error.response);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeitura = async (codigo) => {
    setCodBarra(codigo.trim());

    try {
      if (!codigo) {
        setMsgError("danger", "Informe o código de barra da NF !");
        return;
      }

      if (!romaneio) {
        setMsgError("danger", "Informe o romaneio de entrada !");
        setCodBarra("");
        return;
      }

      const nf = await api.get(`/leitura/${codigo.trim()}`);

      if (nf.status === 204) {
        setMsgError("warning", "Nota fiscal não importada !");
      } else {
        if (nf.data[0].DT_RECEBIDO) {
          setMsgError("danger", "Nota fiscal já recebida");
          setCodBarra("");
          return;
        }

        const response = await api.put(`nf/${nf.data[0].id}`, {
          status: "Recebida",
          acao: "recebimento",
          login: getUserId(),
          romaneioEntrada: romaneio
        });

        if (response.status === 200) {
          setMsgError("success", "Nota fiscal recebida com sucesso !");

          const nfsFiltered = nfs.filter((nf) => nf.CHAVE_NF !== codigo.trim());
          setNfs(nfsFiltered);

          // handleReset();
          setCodBarra("");
        }
      }
    } catch (error) {
      setMsgError(
        "danger",
        error.response ? error.response.data.error : error.response.data.detail
      );
      setCodBarra("");
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
                <Label for="romaneio">Romaneio Entrada</Label>
                <Input
                  type="select"
                  name="romaneio"
                  id="romaneio"
                  value={romaneio}
                  onChange={(e) => setRomaneio(e.target.value)}
                >
                  <option value="0">Romaneio entrada..</option>
                  {romaneios.map((romaneio, index) => (
                    <option key={index} value={romaneio.id}>
                      {`${romaneio.id} - ${romaneio.PLACAVEICULO}`}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
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
                />
              </FormGroup>
            </Col>
          </Row>
        </Form>
        <TabelaPaginacao
          registrosPorPagina={5}
          fonteDeDados={nfs}
          colunas={[...columnsNF]}
          footerTitulo={"Total usuários:"}
          exportData={true}
          filterDate={true}
          DateColumnFilter={"DT_EMISSAO"}
        />
      </Container>
    </PageDefault>
  );
}

export default Leitura;
