import styled from 'styled-components';

export const Container = styled.div``;

export const Label = styled.label`
  font-size: 0.9375rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &::before {
    content: '';
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid ${({ theme }) => theme.colors.primary10};
    border-radius: 50%;
  }
`;

export const StyledInput = styled.input`
  display: none;

  &:checked ~ label {
    &::before {
      padding: 0.3125rem;
      background-color: ${({ theme }) => theme.colors.primary10};
      background-image: url('/img/check.svg');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 0.875rem 1.25rem;
    }
  }
`;
