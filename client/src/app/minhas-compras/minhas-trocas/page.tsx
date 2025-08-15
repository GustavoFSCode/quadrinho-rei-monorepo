'use client';

import { useState, useEffect } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderBottom,
  HeaderTitle,
  SearchAndActionsBox,
  StyledInputBox,
  ButtonBox,
  Content,
  Footer,
} from './styled';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Minhas-Trocas';
import { getMyTrades, Trade } from '@/services/purchaseService';
import { toast } from 'react-toastify';

export default function MinhasTrocas() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyTrades();
      setTrades(response);
    } catch (error: any) {
      console.error('Erro ao buscar trocas:', error);
      setError('Erro ao carregar suas trocas. Tente novamente.');
      toast.error('Erro ao carregar suas trocas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleRefresh = () => {
    fetchTrades();
  };

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Minhas trocas</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox></SearchAndActionsBox>
          </HeaderBottom>
        </Header>
        <Content>
          {error ? (
            <div>
              <p>{error}</p>
              <Button
                text={<>Tentar novamente</>}
                type="button"
                variant="purple"
                width="150px"
                height="39px"
                onClick={handleRefresh}
              />
            </div>
          ) : (
            <Tabela trades={trades} loading={loading} />
          )}
        </Content>
      </ContentContainer>
    </>
  );
}
