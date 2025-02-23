import React, { useState } from 'react';
import { TableContainer, Table, TableHeadCell, TableHeadAction, TableBodyCell, TableRow, ActionCell } from './styled';
import Pencil from '@/components/icons/Pencil';
import Trash from '@/components/icons/Trash';
import ToggleButton from '@/components/Button/ToggleButton';
import ModalEditarAdministrador from '@/components/Modals/Clientes/EditarCliente';
import ModalDescartation from '@/components/Modals/Clientes/ExcluirCliente/Descartation';

function Tabela() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescartationModalOpen, setDescartationModalOpen] = useState(false); // Estado para o modal de descarte
  const [selectedData, setSelectedData] = useState({
    nome: '',
    email: '',
    acesso: ''
  });

  const openModal = (data: { nome: string; email: string; acesso: string }) => {
    setSelectedData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const openDescartationModal = () => {
    setDescartationModalOpen(true);
  };

  const closeDescartationModal = (shouldCloseAll: boolean) => {
    setDescartationModalOpen(false);
    if (shouldCloseAll) {
      closeModal(); // Fecha o modal de edição se necessário
    }
  };

  const nomes = [
    'Maria Santos', 'Ana Paula', 'Gabriel Rodrigues', 'Rafael Costa',
    'Gustavo Santos', 'Peter Parker', 'Bruce Wayne', 'Clark Kent',
    'Tony Stark', 'Bruce Banner', 'Peter Quill', 'Wanda Maximoff',
    'Steve Rogers', 'Natasha Romanoff', 'Scott Lang'
  ].slice(0, 13);

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
            {nomes.map((nome, index) => (
              <TableRow key={index}>
                <TableBodyCell>{nome}</TableBodyCell>
                <TableBodyCell>email@email.com</TableBodyCell>
                <TableBodyCell>01/01/2000</TableBodyCell>
                <ActionCell>
                  <Trash onClick={openDescartationModal} /> {/* Abre o modal de descarte */}
                  <Pencil onClick={() => openModal({ nome, email: 'email@email.com', acesso: 'Admin' })} />
                  <ToggleButton />
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>
      {isModalOpen && <ModalEditarAdministrador onClose={closeModal} data={selectedData} />}
      {isDescartationModalOpen && <ModalDescartation onClose={closeDescartationModal} />}
    </>
  );
}

export default Tabela;
