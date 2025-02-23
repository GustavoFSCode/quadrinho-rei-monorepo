import styled from "styled-components";

export const MicButton = styled.button<{ isRecording?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px; 
  background: ${({ isRecording }) => (isRecording ? 'red' : 'none')};
  border: none;
  cursor: pointer;
  border-radius: 50%;
  width: 30px;
  height: 30px;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ isRecording }) => (isRecording ? '#fff' : '#aaa')};
  }
`;
