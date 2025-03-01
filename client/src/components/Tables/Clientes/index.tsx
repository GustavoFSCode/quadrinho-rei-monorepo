// components/Tables/Clientes.tsx
import React, { useState } from 'react';
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
import ModalDescartation from '@/components/Modals/Clientes/ExcluirCliente/Descartation';
import { Client, blockUser } from '@/services/clientService';

// Função para formatar a data "YYYY-MM-DD" para "DD/MM/YYYY"
function formatDate(dateString: string): string {
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

interface TabelaProps {
  clients: Client[];
  onClientDeleted: () => void;
  onUserToggled: () => void;
}

function Tabela({ clients, onClientDeleted, onUserToggled }: TabelaProps) {
  const [isDescartationModalOpen, setDescartationModalOpen] = useState(false);
  const [selectedUserDocumentId, setSelectedUserDocumentId] = useState<string | null>(null);

  const openDescartationModal = (userDocumentId: string) => {
    setSelectedUserDocumentId(userDocumentId);
    setDescartationModalOpen(true);
  };

  const closeDescartationModal = (shouldCloseAll: boolean) => {
    setDescartationModalOpen(false);
    setSelectedUserDocumentId(null);
  };

  // Função para alternar bloqueio/desbloqueio do usuário
  const handleToggleBlocked = async (userDocumentId: string) => {
    try {
      await blockUser(userDocumentId);
      onUserToggled(); // Atualiza a lista de clientes
    } catch (error) {
      console.error("Erro ao bloquear/desbloquear usuário:", error);
    }
  };

  return (
    <>
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
                  <Trash onClick={() => openDescartationModal(client.user.documentId)} />
                  <Pencil onClick={() => {}} />
                  <ToggleButton
                    isActive={!client.user.blocked} // Se o usuário não estiver bloqueado, toggle ativo
                    onToggle={() => handleToggleBlocked(client.user.documentId)}
                  />
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {isDescartationModalOpen && selectedUserDocumentId && (
        <ModalDescartation
          onClose={closeDescartationModal}
          userDocumentId={selectedUserDocumentId}
          onDeleted={onClientDeleted}
        />
      )}
    </>
  );
}

export default Tabela;
