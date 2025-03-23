import styled from 'styled-components';

export const Container = styled.div`
  padding: 3px;
  border-radius: 1000px;
  border: 0.0938rem solid ${({ theme }) => theme.colors.neutral2};
  display: flex;
`;
export const StyledInput = styled.input`
  text-align: center;
  border: none;
  font-size: 1.125rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
  width: max-content;
`;
export const IncrementButton = styled.button`
  border: none;
  background-color: transparent;
  background-image: url('/assets/images/increment.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 22px;
  height: 22px;
`;
export const DecrementButton = styled.button`
  border: none;
  background-color: transparent;
  background-image: url('/assets/images/decrement.svg');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  width: 22px;
  height: 22px;
`;
