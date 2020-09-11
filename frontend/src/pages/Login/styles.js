import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  > span {
    color: red;
  }
`;

export const Wrapper = styled.div`
  width: 400px;
  height: 320px;
  background: var(--primary-color);
  border-radius: 8px;
  box-shadow: 0 0.2rem 1.2rem rgba(0,0,0,0.2);
`;

export const Header = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  > span {
    width: 100%;
    height: 8px;
    background: var(--highlight-color);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  > h3 {
    color: rgb(0, 0, 0, 0.7);
    margin-top: 32px;
    font-size: 23px;
  }
`;

export const FormLogin = styled.form`
  width: 100%;
  height: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

export const Input = styled.input`
  width: 250px;
  height: 30px;
  background: #fff;
  border: 1px solid var(--text-color);
  border-radius: 8px;
  margin: 5px 0;
  outline: none;
  padding: 5px;
  @media (max-width: 320px) {
    width: 189.47px;
    height: 28px;
  }
`;

export const Button = styled.input`
  width: 300px;
  height: 45px;
  background: var(--highlight-color);
  border-radius: 8px;
  border: 0;
  color: #fff;
  text-align: center;
  margin-top: 24px;
  font-size: 18px;
  cursor: pointer;
  outline: none;
  &:hover {
    opacity: 0.9;
  }
  @media (max-width: 320px) {
    width: 206px;
    height: 36px;
    font-size: 16px;
  }
`;
