import styled from 'styled-components';

export const TableContainer = styled.div`
  background-color: #FFFFFF;
  height: 75vh;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  min-width: 700px;
  height: 74vh;
  padding-right: 10px;
  padding-left: 10px;

`;

export const TableHeadCell = styled.th`
  padding: 10px 0px 8px;
  text-align: left;
  color: #747373;
  font-weight: 500;
`;

export const TableHeadAction = styled.th`
  padding-right: 35px;
  text-align: right;
  color: #747373;
  font-weight: 500;
`;

export const TableBodyCell = styled.td`
  border-bottom: 1px solid #ddd;
`;

export const ActionCell = styled(TableBodyCell)`
  text-align: right;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #FFFFFF;  
  }

`;
