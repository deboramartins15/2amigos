import React from "react";

import { Form, Input, Table, Row, Col, Button, Alert } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import copy from "copy-to-clipboard"; 

import "./Table.css";

import api from "../../services/api";
import Pagination from "../Pagination";

function VerificarOrdenacao(chaveOrdenacao, currentOrder) {
  if (currentOrder === "up") {
    return chaveOrdenacao === "status"
      ? (a, b) =>
          a[chaveOrdenacao][0].descricao.localeCompare(
            b[chaveOrdenacao][0].descricao
          )
      : (a, b) => a[chaveOrdenacao].toString().localeCompare(b[chaveOrdenacao]);
  } else if (currentOrder === "down") {
    return chaveOrdenacao === "status"
      ? (a, b) =>
          b[chaveOrdenacao][0].descricao.localeCompare(
            a[chaveOrdenacao][0].descricao
          )
      : (a, b) => b[chaveOrdenacao].toString().localeCompare(a[chaveOrdenacao]);
  } else {
    return (a) => a;
  }
}

class TabelaPaginacao extends React.Component {
  constructor() {
    super();
    this.state = {
      itensPaginacao: [],
      itensPesquisa: null,
      itensOrdenados: [],
      paginador: {},
      ordenacaoAtual: "default",
      textoParaPesquisar: "",
      colunaParaPesquisar: "selecionar",
      statusParaPesquisar: 0,
      iconOrdenacao: faSort,
      arquivoExportacao: null,
      visible: true,
      msgErroExportacao: null,
      corMsgExportacao: "info",
      nomeArquivoExportacao: null,
      dataInicialBusca: "",
      dataFinalBusca: "",
      copied: false
    };

    this.onPesquisar = this.onPesquisar.bind(this);
    this.handleExportacao = this.handleExportacao.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // resetar paginação de os dados forem diferentes
    if (this.props.fonteDeDados !== prevProps.fonteDeDados) {
      this.setPage(this.props.initialPage, this.props.fonteDeDados);
    }
  }

  copyToClipboard(text) {
    copy(text);
    // alert(`You have copied "${text}"`);
    this.setState({
      ...this.state,
      copied: true,
    });
  }

  setPage(pagina, dadosParaPaginar = null) {
    var { registrosPorPagina, fonteDeDados } = this.props;
    var { itensPesquisa, itensOrdenados } = this.state;
    var listaDeRegistros = [];

    if (dadosParaPaginar) {
      listaDeRegistros = dadosParaPaginar;
    } else {
      if (itensPesquisa && itensPesquisa.length > 0) {
        listaDeRegistros = itensPesquisa;
      } else if (itensOrdenados.length > 0) {
        listaDeRegistros = itensOrdenados;
      } else {
        listaDeRegistros = fonteDeDados;
      }
    }

    var paginador = this.state.paginador;

    if (pagina < 1 || pagina > paginador.totalDePaginas) {
      return;
    }

    paginador = this.paginador(
      listaDeRegistros.length,
      pagina,
      registrosPorPagina
    );
    var listaPaginada = listaDeRegistros.slice(
      paginador.indexInicial,
      paginador.indexFinal + 1
    );
    this.setState({ itensPaginacao: listaPaginada, paginador: paginador });
  }

  paginador(totalItens, paginaAtual, registrosPorPagina) {
    paginaAtual = paginaAtual || 1;
    var totalDePaginas = Math.ceil(totalItens / registrosPorPagina);
    var paginaInicial, paginalFinal;

    paginaInicial = 1;
    paginalFinal = totalDePaginas;

    var indexInicial = (paginaAtual - 1) * registrosPorPagina;
    var indexFinal = Math.min(
      indexInicial + registrosPorPagina - 1,
      totalItens - 1
    );
    var paginas = [...Array(paginalFinal + 1 - paginaInicial).keys()].map(
      (i) => paginaInicial + i
    );

    return {
      totalItens: totalItens,
      paginaAtual: paginaAtual,
      registrosPorPagina: registrosPorPagina,
      totalDePaginas: totalDePaginas,
      paginaInicial: paginaInicial,
      paginalFinal: paginalFinal,
      indexInicial: indexInicial,
      indexFinal: indexFinal,
      paginas: paginas,
    };
  }

  handleFilterStatus(status) {
    this.setState({ statusParaPesquisar: status });
    let listagem = [];

    if (parseInt(status) === 0) {
      listagem = this.props.fonteDeDados.filter((nf) => {
        if (this.state.colunaParaPesquisar !== "selecionar") {
          return nf[this.state.colunaParaPesquisar]
            .toString()
            .toLowerCase()
            .includes(this.state.textoParaPesquisar);
        } else {
          return nf;
        }
      });
    } else {
      listagem = this.props.fonteDeDados.filter((nf) => {
        if (this.state.colunaParaPesquisar !== "selecionar") {
          return (
            nf.STATUS_ID === parseInt(status) &&
            nf[this.state.colunaParaPesquisar]
              .toString()
              .toLowerCase()
              .includes(this.state.textoParaPesquisar)
          );
        } else {
          return nf.STATUS_ID === parseInt(status);
        }
      });
    }

    this.setState({ itensPesquisa: listagem });
    this.setPage(this.props.paginaInicial, listagem);
  }

  handleFilterDate(tipo, data) {
    switch (tipo) {
      case "INICIAL":
        this.setState({ ...this.state, dataInicialBusca: data });
        break;
      case "FINAL":
        this.setState({ ...this.state, dataFinalBusca: data });
        break;
      default:
        break;
    }
  }

  onPesquisar() {
    const textoPesquisaMinimizado = this.state.textoParaPesquisar.toLowerCase();
    let listagem = this.props.fonteDeDados;
    const campoData = this.props.DateColumnFilter;

    if (this.state.dataInicialBusca && this.state.dataFinalBusca) {
      if (
        new Date(this.state.dataInicialBusca) <=
        new Date(this.state.dataFinalBusca)
      ) {
        listagem = listagem.filter((nf) => {
          return (
            new Date(nf[campoData]) >= new Date(this.state.dataInicialBusca) &&
            new Date(nf[campoData]) <= new Date(this.state.dataFinalBusca)
          );
        });
      }
    }

    if (this.state.colunaParaPesquisar !== "selecionar") {
      if (
        this.state.colunaParaPesquisar === "matriz" ||
        this.state.colunaParaPesquisar === "transportadora" ||
        this.state.colunaParaPesquisar === "ROMANEIOENTRADA"
      ) {
        listagem = listagem.filter((x) => {
          if (textoPesquisaMinimizado === "sim") {
            return x[this.state.colunaParaPesquisar] === true;
          } else if (textoPesquisaMinimizado === "não") {
            return x[this.state.colunaParaPesquisar] === false;
          } else return x;
        });
      } else if (this.state.colunaParaPesquisar === "motorista") {
        listagem = listagem.filter((x) => {
          return x["motorista"].NOME.toString()
            .toLowerCase()
            .includes(textoPesquisaMinimizado);
        });
      } else {
        const statusValue =
          parseInt(this.state.statusParaPesquisar) === 0
            ? null
            : this.state.statusParaPesquisar;

        listagem = listagem.filter((x) => {
          if (statusValue) {
            return (
              x[this.state.colunaParaPesquisar]
                .toString()
                .toLowerCase()
                .includes(textoPesquisaMinimizado) &&
              x["STATUS_ID"] === parseInt(statusValue)
            );
          } else {
            return x[this.state.colunaParaPesquisar]
              .toString()
              .toLowerCase()
              .includes(textoPesquisaMinimizado);
          }
        });
      }
    }

    this.setState({ itensPesquisa: listagem });
    this.setPage(this.props.paginaInicial, listagem);
    this.renderizarPaginacao();
  }

  onSort(chaveOrdenacao) {
    const { ordenacaoAtual } = this.state;
    let proximaOrdenacao;
    let dadosOrdenados;
    let icon;

    if (ordenacaoAtual === "down") proximaOrdenacao = "up";
    else if (ordenacaoAtual === "up") proximaOrdenacao = "default";
    else if (ordenacaoAtual === "default") proximaOrdenacao = "down";

    if (this.state.textoParaPesquisar) {
      dadosOrdenados = this.state.itensPaginacao.sort(
        VerificarOrdenacao(chaveOrdenacao, proximaOrdenacao)
      );
    } else {
      dadosOrdenados = this.props.fonteDeDados.sort(
        VerificarOrdenacao(chaveOrdenacao, proximaOrdenacao)
      );
    }

    switch (proximaOrdenacao) {
      case "up":
        icon = faSortUp;
        break;
      case "down":
        icon = faSortDown;
        break;
      default:
        icon = faSort;
        break;
    }

    this.setState({
      ordenacaoAtual: proximaOrdenacao,
      itensOrdenados: dadosOrdenados,
      iconOrdenacao: icon,
    });
    this.setPage(this.props.paginaInicial, dadosOrdenados);
  }

  onPageChanged = (data) => {
    const { currentPage, pageLimit } = data;

    const offset = (currentPage - 1) * pageLimit;
    const currentData = this.props.paginaInicial?.slice(
      offset,
      offset + pageLimit
    );

    this.setPage(currentPage, currentData);
  };

  renderizarPaginacao = () => {
    var paginador = this.state.paginador;
    if (!paginador.paginas || paginador.paginas.length <= 1) {
      // Não exibir paginação caso não tenha registros suficientes para paginar
      return null;
    }

    return (
      <Pagination
        totalRecords={paginador.totalItens}
        pageLimit={this.props.registrosPorPagina}
        pageNeighbours={1}
        onPageChanged={this.onPageChanged}
      />
      // <div className="container-pagination">
      //   <nav>
      //     <ul className="pagination">
      //       <li
      //         className={
      //           paginador.paginaAtual === 1 ? "page-item disabled" : "page-item"
      //         }
      //       >
      //         <button
      //           onClick={() => this.setPage(1)}
      //           className="primeiro-btn page-link"
      //         >
      //           Primeiro
      //         </button>
      //       </li>
      //       <li
      //         className={
      //           paginador.paginaAtual === 1 ? "page-item disabled" : "page-item"
      //         }
      //       >
      //         <button
      //           onClick={() => this.setPage(paginador.paginaAtual - 1)}
      //           className="page-link"
      //         >
      //           Anterior
      //         </button>
      //       </li>
      //       {paginador.paginas.map((pagina, index) => (
      //         <li
      //           key={index}
      //           className={
      //             paginador.paginaAtual === pagina
      //               ? "page-item active"
      //               : "page-item"
      //           }
      //         >
      //           <button
      //             onClick={() => this.setPage(pagina)}
      //             className="page-link"
      //           >
      //             {pagina}
      //           </button>
      //         </li>
      //       ))}
      //       <li
      //         className={
      //           paginador.paginaAtual === paginador.totalDePaginas
      //             ? "page-item  disabled"
      //             : "page-item"
      //         }
      //       >
      //         <button
      //           onClick={() => this.setPage(paginador.paginaAtual + 1)}
      //           className="page-link"
      //         >
      //           Próximo
      //         </button>
      //       </li>
      //       <li
      //         className={
      //           paginador.paginaAtual === paginador.totalDePaginas
      //             ? "page-item disabled"
      //             : "page-item"
      //         }
      //       >
      //         <button
      //           onClick={() => this.setPage(paginador.totalDePaginas)}
      //           className="page-link"
      //         >
      //           Último
      //         </button>
      //       </li>
      //     </ul>
      //   </nav>
      // </div>
    );
  };

  async onDismiss() {
    try {
      if (this.state.nomeArquivoExportacao)
        await api.delete(`/nf/export/csv/${this.state.nomeArquivoExportacao}`);
    } catch (error) {
      alert(error);
    }

    this.setState({
      ...this.state,
      visible: false,
      arquivoExportacao: null,
      nomeArquivoExportacao: null,
      msgErroExportacao: null,
      corMsgExportacao: "info",
      copied: false
    });
  }

  async handleExportacao(e) {
    e.preventDefault();

    try {
      let fonteDados;

      if (this.state.itensPesquisa) {
        fonteDados = this.state.itensPesquisa;
      } else if (this.props.fonteDeDados.length > 0) {
        fonteDados = this.props.fonteDeDados;
      } else {
        this.setState({
          ...this.state,
          visible: true,
          msgErroExportacao: "Nenhum dado para exportar",
        });

        return;
      }

      if (this.props.tipoExportacao === "nf") {
        await api.post("/nf/export/csv", { data: fonteDados });
        window.open(`${process.env.REACT_APP_API_URL}/download/nf`);
      } else {
        await api.post("/romaneio/export/csv", { data: fonteDados });
        window.open(`${process.env.REACT_APP_API_URL}/download/romaneios`);
      }
    } catch (error) {
      this.setState({
        ...this.state,
        visible: true,
        msgErroExportacao: "Erro ao exportar dados",
        corMsgExportacao: "danger",
      });
    }
  }

  render() {
    const {
      itensPaginacao,
      iconOrdenacao,
      itensPesquisa,
      arquivoExportacao,
      msgErroExportacao,
      corMsgExportacao,
      copied
    } = this.state;
    const {
      fonteDeDados,
      colunas,
      acoes,
      espacoBotoesAcoes,
      footerTitulo,
      filterStatus,
      StatusValues,
      exportData,
      filterDate,
    } = this.props;
    var existeAcoes = acoes && acoes.length > 0;

    return (
      <div className="table-container">
        <Form inline>
          <Row className="mb-2">
            <Col xs="auto">
              <Input
                style={{ width: "170px" }}
                type="text"
                placeholder="Pesquisar"
                onChange={(e) =>
                  this.setState({
                    ...this.state,
                    textoParaPesquisar: e.target.value,
                  })
                }
              />
            </Col>
            <Col xs="auto">
              <select
                style={{ width: "170px" }}
                className={`custom-select form-control`}
                onChange={(e) =>
                  this.setState({
                    ...this.state,
                    colunaParaPesquisar: e.target.value,
                  })
                }
              >
                <option key={0} value="selecionar">
                  Filtros..
                </option>
                {colunas.map(function(data, key) {
                  if (
                    data.prop !== "status" &&
                    data.prop !== "DT_EMISSAO" &&
                    data.prop !== "created_at"
                  ) {
                    return (
                      <option key={key} value={data.prop}>
                        {data.name}
                      </option>
                    );
                  } else return null;
                })}
              </select>
            </Col>
            {filterStatus && (
              <Col xs="auto">
                <select
                  style={{ width: "170px" }}
                  className={`custom-select form-control`}
                  onChange={(e) => this.handleFilterStatus(e.target.value)}
                >
                  <option key={0} value={0}>
                    Status..
                  </option>
                  {StatusValues.map(function(status) {
                    return (
                      <option key={status.id} value={status.id}>
                        {status.descricao}
                      </option>
                    );
                  })}
                </select>
              </Col>
            )}
            {filterDate && (
              <>
                <Col xs="auto">
                  <Input
                    style={{ width: "170px" }}
                    type="date"
                    onChange={(e) =>
                      this.setState({
                        ...this.state,
                        dataInicialBusca: e.target.value,
                      })
                    }
                  />
                </Col>
                <Col xs="auto">
                  <Input
                    style={{ width: "170px" }}
                    type="date"
                    onChange={(e) =>
                      this.setState({
                        ...this.state,
                        dataFinalBusca: e.target.value,
                      })
                    }
                  />
                </Col>
              </>
            )}
            <Col xs="auto" className="col-buttons">
              <Button style={{ width: "80px" }} onClick={this.onPesquisar}>
                Buscar
              </Button>
            </Col>

            {exportData && (
              <Col xs="auto" className="col-buttons">
                <Button
                  style={{ width: "85px" }}
                  onClick={this.handleExportacao}
                >
                  Exportar
                </Button>
              </Col>
            )}
            {(arquivoExportacao || msgErroExportacao) && (
              <Alert
                color={corMsgExportacao}
                isOpen={this.state.visible}
                toggle={this.onDismiss}
              >
                {msgErroExportacao && <span>{msgErroExportacao}</span>}
              </Alert>
            )}
            {(copied) && (
              <Alert
                color="success"
                isOpen={this.state.copied}
                toggle={this.onDismiss}
              >
                Chave copiada!
              </Alert>
            )}
          </Row>
        </Form>

        <Table striped bordered hover>
          <thead>
            <tr>
              {existeAcoes && (
                <th style={{ width: espacoBotoesAcoes }}>Ações</th>
              )}
              {colunas.map((coluna) => (
                <th key={coluna.prop}>
                  <FontAwesomeIcon
                    style={{ marginRight: 10, cursor: "pointer" }}
                    onClick={(e) => this.onSort(coluna.prop)}
                    icon={iconOrdenacao}
                  ></FontAwesomeIcon>
                  {coluna.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itensPaginacao.length > 0 &&
              itensPaginacao.map((linha, index) => (
                <tr key={`${linha.CHAVE_NF}-${index}`}>
                  {existeAcoes && (
                    <td>
                      {acoes.map((acao) => (
                        <button
                          key={acao.nome}
                          onClick={(e) => acao.click(e, linha.id)}
                          style={{ marginRight: 10 }}
                          className={acao.class}
                        >
                          {acao.nome}
                        </button>
                      ))}
                    </td>
                  )}
                  {Object.keys(linha).map((coluna) => {
                    if (colunas.find((col) => col.prop === coluna)) {
                      switch (coluna) {
                        case "DT_EMISSAO":
                          return (
                            <td key={coluna}>
                              {new Date(linha[coluna]).toLocaleDateString(
                                "pt-BR"
                              )}
                            </td>
                          );
                        case "matriz":
                          return (
                            <td key={coluna}>
                              {linha[coluna] === true ? "Sim" : "Não"}
                            </td>
                          );
                        case "motorista":
                          return <td key={coluna}>{linha[coluna].NOME}</td>;
                        case "status":
                          return (
                            <td key={coluna}>{linha[coluna][0].descricao}</td>
                          );
                        case "transportadora":
                          return (
                            <td key={coluna}>
                              {linha[coluna] === true ? "Sim" : "Não"}
                            </td>
                          );
                        case "created_at":
                          return (
                            <td key={coluna}>
                              {new Date(linha[coluna]).toLocaleDateString(
                                "pt-BR"
                              )}
                            </td>
                          );
                        case "ROMANEIOENTRADA":
                          return (
                            <td key={coluna}>
                              {linha[coluna] === true ? "Sim" : "Não"}
                            </td>
                          );
                        case "CHAVE_NF":
                          return (
                            <td key={coluna} style={{cursor: "pointer"}} onClick={() => this.copyToClipboard(linha[coluna])}>
                              {linha[coluna]}
                            </td>
                          );
                        default:
                          return <td key={coluna}>{linha[coluna]}</td>;
                      }
                    } else {
                      return null;
                    }
                  })}
                </tr>
              ))}
          </tbody>
          <tfoot className="table-footer-pagination">
            <tr>
              <td>{footerTitulo}</td>
              <td>
                {itensPesquisa ? itensPesquisa.length : fonteDeDados.length}
              </td>
            </tr>
          </tfoot>
        </Table>

        {fonteDeDados.length > 0 && <this.renderizarPaginacao />}
      </div>
    );
  }
}

export default TabelaPaginacao;
