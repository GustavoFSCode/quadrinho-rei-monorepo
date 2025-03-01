import React from 'react';
import {
  TableContainer,
  Table,
  TableHeadCell,
  TableBodyCell,
  TableRow,
  TableHeadAction,
  ActionCell
} from './styled';
import Pencil from '@/components/icons/Pencil';
import Trash from '@/components/icons/Trash';
import ToggleButton from '@/components/Button/ToggleTable';
import { Client } from '@/services/clientService';

// Função para formatar a data de "YYYY-MM-DD" para "DD/MM/YYYY"
function formatDate(dateString: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

interface TabelaProps {
  clients: Client[];
}

function Tabela({ clients }: TabelaProps) {
  return (
    <TableContainer>
      <Table aria-label="tabela customizada">
        <thead>
          <tr>
            <TableHeadCell>Nome</TableHeadCell>
            <TableHeadCell>E-mail</TableHeadCell>
            <TableHeadCell>Data de nascimento</TableHeadCell>
            <TableHeadAction>Ações</TableHeadAction>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableBodyCell>{client.name}</TableBodyCell>
              <TableBodyCell>{client.user.email}</TableBodyCell>
              <TableBodyCell>{formatDate(client.birthDate)}</TableBodyCell>
              <ActionCell>
                {/* Ações podem ser implementadas conforme a necessidade */}
                <Trash onClick={() => {}} />
                <Pencil onClick={() => {}} />
                <ToggleButton />
              </ActionCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}

export default Tabela;
