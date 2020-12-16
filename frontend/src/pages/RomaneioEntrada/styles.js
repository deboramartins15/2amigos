import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 16px;

  .row-buttons {
    justify-content: flex-end;
  }
`;

export const Header = styled.h2`
  font-size: 22px;
  color: gray;
  margin-bottom: 30px;  
`;
