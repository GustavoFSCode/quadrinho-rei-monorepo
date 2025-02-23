import styled from 'styled-components';

export const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Text = styled.p`
  font-weight: 400;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.neutral6};
  text-align: center;
`;

export const TextSub = styled.p`
  font-weight: 400;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.neutral5};
  text-align: center;
`;
