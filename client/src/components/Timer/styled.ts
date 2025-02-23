// styled.ts

import styled from 'styled-components';

interface DisplayWrapperProps {
  width?: string;
  height?: string;
  isLessThanOneMinute?: boolean;
  isCountdown?: boolean; // Nova prop para determinar o modo
}

interface TimeDisplayProps {
  isLessThanOneMinute?: boolean;
}

interface IconWrapperProps {
  center?: boolean;
}

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DisplayLabel = styled.label`
  font-size: 14px;
  color: #555;
  margin-bottom: 5px; 
`;

export const DisplayWrapper = styled.div<DisplayWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: ${({ isCountdown }) => (isCountdown ? 'space-between' : 'center')};
  height: ${({ height }) => height || '39px'};
  width: ${({ width }) => width || '150px'};
  padding: 0 5px;
  border-radius: 25px;
  border: 2px solid ${({ isLessThanOneMinute }) => (isLessThanOneMinute ? 'var(--red-80)' : '#6B75D1')};
  background-color: ${({ isLessThanOneMinute }) => (isLessThanOneMinute ? '#FFD2D2' : '#fff')};
`;

export const TimeDisplay = styled.span<TimeDisplayProps>`
  font-family: "Primary";
  font-size: 16px;
  font-weight: 500;
  color: ${({ isLessThanOneMinute }) => (isLessThanOneMinute ? '#DE3737' : '#454545')};
  margin-left: 5px;
`;

export const IconWrapper = styled.div<IconWrapperProps>`
  display: flex;
  align-items: center;
  padding-left: ${({ center }) => (center ? '0' : '5px')};
  padding-right: ${({ center }) => (center ? '0' : '5px')};
  cursor: pointer;
`;
