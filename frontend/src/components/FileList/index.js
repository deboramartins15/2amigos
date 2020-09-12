import React from "react";
import {CircularProgressbar} from "react-circular-progressbar";
import { MdCheckCircle, MdError } from "react-icons/md";

import { Container, FileInfo } from "./styles";

const FileList = ({ files }) => (
  <Container>
    {files.map(uploadedFile => (
      <li key={uploadedFile.name}>
        <FileInfo>
          <div>
            <strong>{uploadedFile.name}</strong>
            <span>
              {uploadedFile.readableSize}{" "}             
            </span>
          </div>
        </FileInfo>

        <div>
          {!uploadedFile.uploaded &&
            !uploadedFile.error && (
              <CircularProgressbar
                styles={{
                  root: { width: 24 },
                  path: { stroke: "rgb(19,123,174)" }
                }}
                strokeWidth={10}
                percentage={uploadedFile.progress}
              />
            )}
          
          {uploadedFile.uploaded && <MdCheckCircle size={24} color="#78e5d5" />}
          {uploadedFile.error && <MdError size={24} color="#e57878" />}
        </div>
      </li>
    ))}
  </Container>
);

export default FileList;
