import styled from "styled-components";

interface StyledTextareaProps {
  width?: string;
  height?: string;
}

export const TextareaWrapper = styled.div<{ width?: string }>`
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

export const StyledTextarea = styled.textarea<StyledTextareaProps>`
  display: block;
  width: 100%;
  height: ${({ height }) => height || '150px'};  /* Altura maior para o textarea */
  padding: 12px 16px;
  border-radius: 15px;  /* Arredondamento menor para textarea */
  font-size: 16px;
  color: #333;
  outline: none;
  border: 1px solid #a2a2a2;
  font-family: "Primary", sans-serif;
  resize: none;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
    padding: 5px;
  }


  &::placeholder {
    color: #A2A2A2;
    font-size: 14.5px;
    font-weight: 400;
  }

  &:focus {
    box-shadow: 0px 0px 6px rgba(63, 81, 181, 0.3);
  }
`;
