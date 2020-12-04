import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 70px;

  > span {
    height: 20px;
    color: red;
    margin-bottom: 16px;
  }

  .row-buttons {
    justify-content: flex-end;

    Button{      
      width: 100px;
    }
  }

  @media (max-width: 360px) {
    height: calc(100vh - 70px);
    width: 100%;
    top: 60px;
  }
`;

export const TableWrapper = styled.div`
  display: flex;
  justify-content: center;
  max-height: 350px;
  overflow-y: auto;
  margin-top: 10px;

  @media (max-width: 360px) {
    margin-top: 16px;
  }
`;
