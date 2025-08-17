import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardInfo,
  CheckboxContainer,
  Title,
  Text,
  CustomCheckbox,
  CustomLabel,
  ValueInputContainer,
  ToggleBox,
} from './styled';
import Input from '@/components/Inputs/Input/Input';
import { currencyMask, unformatCurrency } from '@/utils/masks';
import ToggleButton from '@/components/Button/ToggleButton';
import { useAuth } from '@/hooks/useAuth';
import { getUser, Card as CardData } from '@/services/clientService';
import { useQuery } from '@tanstack/react-query';

interface CartaoListProps {
  onTotalChange?: (total: number) => void;
  totalOrder: number;
  onSelectionChange?: (selectedCards: number[], cardValues: Record<number, string>) => void;
}

const CartaoList: React.FC<CartaoListProps> = ({
  onTotalChange,
  totalOrder,
  onSelectionChange,
}) => {
  const { user } = useAuth();

  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardValues, setCardValues] = useState<Record<number, string>>({});

  // Query para buscar dados do usuário com React Query
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', user.documentId],
    queryFn: () => getUser(user.documentId),
    enabled: !!user.documentId,
  });

  const userCards = userData?.client?.cards || [];

  const handleCheckboxChange = (id: number) => {
    if (selectedCards.includes(id)) {
      setSelectedCards(selectedCards.filter(cardId => cardId !== id));
      setCardValues(prev => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  const handleValueChange = (id: number, value: string) => {
    // Usar unformatCurrency para extrair o valor numérico corretamente
    let numericValue = unformatCurrency(value);
    if (isNaN(numericValue)) numericValue = 0;

    // Calcular a soma dos outros cartões usando unformatCurrency
    const sumOthers = selectedCards.reduce((acc, cardId) => {
      if (cardId !== id) {
        const val = unformatCurrency(cardValues[cardId] || '0');
        return acc + val;
      }
      return acc;
    }, 0);

    const maxForCard = totalOrder - sumOthers;
    if (numericValue > maxForCard) numericValue = maxForCard;

    // Armazenar como string formatada para display
    setCardValues(prev => ({
      ...prev,
      [id]: numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    }));
  };

  useEffect(() => {
    let total = 0;
    selectedCards.forEach(id => {
      const valueStr = cardValues[id] || '0';
      const numericValue = unformatCurrency(valueStr);
      total += numericValue;
    });
    if (onTotalChange) onTotalChange(total);
    if (onSelectionChange) onSelectionChange(selectedCards, cardValues);
  }, [selectedCards, cardValues, onTotalChange, onSelectionChange]);

  if (isLoading) {
    return (
      <Container>
        <div>Carregando cartões...</div>
      </Container>
    );
  }

  if (userCards.length === 0) {
    return (
      <Container>
        <div>Nenhum cartão cadastrado. Adicione um cartão para continuar.</div>
      </Container>
    );
  }

  return (
    <Container>
      {userCards.map((card, index) => (
        <Card key={card.id}>
          <CardInfo>
            <Title>{card.holderName}</Title>
            <Text>Número: ****-****-****-{card.numberCard.slice(-4)}</Text>
            <Text>Bandeira: {card.flagCard}</Text>
            <Text>Código de Segurança: ***</Text>
          </CardInfo>
          <ToggleBox>
            <ToggleButton isActive={card.isFavorite} onToggle={() => {}} />
          </ToggleBox>
          <CheckboxContainer>
            <CustomCheckbox
              type="checkbox"
              checked={selectedCards.includes(card.id)}
              onChange={() => handleCheckboxChange(card.id)}
            />
            <CustomLabel>Selecionar</CustomLabel>
          </CheckboxContainer>
          {selectedCards.includes(card.id) && (
            <ValueInputContainer>
              <Input
                id={`card-value-${card.id}`}
                label="Valor (R$)"
                type="text"
                maskFunction={currencyMask}
                placeholder="Valor a ser pago neste cartão"
                value={cardValues[card.id] || ''}
                onChange={e => handleValueChange(card.id, e.target.value)}
              />
            </ValueInputContainer>
          )}
        </Card>
      ))}
    </Container>
  );
};

export default CartaoList;
