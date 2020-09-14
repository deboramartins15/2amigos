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
`;