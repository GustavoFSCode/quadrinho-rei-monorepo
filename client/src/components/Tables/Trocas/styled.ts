// src/components/Tables/Trocas/styled.ts
import styled from 'styled-components';

export const TableContainer = styled.div`
  background-color: #ffffff;
  height: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar {
    width: 4px;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeadCell = styled.th<{ center?: boolean }>`
  padding: 10px 0 8px;
  height: 38px;
  color: #747373;
  font-weight: 500;
  text-align: ${({ center }) => (center ? 'center' : 'left')};
  ${({ center }) => !center && 'padding-left: 15px;'}
`;

export const TableHeadAction = styled.th`
  padding: 10px 0 8px;
  height: 38px;
  color: #747373;
  font-weight: 500;
  text-align: right;
  padding-right: 47px;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #ffffff;
  }
`;

export const TableBodyCell = styled.td<{
  center?: boolean;
  right?: boolean;
}>`
  border-bottom: 1px solid #ddd;
  height: 58px;
  padding: 0;
  ${({ center, right }) =>
    center
      ? 'text-align: center;'
      : right
      ? 'text-align: right; padding-right: 47px;'
      : 'padding-left: 15px;'}
`;
