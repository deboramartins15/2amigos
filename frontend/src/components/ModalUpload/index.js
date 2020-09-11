import React, { useState } from "react";

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { CircularProgressbar } from "react-circular-progressbar";

import { MdCheckCircle, MdError } from "react-icons/md";
import { Container } from './styles'

function ErrorModal({ files }) {
  const [modal, setModal] = useState(true);

  const toggle = () => setModal(!modal);

  return (
    <div>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Integração de Notas Fiscais</ModalHeader>
        <ModalBody>
          <Container>
            {files.map((uploadedFile) => (
              <li key={uploadedFile.id}>
                <strong>{uploadedFile.name}</strong>
                <div>
                  {!uploadedFile.uploaded && !uploadedFile.error && (
                    <CircularProgressbar
                      styles={{
                        root: { width: 24 },
                        path: { stroke: "rgb(19,123,174)" },
                      }}
                      strokeWidth={10}
                      percentage={uploadedFile.progress}
                    />
                  )}
                  
                  {uploadedFile.uploaded && (
                    <MdCheckCircle size={24} color="#78e5d5" />
                  )}
                  {uploadedFile.error && <MdError size={24} color="#e57878" />}
                </div>
              </li>
            ))}
          </Container>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default ErrorModal;
