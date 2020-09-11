import React, { useState, useEffect } from "react";
import { uniqueId } from "lodash";
import filesize from "filesize";

import PageDefault from "../Default";
import Upload from "../../components/Upload";

import api from "../../services/api";
import { getUserId } from "../../services/auth";

import { Container, UploadWrapper } from "./styles";

function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
    data.append("login",getUserId())

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
          id: response.data._id,
          url: response.data.url,
        });
      })
      .catch(() => {
        updateFile(uploadedFile.id, {
          error: true,
        });
      });
  }

  return (
    <PageDefault>
      <Container className="dashboard-container">
        <UploadWrapper className="upload-wrapper">
          <Upload onUpload={handleUpload} />
        </UploadWrapper>
      </Container>
    </PageDefault>
  );
}

export default Dashboard;
