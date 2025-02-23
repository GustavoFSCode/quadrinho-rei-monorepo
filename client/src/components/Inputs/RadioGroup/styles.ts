import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
`;

export const Span = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
`;

export const Group = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.875rem;
`;
