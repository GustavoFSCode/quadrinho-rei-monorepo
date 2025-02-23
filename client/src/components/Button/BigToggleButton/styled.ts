import styled from 'styled-components';

export const ToggleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 200px;
`;

export const Label = styled.label`
  font-size: 14px;
  text-align: left;
  font-weight: 500;
  color: #555;
  margin-bottom: 5px;
`;

interface ToggleContainerProps {
  isActive: boolean;
  readOnly?: boolean;
}

export const ToggleContainer = styled.div<ToggleContainerProps>`
  width: 200px;
  height: 38px;
  border-radius: 25px;
  background-color: ${({ isActive }) => (isActive ? '#7EEE8B' : '#FFD2D2')};
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

interface ToggleCircleProps {
  isActive: boolean;
}

export const ToggleCircle = styled.div<ToggleCircleProps>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #FFFFFF;
  box-shadow: 0px 0px 4px 0px #00000040;
  position: absolute;
  top: 3px;
  left: 3px;
  z-index: 2;
  transform: ${({ isActive }) => (isActive ? 'translateX(161px)' : 'translateX(1px)')};
  transition: transform 0.45s ease-in-out;
`;

export const ToggleText = styled.span`
  position: absolute;
  width: 100%;
  height: 100%;
  font-size: 16px;
  font-weight: 400;
  color: #2D2D2D;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;
