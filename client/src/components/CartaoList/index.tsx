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
import { currencyMask } from '@/utils/masks';
import ToggleButton from '@/components/Button/ToggleButton';

interface CardData {
  id: number;
  holderName: string;
  numberCard: string;
  flagCard: string;
  safeNumber: string;
}

interface CartaoListProps {
  onTotalChange?: (total: number) => void;
  totalOrder: number;
}

const CartaoList: React.FC<CartaoListProps> = ({
  onTotalChange,
  totalOrder,
}) => {
  const mockCards: CardData[] = [
    {
      id: 1,
      holderName: 'João Silva',
      numberCard: '1111222233334444',
      flagCard: 'Visa',
      safeNumber: '123',
    },
    {
      id: 2,
      holderName: 'Maria Souza',
      numberCard: '5555666677778888',
      flagCard: 'MasterCard',
      safeNumber: '456',
    },
    {
      id: 3,
      holderName: 'Carlos Pereira',
      numberCard: '9999000011112222',
      flagCard: 'Elo',
      safeNumber: '789',
    },
  ];

  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardValues, setCardValues] = useState<Record<number, string>>({});

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
    const numericString = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    let numericValue = parseFloat(numericString);
    if (isNaN(numericValue)) numericValue = 0;

    const sumOthers = selectedCards.reduce((acc, cardId) => {
      if (cardId !== id) {
        const val =
          parseFloat(
            (cardValues[cardId] || '0')
              .replace(/[^\d,.-]/g, '')
              .replace(',', '.'),
          ) || 0;
        return acc + val;
      }
      return acc;
    }, 0);

    const maxForCard = totalOrder - sumOthers;
    if (numericValue > maxForCard) numericValue = maxForCard;

    setCardValues(prev => ({
      ...prev,
      [id]: numericValue.toFixed(2),
    }));
  };

  useEffect(() => {
    let total = 0;
    selectedCards.forEach(id => {
      const valueStr = cardValues[id] || '0';
      const numericValue =
        parseFloat(valueStr.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      total += numericValue;
    });
    if (onTotalChange) onTotalChange(total);
  }, [selectedCards, cardValues, onTotalChange]);

  return (
    <Container>
      {mockCards.map((card, index) => (
        <Card key={card.id}>
          <CardInfo>
            <Title>{card.holderName}</Title>
            <Text>Número: {card.numberCard}</Text>
            <Text>Bandeira: {card.flagCard}</Text>
            <Text>Código de Segurança: {card.safeNumber}</Text>
          </CardInfo>
          <ToggleBox>
            <ToggleButton isActive={index === 0} onToggle={() => {}} />
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
                label="Preço (R$)"
                type="text"
                maskFunction={currencyMask}
                placeholder="Preço"
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
