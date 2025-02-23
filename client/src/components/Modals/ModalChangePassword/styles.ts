import styled from 'styled-components';

export const Title = styled.span`
  font-family: 'Super Brain';
  font-weight: 400;
  font-size: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary10};
  -webkit-text-stroke: 1px ${({ theme }) => theme.colors.neutral1};
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

export const Form = styled.form`
  width: 100%;
  max-width: 415px;
  margin: 0 auto;
`;
