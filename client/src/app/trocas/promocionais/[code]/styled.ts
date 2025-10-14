import styled from 'styled-components';

export const ContentContainer = styled.div<{ isExpanded: boolean }>`
  background-color: #ffffff;
  height: 100vh;
  margin-left: ${props => (props.isExpanded ? '200px' : '80px')};
  border-radius: 8px;
  padding-top: 32px;
  font-family: 'Primary', sans-serif;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;

  @media (max-width: 756px) {
    padding-right: 20px;
    padding-left: 25px;
    height: auto;
  }
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 44px;
  height: 4vh;
  width: 100%;

  @media (max-width: 756px) {
    padding-left: 20px;
  }
`;

export const HeaderTitle = styled.div`
  font-size: 24px;
  font-weight: 400;
  color: #333;
`;

export const Content = styled.div`
  margin-left: 44px;
  margin-right: 44px;
  padding-bottom: 0;
  border-radius: 4px;
`;

export const InfoSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 6px;
`;

export const InfoText = styled.p`
  margin: 5px 0;
  font-size: 14px;
  color: #555;

  strong {
    color: #333;
  }
`;
