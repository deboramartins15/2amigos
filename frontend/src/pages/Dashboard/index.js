import React, { Component } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import PageDefault from "../Default";
import Upload from "../../components/Upload";
import ModalUpload from "../../components/ModalUpload";
import TabelaPaginacao from "../../components/TablePagination/TabelaPaginacao";

import api from "../../services/api";
import { getUserId, isMatriz, isTransportadora } from "../../services/auth";

import { Container, UploadWrapper, TableWrapper } from "./styles";
import { FormGroup, Input } from "reactstrap";

class Dashboard extends Component {
  state = {
    uploadedFiles: [],
    nfs: [],
    showUpload: false,
    statusValues: []
  };

  handleUpload = (files) => {
    const uploadedFiles = files.map((file) => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
      error: false,
      url: null,
    }));

    this.setState({
      uploadedFiles: this.state.uploadedFiles.concat(uploadedFiles),
    });

    uploadedFiles.forEach(this.processUpload);
  };

  updateFile = async (id, data) => {
    const nfs = await this.fetchData();

    this.setState({
      uploadedFiles: this.state.uploadedFiles.map((uploadedFile) => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      }),
      nfs: nfs.data,
    });
  };

  processUpload = (uploadedFile, index) => {
    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name);
    data.append("login", getUserId());

    api
      .post("nf", data, {
        onUploadProgress: (e) => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          this.updateFile(uploadedFile.id, {
            progress,
          });
        },
      })
      .then((response) => {
        this.updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id,
          url: response.data.url,
        });
      })
      .catch(() => {
        this.updateFile(uploadedFile.id, {
          error: true,
        });
      });
  };

  async componentDidMount() {
    const nfs = await this.fetchData();

    const status = await api.get("/status")

    this.setState({
      ...this.state,
      nfs: nfs.data,
      showUpload: await isTransportadora(),
      statusValues: status.data
    });
  }

  async fetchData() {
    try {
      let response = {};

      if (isMatriz() || (await isTransportadora())) {
        response = await api.get("nf");
      } else {
        const loja = await api.get(`loja/${getUserId()}`);
        response = await api.get("nf", { headers: { CNPJ: loja.data.CNPJ } });
      }
      return response;
    } catch (error) {
      console.log(error.response);
    }
  }

  handleFilterStatus = (e) => {
    this.setState({
      ...this.state,
      nfs: this.state.nfs.filter(
        (nf) => nf.STATUS_ID.toString() === e.target.value
      ),
    });
  };

  render() {
    const columnsNF = [
      {
        name: "CNPJ Emissor",
        prop: "CNPJ_EMISSOR",
      },
      {
        name: "Razão Favorecido",
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
        name: "Total",
        prop: "TOTAL_NF",
      },
      {
        name: "Status",
        prop: "status",
      },
    ];
    const { uploadedFiles, nfs, showUpload, statusValues } = this.state;
    const uploading =
      !!uploadedFiles.length &&
      (uploadedFiles[uploadedFiles.length - 1].uploaded ||
        uploadedFiles[uploadedFiles.length - 1].error)
        ? true
        : false;

    return (
      <PageDefault>
        <Container className="dashboard-container">
          {showUpload && (
            <>
              {uploading && <ModalUpload files={uploadedFiles} />}
              <UploadWrapper className="upload-wrapper">
                <Upload onUpload={this.handleUpload} />
              </UploadWrapper>
            </>
          )}
          <TableWrapper>
            <FormGroup>
              <Input
                type="select"
                name="select"
                id="exampleSelect"
                onChange={(e) => this.handleFilterStatus(e)}
              >
                <option>Status..</option>
                {statusValues.map(statusValue => {
                  return <option key={statusValue.id} value={statusValue.id}>{statusValue.descricao}</option>
                })}
              </Input>
            </FormGroup>
            <TabelaPaginacao
              registrosPorPagina={4}
              fonteDeDados={nfs}
              colunas={[...columnsNF]}
            />
          </TableWrapper>
        </Container>
      </PageDefault>
    );
  }
}

export default Dashboard;
