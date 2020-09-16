import styled from "styled-components";

export const Container = styled.div`
  width: 300px;
  height: calc(100vh - 50px);
  background: #576574;
  display: flex;
  box-shadow: 5px 5px 5px rgba(0,0,0,0.3);
  position: absolute;
  top: 50px;
  z-index: 9;

  @media(max-width:360px){
    height: calc(100vh - 50px);
    width: 100%;
    top: 50px;
  }
`;

export const MenuList = styled.ul`
  list-style: none;
  width: 100%;
  & > li {
    margin-top: 16px;
  }
  display: flex;
  flex-direction: column;
  align-items:flex-start;

  @media(max-width:360px){
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
  }
`;

export const MenuItem = styled.li`
  > a {
    text-decoration: none;
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 33px;
    text-align: center;
    color: #fff;
    margin-left: 16px;
    &:hover{
        opacity: 0.8;
        font-size: 22px;
        transition: font-size 0.3s;
    }
  }
`;