import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import PageDefault from "../Default";

import { Button, Alert } from "reactstrap";

import { Container, ButtonsWrapper } from "./styles";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";
import api from "../../services/api";
import { getUserId } from "../../services/auth";

const columnsRomaneio = [
  {
    prop: "id",
    name: "Código",
  },
  {
    prop: "PLACAVEICULO",
    name: "Placa veículo",
  },
  {
    prop: "created_at",
    name: "Criado em",
  },
  {
    prop: "ROMANEIOENTRADA",
    name: "Romaneio entrada",
  },
  {
    prop: "status",
    name: "Status",
  },
  {
    prop: "motorista",
    name: "Motorista",
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

  async function isRomaneioEntrada(id) {
    const romaneioFiltered = romaneios.filter((romaneio) => romaneio.id === id);

    return romaneioFiltered[0].ROMANEIOENTRADA;
  }

  async function fetchRomaneio(e, id) {
    e.preventDefault();

    try {
      const isEntrada = await isRomaneioEntrada(id);

      if (isEntrada) {
        history.push(`/romaneioEntrada/${id}`);
      } else {
        history.push(`/romaneio/${id}`);
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

  async function conferirRomaneio(e, id) {
    e.preventDefault();

    try {
      const isEntrada = await isRomaneioEntrada(id);

      if (isEntrada) {
        setMsgError("danger", "Operação inválida para romaneios de entrada!");
        return;
      }

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
      const isEntrada = await isRomaneioEntrada(id);

      if (isEntrada) {
        setMsgError("danger", "Operação inválida para romaneios de entrada!");
        return;
      }

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

        await api.put(
          `romaneios/${id}`,
          {
            status: "Embarcado",
            acao: "expedicao",
            login: getUserId(),
          },
          { timeout: 20000 }
        );

        fetchData();

        setMsgError("success", "Romaneio expedido com sucesso !");
      } else if (
        response.data[0].status[0].descricao === "Embarcado" ||
        response.data[0].status[0].descricao === "Entregue"
      ) {
        setMsgError("info", "Reenviando relatórios de romaneio...");
        await api.get(`/romaneio/reenvio/email/${id}`);
        setMsgError(
          "success",
          "Relatórios de romaneio reenviados com sucesso !"
        );
      } else {
        setMsgError("danger", "Romaneio não conferido");
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
        <ButtonsWrapper>
          <Link to="/romaneioEntrada">
            <Button className="mr-2">Novo romaneio Entrada</Button>
          </Link>
          <Link to="/romaneio">
            <Button>Novo romaneio Saída</Button>
          </Link>
        </ButtonsWrapper>
        <TabelaPaginacao
          registrosPorPagina={5}
          fonteDeDados={romaneios}
          colunas={[...columnsRomaneio]}
          acoes={[
            { nome: "Editar", click: fetchRomaneio, class: "btn btn-info" },
            {
              nome: "Conferir",
              click: conferirRomaneio,
              class: "btn btn-info",
            },
            { nome: "Expedir", click: expedirRomaneio, class: "btn btn-info" },
          ]}
          footerTitulo={"Total romaneios:"}
          exportData={true}
          tipoExportacao={"romaneios"}
          filterStatus={true}
          StatusValues={statusValues}
          filterDate={true}
          DateColumnFilter={"created_at"}
        />
      </Container>
    </PageDefault>
  );
};

export default Romaneios;
