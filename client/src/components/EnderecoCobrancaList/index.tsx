import React, { useState } from 'react';
import {
  Container,
  Card,
  AddressInfo,
  CheckboxContainer,
  Title,
  Text,
  CustomCheckbox,
  CustomLabel
} from './styled';

interface Address {
  id: number;
  nameAddress: string;
  TypeAddress: string;
  typeLogradouro: string;
  nameLogradouro: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  country: string;
  observation?: string;
}

const EnderecoCobrancaList: React.FC = () => {
  // Estado para armazenar o endereço selecionado (única escolha)
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Mock de endereços de cobrança
  const mockAddresses: Address[] = [
    {
      id: 1,
      nameAddress: 'Residencial',
      TypeAddress: 'Cobrança',
      typeLogradouro: 'Rua',
      nameLogradouro: 'dos Limoeiros',
      number: '101',
      neighborhood: 'Centro',
      cep: '11111-111',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      observation: ''
    },
    {
      id: 2,
      nameAddress: 'Escritório',
      TypeAddress: 'Cobrança',
      typeLogradouro: 'Avenida',
      nameLogradouro: 'Central',
      number: '202',
      neighborhood: 'Bairro Comercial',
      cep: '22222-222',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      observation: ''
    },
    {
      id: 3,
      nameAddress: 'Alternativo',
      TypeAddress: 'Cobrança',
      typeLogradouro: 'Praça',
      nameLogradouro: 'da Liberdade',
      number: '303',
      neighborhood: 'Liberdade',
      cep: '33333-333',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      observation: ''
    }
  ];

  const handleSelect = (id: number) => {
    setSelectedAddressId(id);
  };

  return (
    <Container>
      {mockAddresses.map((address) => (
        <Card key={address.id}>
          <AddressInfo>
            <Title>{address.nameAddress}</Title>
            <Text>
              {address.typeLogradouro} {address.nameLogradouro}, {address.number}
            </Text>
            <Text>
              {address.neighborhood} - {address.cep}
            </Text>
            <Text>
              {address.city} - {address.state}
            </Text>
            <Text>{address.country}</Text>
            {address.observation && <Text>Obs: {address.observation}</Text>}
          </AddressInfo>
          <CheckboxContainer>
            <CustomCheckbox
              checked={selectedAddressId === address.id}
              onChange={() => handleSelect(address.id)}
            />
            <CustomLabel>Selecionar</CustomLabel>
          </CheckboxContainer>
        </Card>
      ))}
    </Container>
  );
};

export default EnderecoCobrancaList;
