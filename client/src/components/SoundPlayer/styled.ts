import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding-left: 20px;
  width: 100%;
`;

export const IconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const TimeStamp = styled.span`
  font-size: 14px;
  color: #747373;
  font-weight: 400;
  min-width: 40px;
  text-align: center;
`;

export const ProgressBar = styled.div`
  position: relative;
  width: 125px;
  height: 3px;
  background-color: #A2A2A2;
  cursor: pointer;
  border-radius: 2px;
  margin: 0 5px;

  .thumb {
    position: absolute;
    top: -6px;
    width: 15px;
    height: 15px;
    border: 1px solid var(--Neutro-Color-2, #D1D0D0);
    background-color: #FFFFFF;
    border-radius: 50%;
    transform: translateX(-50%);
  }
`;

export const Progress = styled.div`
  position: absolute;
  height: 100%;
  border-radius: 2px;
`;
