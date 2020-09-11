import React, { useState, useEffect } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import PageDefault from "../Default";
import Upload from "../../components/Upload";
import ModalUpload from "../../components/ModalUpload";

import api from "../../services/api";
import { getUserId } from "../../services/auth";

import { Container, UploadWrapper, TableWrapper } from "./styles";
import { Table } from "reactstrap";

function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [nfs,setNfs] = useState([])

  function handleUpload(files) {
    const uploadedFiles = files.map((file) => ({
      file,
      id: uniqueId(),
      name: file.name,
      readableSize: filesize(file.size),
      progress: 0,
      uploaded: false,
      error: false,
    }));

    setUploadedFiles(uploadedFiles.concat(uploadedFiles));
    
    setUploading(true)
    uploadedFiles.forEach(processUpload);
  }

  function updateFile(id, data) {
    setUploadedFiles({
      uploadedFiles: uploadedFiles.map((uploadedFile) => {
        return id === uploadedFile.id
          ? { ...uploadedFile, ...data }
          : uploadedFile;
      }),
    });
  }

  function processUpload(uploadedFile) {
    const data = new FormData();

    data.append("file", uploadedFile.file, uploadedFile.name);
    data.append("login", getUserId());

    api
      .post("nf", data, {
        onUploadProgress: (e) => {
          const progress = parseInt(Math.round((e.loaded * 100) / e.total));

          updateFile(uploadedFile.id, {
            progress,
          });
        },
      })
      .then((response) => {
        updateFile(uploadedFile.id, {
          uploaded: true,
          id: response.data._id
        });
      })
      .catch(() => {
        updateFile(uploadedFile.id, {
          error: true,
        });
      });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await api.get('nf',{headers:{ CNPJ: ''}})
        const response = await api.get('nf')

        setNfs(response.data)
      } catch (error) {
        console.log(error)
      }
    }
    
    fetchData()
  },[uploadedFiles])

  const columnsNF = [
    {
      dataField: "CHAVE_NF",
      text: "Chave"
    },
    {
      dataField: "NUMERO_NF",
      text: "Numero"
    },
    {
      dataField: "SERIE_NF",
      text: "Serie"
    },
    {
      dataField: "DT_EMISSAO",
      text: "Emissão"
    },
    {
      dataField: "TOTAL_NF",
      text: "Total NF"
    },
    {
      dataField: "TOTAL_PRODUTOS",
      text: "Total Produtos"
    },
    {
      dataField: "total_frete",
      text: "Total Frete"
    },
    {
      dataField: "CNPJ_EMISSOR",
      text: "CNPJ Emissor"
    },
    {
      dataField: "CNPJ_FAVORECIDO",
      text: "CNPJ Favorecido"
    },
    {
      dataField: "RAZAOSOCIAL_EMISSOR",
      text: "Razão Favorecido"
    }
  ];

  return (
    <PageDefault>
      <Container className="dashboard-container">
        {/* {uploading && <ModalUpload files={uploadedFiles}/>} */}
        <UploadWrapper className="upload-wrapper">
          <Upload onUpload={handleUpload} />
        </UploadWrapper>
        <TableWrapper>
          <Table responsive striped hover>
            <thead>
            <tr>
              {columnsNF.map(column => (
                <th key={column.dataField}>{column.text}</th>
              ))}
            </tr>
            </thead>
            <tbody>
              {nfs.map(nf =>{
                return(
                  <tr key={nf.id}>
                    <td>{nf.CHAVE_NF}</td>
                    <td>{nf.NUMERO_NF}</td>
                    <td>{nf.SERIE_NF}</td>
                    <td>{new Date(nf.DT_EMISSAO).toLocaleDateString('pt-BR')}</td>
                    <td>{nf.TOTAL_NF}</td>
                    <td>{nf.TOTAL_PRODUTOS}</td>
                    <td>{nf.total_frete}</td>
                    <td>{nf.CNPJ_EMISSOR}</td>
                    <td>{nf.CNPJ_FAVORECIDO}</td>
                    <td>{nf.RAZAOSOCIAL_EMISSOR}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>
    </PageDefault>
  );
}

export default Dashboard;
