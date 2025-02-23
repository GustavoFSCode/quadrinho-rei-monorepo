import styled from "styled-components";

interface StyledInputProps {
  width?: string;
  height?: string;
  hasIcon?: boolean;
  textAlign?: string;
}

export const InputWrapper = styled.div<{ width?: string; hasIcon?: boolean }>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ width }) => width || '365px'};

  .icon-wrapper {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 20px;
      height: 20px;
      color: #aaa;
    }
  }
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
  border-radius: 25px;
  font-size: 16px;
  color: #333;
  outline: none;
  border: 1px solid #a2a2a2;
  text-align: ${({ textAlign }) => textAlign || 'left'};

  &::placeholder {
    color: #aaa;
  }
`;
