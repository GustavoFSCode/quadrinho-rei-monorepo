import styled from 'styled-components';

export const Container = styled.div``;

interface CheckboxLabelProps {
  $inverted: boolean;
}

export const CheckboxLabel = styled.label<CheckboxLabelProps>`
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral4};
  display: flex;
  align-items: center;
  flex-direction: ${({ $inverted }) =>
    $inverted === true ? 'row-reverse' : 'row'};
  gap: 0.75rem;

  &::before {
    content: '';
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border: 1px solid #D1D0D0;
    border-radius: 0.3125rem;
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
