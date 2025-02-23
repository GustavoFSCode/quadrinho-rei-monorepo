import styled, { css } from 'styled-components';

const color = '#6B75D1';
const timing = '0.0s';

interface DropdownProps {
  width: string;
}

interface DropdownContainerProps extends DropdownProps {
  isCustomOptionSelected: boolean;
}

export const DropdownContainer = styled.div<DropdownContainerProps>`
  position: relative;
  display: inline-block;
  width: ${(props) => props.width};
  height: 44px;
  cursor: pointer;
  text-align: left;
  color: #444;
  border: 2px solid #6B75D1;
  border-radius: 20px;
  background-color: white;
  transition: ${timing} all ease-in-out;
  padding: 10px 20px;
  box-sizing: border-box;

  &.expanded {
    border-radius: 20px 20px 0 0;
    box-shadow: rgba(0, 0, 0, 0.1) 3px 3px 5px 0px;
    border-bottom: none;

    ${({ isCustomOptionSelected }) =>
      isCustomOptionSelected &&
      css`
        border-radius: 0px 20px 0 0;
      `}
  }
`;

export const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  font-size: 20px;
  font-weight: 400;
  font-family: "Primary";
  color: #6B75D1;
`;

export const DropdownArrow = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

interface DropdownListProps extends DropdownProps {
  isCustomOptionSelected: boolean;
}

export const DropdownList = styled.ul<DropdownListProps>`
  position: absolute;
  top: 100%;
  max-height: 18em;
  width: calc(${(props) => props.width});
  margin-left: -21.5px;
  overflow-y: auto; 
  background: #fff;
  border-right: 2px solid #6B75D1;
  border-left: 2px solid #6B75D1;
  border-bottom: 2px solid #6B75D1;
  border-radius: 0 0 20px 20px;
  box-shadow: rgba(0, 0, 0, 0.1) 3px 3px 5px 0px;
  z-index: 1000;
  list-style: none;
  box-sizing: border-box;

  ${({ isCustomOptionSelected }) =>
    isCustomOptionSelected &&
    css`
      border-radius: 0 0 20px 0px;
    `}
`;

export const DropdownItem = styled.li`
  width: 100%;
`;

export const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0.01;
  width: 1px;
  height: 1px;
`;

interface DropdownLabelProps {
  isSelected: boolean;
}

export const DropdownLabel = styled.label<DropdownLabelProps>`
  display: block;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: color ${timing} ease-in-out;
  color: #747373;
  font-size: 17px;
  font-weight: 400;
  box-sizing: border-box;

  &:hover {
    background: #f0f8ff;
  }

  ${({ isSelected }) =>
    isSelected &&
    css`
      color: #6B75D1;
    `}

  ${({ htmlFor }) =>
    htmlFor &&
    css`
      border-top: none;
      border-bottom: 0.06em solid #d9d9d9;

      &:first-child {
        border-top: none;
      }

      &:last-child {
        border-bottom: none;
      }
    `}
`;

export const CustomBox = styled.div`
  position: absolute;
  top: 0; 
  right: 200px;
  width: 300px; 
  height: 267px; 
  background-color: #fff;
  border: 2px solid #6B75D1;
  border-right: 1px solid #D1D0D0;
  border-radius: 20px 0 0 20px;
  z-index: 1000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const PersonalizedTittle =  styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;
  font-weight: 400;
  color: #454545;
`;

export const PersonalizedInput = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;

  label{
    font-size: 14px;
    color: #454545;
  }
`;

export const PersonalizedButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
