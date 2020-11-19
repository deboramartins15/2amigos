import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import PageDefault from "../Default";

import { Button, Alert } from "reactstrap";

import { Container } from "./styles";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";
import api from "../../services/api";
import { getUserId } from "../../services/auth";

const columnsRomaneio = [
  {
    prop: "PLACAVEICULO",
    name: "Placa veículo",
  },
  {
    prop: "DOCMOTORISTA",
    name: "Doc. Motorista",
  },
  {
    prop: "status",
    name: "Status",
  },
];

const Romaneios = () => {
  const [romaneios, setRomaneios] = useState([]);
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
      const response = await api.get("romaneios");
      const status = await api.get("/status");

      setRomaneios(response.data);
      setStatusValues(
        status.data.filter(
          (status) =>
            status.descricao === "Pendente" ||
            status.descricao === "Conferido" ||
            status.descricao === "Embarcado"
        )
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRomaneio(e, id) {
    e.preventDefault();

    try {
      history.push(`/romaneio/${id}`);
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  }

  async function conferirRomaneio(e,id){
    e.preventDefault();

    try {
      history.push(`/romaneio/leitura/${id}`);
    } catch (error) {
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  }

  async function expedirRomaneio(e, id) {
    e.preventDefault();

    try {
      const response = await api.get(`romaneios/${id}`);

      if (response.data[0].status[0].descricao === "Conferido") {
        setMsgError("info", "Expedindo romaneio...");
        
        response.data[0].nota_fiscal.map(async (nf) => {
          await api.put(`nf/${nf.id}`, {
            status: "Expedido",
            acao: "expedicao",
            login: getUserId(),
          });
        });

        await api.put(`romaneios/${id}`, {
          status: "Embarcado",
          acao: "expedicao",
          login: getUserId(),
        },{timeout: 20000});

        fetchData();

        setMsgError("success", "Romaneio expedido com sucesso !");
      } else {
        setMsgError("danger", "Romaneio não conferido");
      }
    } catch (error) {
      console.log(error)
      setMsgError(
        "danger",
        error.response.data.error
          ? error.response.data.error
          : error.response.data.detail
      );
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageDefault>
      <Container>
        {msg.message && (
          <Alert color={msg.color} isOpen={visible} toggle={onDismiss}>
            <span>{msg.message}</span>
          </Alert>
        )}
        <Link to="/romaneio">
          <Button>Novo romaneio</Button>
        </Link>
        <TabelaPaginacao
          registrosPorPagina={5}
          fonteDeDados={romaneios}
          colunas={[...columnsRomaneio]}
          acoes={[
            { nome: "Editar", click: fetchRomaneio, class: "btn btn-info" },
            { nome: "Conferir", click: conferirRomaneio, class: "btn btn-info" },
            { nome: "Expedir", click: expedirRomaneio, class: "btn btn-info" },
          ]}
          footerTitulo={"Total romaneios:"}
          exportData={true}
          filterStatus={true}
          StatusValues={statusValues}
        />
      </Container>
    </PageDefault>
  );
};

export default Romaneios;
