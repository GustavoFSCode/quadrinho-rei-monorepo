import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.3);
`;

export const Container2 = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: end;
  justify-content: center;
  z-index: 99;
  background-color: rgba(0, 0, 0, 0.3);
  padding-bottom: 4.375rem;
`;

interface BoxProps {
  $gap?: string;
  $maxwidth: string;
  $maxheight: string;
}

export const Box = styled.div<BoxProps>`
  position: relative;
  width: 100%;
  height: 90vh;
  max-width: ${({ $maxwidth }) => $maxwidth};
  max-height: ${({ $maxheight }) => $maxheight};
  padding: 1.55rem 1.25rem;
  border-radius: 3.75rem;
  background-color: ${({ theme }) => theme.colors.neutral1};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: ${({ $gap }) => ($gap !== undefined ? $gap : '2rem')};
`;

export const BoxOverflow = styled.div`
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2.9688rem;

  &::-webkit-scrollbar {
    display: none;
  }
`;
