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
}

const EnderecoCobrancaList: React.FC<Props> = ({ addresses }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
              onChange={() => setSelectedId(addr.documentId)}
            />
            <CustomLabel>Selecionar</CustomLabel>
          </CheckboxContainer>
        </Card>
      ))}
    </Container>
  );
};

export default EnderecoCobrancaList;
