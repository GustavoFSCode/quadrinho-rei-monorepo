// src/components/EnderecoCobrancaList/index.tsx

'use client';

import React, { useState } from 'react';
import {
  Container,
  Card,
  AddressInfo,
  CheckboxContainer,
  Title,
  Text,
  CustomCheckbox,
  CustomLabel,
} from './styled';
import { Address } from '@/services/clientService';

interface Props {
  addresses: Address[];
  onSelectionChange?: (selectedId: string | null) => void;
}

const EnderecoCobrancaList: React.FC<Props> = ({ addresses, onSelectionChange }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelectionChange = (id: string) => {
    const newSelection = selectedId === id ? null : id;
    setSelectedId(newSelection);
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  };

  return (
    <Container>
      {addresses.map(addr => (
        <Card key={addr.documentId}>
          <AddressInfo>
            <Title>{addr.nameAddress}</Title>
            <Text>
              {addr.typeLogradouro} {addr.nameLogradouro}, {addr.number}
            </Text>
            <Text>
              {addr.neighborhood} - {addr.cep}
            </Text>
            <Text>
              {addr.city} - {addr.state}
            </Text>
            <Text>{addr.country}</Text>
            {addr.observation && <Text>Obs: {addr.observation}</Text>}
          </AddressInfo>
          <CheckboxContainer>
            <CustomCheckbox
              checked={selectedId === addr.documentId}
              onChange={() => handleSelectionChange(addr.documentId)}
            />
            <CustomLabel>Selecionar</CustomLabel>
          </CheckboxContainer>
        </Card>
      ))}
    </Container>
  );
};

export default EnderecoCobrancaList;
