import styled from "styled-components";
import { Menu } from "@styled-icons/evaicons-solid/Menu";

export const Container = styled.div`
  width: 100%;
  height: 55px;
  background: var(--highlight-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  > span {
    font-style: normal;
    font-weight: normal;
    font-size: 24px;
    line-height: 42px;
    text-align: center;
    color: #fff;
  }
`;

export const BurguerButton = styled(Menu)`
  fill: #fff;
  width: 32px;
  height: 32px;
  cursor: pointer;
  &:hover{
      opacity: 0.8;
  }
`;

