import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

export const UploadWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 30px;
  background: #576574;
  border-radius: 4px;
  padding: 20px;
`;

export const TableWrapper = styled.div`
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction:column;
  justify-content: center;
  /* max-height: 470px;   */
  /* overflow-y: auto; */
  margin-top: 16px;

  .form-group{
    width: 418px;
    margin-left: ${(props) => props.marginInput}
  }
`;
