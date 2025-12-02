import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Position = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.neutral6};
  min-width: 3rem;
  text-align: center;
`;

export const Medal = styled.span`
  font-size: 1.5rem;
  margin-right: 0.25rem;
`;
