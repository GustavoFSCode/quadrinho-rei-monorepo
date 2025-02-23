import styled from 'styled-components';

export const Container = styled.div`
  position: relative;

  &:hover {
    p {
      display: block;
    }
  }
`;

export const Message = styled.p`
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  padding: 0.625rem;
  background: ${({ theme }) => theme.colors.neutral1};
  border: 1px solid #d1d0d0;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 1.25rem;
  color: ${({ theme }) => theme.colors.neutral6};
  font-size: 1rem;
  font-weight: 400;
  width: 370px;
`;
