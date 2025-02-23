import styled from "styled-components";

interface StyledInputProps {
  width?: string;
  height?: string;
  hasIcon?: boolean;
  textAlign?: string;
}

export const InputWrapper = styled.div<{ width?: string }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ width }) => width || '365px'};
`;

export const Label = styled.label`
  font-size: 14px;
  text-align: left;
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
`;

export const StyledInput = styled.input<StyledInputProps>`
  display: block;
  width: 100%;
  height: ${({ height }) => height || '39px'};
  padding: 8px 12px;
  padding-left: ${({ hasIcon }) => (hasIcon ? '40px' : '16px')};
  padding-right: 16px;
  border-radius: 25px;
  font-size: 16px;
  color: #333;
  outline: none;
  border: 1px solid #a2a2a2;
  text-align: ${({ textAlign }) => textAlign || 'left'};

  &::placeholder {
    color: #aaa;
  }

  &[type="date"] {
    position: relative;
    text-transform: uppercase;
    font-size: 14px;
    color: #747473;

    &::-webkit-calendar-picker-indicator {
      opacity: 0;
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    &::placeholder {
      color: #aaa;
    }

    &::-ms-clear {
      display: none;
    }

    &::-webkit-clear-button {
      display: none;
    }
  }
`;
