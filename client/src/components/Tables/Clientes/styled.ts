import styled from 'styled-components';

export const TableContainer = styled.div`
  background-color: #FFFFFF;
  height: 518px;
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
  padding-right: 15px;
  padding-left: 15px;

`;

export const TableHeadCell = styled.th`
  padding: 10px 0px 8px;
  height: 38px;
  text-align: left;
  color: #747373;
  font-weight: 500;
`;

export const TableHeadAction = styled.th`
  padding-right: 47px;
  text-align: right;
  height: 38px;
  color: #747373;
  font-weight: 500;
`;

export const TableBodyCell = styled.td`
  border-bottom: 1px solid #ddd;
  height: 38px;

`;

export const ActionCell = styled(TableBodyCell)`
  text-align: right;
  display: flex;
  height: 38px;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #FFFFFF;
  }

`;
