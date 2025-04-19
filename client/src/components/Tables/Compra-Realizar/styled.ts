import styled from 'styled-components';

export const TableContainer = styled.div`
  background-color: #ffffff;
  width: 700px;
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
  padding: 0 15px;
  border-collapse: collapse;
`;

export const TableHead = styled.thead``;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #ffffff;
  }
`;

export const TableHeadCell = styled.th<{ center?: boolean }>`
  padding: 10px 0 8px;
  padding-left: 10px;
  height: 38px;
  font-weight: 500;
  color: #747373;
  text-align: left;

  ${({ center }) =>
    center &&
    `
    text-align: center;
  `}
`;

export const TableBodyCell = styled.td<{
  productTitle?: boolean;
  center?: boolean;
}>`
  border-bottom: 1px solid #ddd;
  height: 38px;
  padding-left: 10px;

  ${({ productTitle }) =>
    productTitle &&
    `
    max-width: 250px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}

  ${({ center }) =>
    center &&
    `
    text-align: center;
  `}
`;
