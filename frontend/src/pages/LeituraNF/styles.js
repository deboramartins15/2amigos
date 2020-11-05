import styled from "styled-components";

export const Wrapper = styled.div`
  width: 100%;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 80px;

  > span {
    height: 20px;
    color: red;
    margin-bottom: 16px;
  }

  overflow-y: auto;

  .container{
    margin-left: 100px;    
    padding: 0;
  }
`;

export const TableWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 90%;
  justify-content: center;
  max-height: 350px;
  margin-top: 15px;
  margin-left: 70px;

  @media (max-width: 360px) {
    margin-top: 16px;
  }
`;
