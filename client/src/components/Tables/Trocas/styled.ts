// src/components/Tables/Trocas/styled.ts
import styled from 'styled-components';

type Align = 'left' | 'center' | 'right';

const cellPadding = '0 15px';

export const TableContainer = styled.div`
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHeadCell = styled.th<{ align?: Align; paddingLeft?: string }>`
  padding: 10px ${cellPadding};
  padding-left: ${({ paddingLeft }) => paddingLeft};
  height: 38px;
  color: #747373;
  font-weight: 500;
  text-align: ${({ align = 'left' }) => align};
`;

export const TableBodyCell = styled.td<{ align?: Align }>`
  border-bottom: 1px solid #ddd;
  height: 58px;
  padding: ${cellPadding};
  text-align: ${({ align = 'left' }) => align};
  justify-items: center;
`;

export const TableBody = styled.tbody``;

export const TableRow = styled.tr``;
