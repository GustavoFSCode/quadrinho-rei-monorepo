import { GlobalContainer } from '@/styles/global';
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

export const StyledContainer = styled(GlobalContainer)`
  max-width: 520px;
`;

export const Description = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral4};
`;

export const Value = styled.span`
  font-size: 1.25rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.neutral6};
`;

export const Closebutton = styled.button`
  position: absolute;
  top: 38px;
  right: 38px;
  width: 15px;
  height: 15px;
  background-image: url('/img/close2.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: none;
  background-color: transparent;
`;
