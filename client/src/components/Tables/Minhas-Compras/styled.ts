import styled from 'styled-components';

export const TableContainer = styled.div`
  background-color: #ffffff;
  width: 100%;
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

export const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 3rem;

  span {
    font-size: 20px;
    color: #333;
  }

  div {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #555;

    span + span {
      margin-left: 10px;
    }
  }
`;

export const OrderText = styled.span`
  font-size: 16px;
  color: #333;
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
    justify-items: center;
    `}
`;

// Novo styled para o input checkbox
export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;

  &:checked {
    background-color: #ffe812;
    border-color: #ffe812;
  }

  &:checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 0px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;
