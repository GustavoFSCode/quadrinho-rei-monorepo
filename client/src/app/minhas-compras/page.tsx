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
import Tabela from '@/components/Tables/Minhas-Compras';
import { getMyPurchases, Purchase } from '@/services/purchaseService';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function MinhasCompras() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyPurchases();
      
      // Handle both paginated and non-paginated responses
      const purchasesData = Array.isArray(response) 
        ? response 
        : response.data?.purchases || [];
      
      setPurchases(purchasesData);
    } catch (error: any) {
      console.error('Erro ao buscar compras:', error);
      setError('Erro ao carregar suas compras. Tente novamente.');
      toast.error('Erro ao carregar suas compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleRefresh = () => {
    fetchPurchases();
  };

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            <HeaderTitle>Minhas compras</HeaderTitle>
          </HeaderTop>
          <HeaderBottom>
            <SearchAndActionsBox>
              <StyledInputBox></StyledInputBox>
              <ButtonBox>
                <Button
                  text={<>Minhas trocas</>}
                  type="button"
                  variant="purple"
                  width="185px"
                  height="39px"
                  onClick={() => router.push('/minhas-compras/minhas-trocas')}
                />
              </ButtonBox>
            </SearchAndActionsBox>
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
            <Tabela 
              purchases={purchases} 
              loading={loading} 
              onRefresh={handleRefresh}
            />
          )}
        </Content>
      </ContentContainer>
    </>
  );
}
