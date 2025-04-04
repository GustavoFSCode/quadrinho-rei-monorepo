// styled.ts
import styled from "styled-components";

export const ToggleWrapper = styled.div`
  display: inline-block;
`;

export const ToggleSwitch = styled.div<{ isActive: boolean }>`
  width: 44px;
  height: 24px;
  background-color: ${({ isActive }) => (isActive ? "#4CAF50" : "#ccc")};
  border-radius: 24px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;
`;

export const ToggleCircle = styled.div<{ isActive: boolean }>`
  width: 16.5px;
  height: 16.5px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: ${({ isActive }) => (isActive ? "24px" : "4px")};
  transition: left 0.3s ease;
`;
