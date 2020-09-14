import React, { Component } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import PageDefault from "../Default";
import Upload from "../../components/Upload";
import ModalUpload from "../../components/ModalUpload";

import api from "../../services/api";
import { getUserId, isMatriz } from "../../services/auth";

import { Container, UploadWrapper, TableWrapper } from "./styles";
import { Table } from "reactstrap";

class Dashboard extends Component {
  state = {
    uploadedFiles: [],
    nfs: [],
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
    const nfs = await this.fetchData()

    this.setState({
      uploadedFiles: this.state.uploadedFiles.map((uploadedFile) => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      }),
      nfs: nfs.data
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
    const nfs = await this.fetchData()
    this.setState({ ...this.state, nfs: nfs.data });
  }

  async fetchData() {
    try {
      let response = {};

      if (isMatriz()) {
        response = await api.get("nf");
      } else {
        const loja = await api.get(`loja/${getUserId()}`);
        response = await api.get("nf", { headers: { CNPJ: loja.data.CNPJ } });
      }

      return response      
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const columnsNF = [
      {
        dataField: "CHAVE_NF",
        text: "Chave",
      },
      {
        dataField: "DT_EMISSAO",
        text: "Emissão",
      },
      {
        dataField: "TOTAL_NF",
        text: "Total NF",
      },
      {
        dataField: "CNPJ_EMISSOR",
        text: "CNPJ Emissor",
      },
      {
        dataField: "CNPJ_FAVORECIDO",
        text: "CNPJ Favorecido",
      },
      {
        dataField: "RAZAOSOCIAL_EMISSOR",
        text: "Razão Favorecido",
      },
    ];
    const { uploadedFiles, nfs } = this.state;
    const uploading =
      !!uploadedFiles.length && uploadedFiles[uploadedFiles.length - 1].uploaded
        ? true
        : false;

    return (
      <PageDefault>
        <Container className="dashboard-container">
          {uploading && <ModalUpload files={uploadedFiles} />}
          <UploadWrapper className="upload-wrapper">
            <Upload onUpload={this.handleUpload} />
          </UploadWrapper>
          <TableWrapper>
            <Table responsive hover>
              <thead>
                <tr>
                  {columnsNF.map((column) => (
                    <th key={column.dataField}>{column.text}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nfs.map((nf) => {
                  return (
                    <tr key={nf.id}>
                      <td>{nf.CHAVE_NF}</td>
                      <td>
                        {new Date(nf.DT_EMISSAO).toLocaleDateString("pt-BR")}
                      </td>
                      <td>{nf.TOTAL_NF}</td>
                      <td>{nf.CNPJ_EMISSOR}</td>
                      <td>{nf.CNPJ_FAVORECIDO}</td>
                      <td>{nf.RAZAOSOCIAL_EMISSOR}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        </Container>
      </PageDefault>
    );
  }
}

export default Dashboard;
