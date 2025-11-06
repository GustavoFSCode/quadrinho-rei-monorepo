import React from 'react';
import { Container, Position, Medal } from './styles';

interface Props {
  position: number | null;
  showMedals?: boolean;
}

const RankingBadge = ({ position, showMedals = true }: Props) => {
  // Renderizar medalhas para os top 3
  const renderMedal = () => {
    if (!showMedals || !position) return null;

    if (position === 1) return <Medal>🥇</Medal>;
    if (position === 2) return <Medal>🥈</Medal>;
    if (position === 3) return <Medal>🥉</Medal>;

    return null;
  };

  // Formatar posição ordinal (1º, 2º, 3º...)
  const formatPosition = (pos: number | null) => {
    if (!pos) return '-';
    return `${pos}º`;
  };

  return (
    <Container>
      {renderMedal()}
      <Position>{formatPosition(position)}</Position>
    </Container>
  );
};

export default RankingBadge;
