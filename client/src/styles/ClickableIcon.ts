import styled from "styled-components";

interface ClickableIconProps {
  width?: string;
  height?: string;
}

const ClickableIcon = styled.svg<ClickableIconProps>`
  cursor: pointer;
  width: ${(props) => props.width || '30px'};
  height: ${(props) => props.height || '30px'};
  transition: background-color 0.3s ease, border-radius 0.3s ease;
  border-radius: 50%;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default ClickableIcon;
