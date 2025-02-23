// Tabela.tsx
import React, { useState } from 'react';
import {
  TableContainer, Table, TableHeadCell, TableHeadAction,
  TableBodyCell, TableRow, ActionCell
} from './styled';
import Pencil from '@/components/icons/Pencil';
import Trash from '@/components/icons/Trash';
import ToggleButton from '@/components/Button/ToggleTable';
import ModalEditarCliente from '@/components/Modals/Clientes/EditarCliente';
import ModalDescartation from '@/components/Modals/Clientes/ExcluirCliente/Descartation';

function Tabela() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescartationModalOpen, setDescartationModalOpen] = useState(false);

  // Aqui guardamos o user selecionado
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // EXEMPLO DE DADO FAKE COMPLETO:
  const fakeUser = {
    name: 'Tony Stark',
    birthDate: '1970-05-29',
    gender: 'Masculino',
    cpf: '123.456.789-10',
    phone: '(21) 99999-8888',
    typePhone: 'Celular',
    email: 'tony@starkindustries.com',
    ranking: 5,
    addresses: [
      {
        addressId: 1, // ID do endereço -> se tiver, consideramos já existente
        nameAddress: 'Cobrança #1',
        TypeAddress: 'Cobrança',
        typeLogradouro: 'Avenida',
        nameLogradouro: 'Stark Indústrias',
        number: '100',
        neighborhood: 'Brooklyn',
        cep: '00000-001',
        city: 'New York',
        state: 'NY',
        country: 'EUA',
        observation: ''
      },
      {
        addressId: 2,
        nameAddress: 'Entrega #1',
        TypeAddress: 'Entrega',
        typeLogradouro: 'Rua',
        nameLogradouro: 'Stark Tower',
        number: '200',
        neighborhood: 'Manhattan',
        cep: '00000-002',
        city: 'New York',
        state: 'NY',
        country: 'EUA',
        observation: ''
      },
      {
        addressId: 3,
        nameAddress: 'Entrega #2',
        TypeAddress: 'Entrega',
        typeLogradouro: 'Rua',
        nameLogradouro: 'Stark Labs',
        number: '300',
        neighborhood: 'Queens',
        cep: '00000-003',
        city: 'New York',
        state: 'NY',
        country: 'EUA',
        observation: ''
      },
    ],
    cards: [
      {
        cardId: 1,
        holderName: 'Tony Stark',
        numberCard: '1111 2222 3333 4444',
        flagCard: 'Visa',
        safeNumber: '123',
        isFavorite: false
      },
      {
        cardId: 2,
        holderName: 'Pepper Potts',
        numberCard: '5555 6666 7777 8888',
        flagCard: 'Mastercard',
        safeNumber: '999',
        isFavorite: true
      }
    ]
  };

  // Apenas uns nomes para renderizar linhas na tabela
  const nomes = [
    'Maria Santos', 'Ana Paula', 'Gabriel Rodrigues', 'Rafael Costa',
    'Gustavo Santos', 'Peter Parker', 'Bruce Wayne', 'Clark Kent',
    'Tony Stark', 'Bruce Banner', 'Peter Quill', 'Wanda Maximoff',
    'Steve Rogers'
  ];

  const openModal = () => {
    setSelectedUser(fakeUser);
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
                  {/*
                    Ao clicar no Pencil, chamamos "openModal", que
                    seta "fakeUser" para selectedUser e abre modal.
                  */}
                  <Pencil onClick={openModal} />
                  <ToggleButton />
                </ActionCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {/* Modal de Edição de Cliente */}
      {isModalOpen && (
        <ModalEditarCliente
          onClose={closeModal}
          data={selectedUser} // passamos todo o fakeUser
        />
      )}

      {/* Modal de Exclusão (Descartation) */}
      {isDescartationModalOpen && (
        <ModalDescartation onClose={closeDescartationModal} />
      )}
    </>
  );
}

export default Tabela;
