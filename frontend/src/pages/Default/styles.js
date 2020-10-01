import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const Wrapper = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-content: center;
  > h2 {
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 42px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-color);
    margin: 0;
    margin-left: 16px;
    @media (max-width: 320px) {
      font-size: 22px;
    }
    @media (max-width: 230px) {
      font-size: 20px;
    }
  }
  > a {
    text-decoration: none;
  }
  margin: 16px 0;
  position: absolute;
  top: 60px;
`;
