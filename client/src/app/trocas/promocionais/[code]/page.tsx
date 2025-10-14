'use client';

import { useState, useEffect } from 'react';
import {
  ContentContainer,
  Header,
  HeaderTop,
  HeaderTitle,
  Content,
  InfoSection,
  InfoText,
} from './styled';
import Navbar from '@/components/Navbar';
import Tabela from '@/components/Tables/Usos-Cupom';
import { ToastContainer } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import { getCouponUsages } from '@/services/promotionalCouponService';
import 'react-toastify/dist/ReactToastify.css';

interface PageProps {
  params: {
    code: string;
  };
}

export default function UsosCupom({ params }: PageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    // Se params for uma Promise, resolve ela
    if (params instanceof Promise) {
      params.then((resolvedParams) => setCode(resolvedParams.code));
    } else {
      setCode(params.code);
    }
  }, [params]);

  const { data: usagesData, isLoading, error } = useQuery({
    queryKey: ['coupon-usages', code],
    queryFn: () => getCouponUsages(code),
    enabled: !!code, // Só executa quando o code estiver disponível
  });

  return (
    <>
      <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <ContentContainer isExpanded={isExpanded}>
        <Header>
          <HeaderTop>
            {usagesData && <HeaderTitle>Cupom: {usagesData.coupon.title}</HeaderTitle> }
          </HeaderTop>
        </Header>
        <Content>
          {isLoading && <div>Carregando dados do cupom...</div>}
          {error && <div>Erro ao carregar dados do cupom.</div>}
          {usagesData && (
            <>
              <InfoSection>
                <InfoText>
                  <strong>Título:</strong> {usagesData.coupon.title}
                </InfoText>
                <InfoText>
                  <strong>Limite por cliente:</strong> {usagesData.coupon.usageLimit}{' '}
                  {usagesData.coupon.usageLimit === 1 ? 'uso' : 'usos'}
                </InfoText>
                <InfoText>
                  <strong>Total de clientes que usaram:</strong>{' '}
                  {usagesData.coupon.totalUniqueClients}
                </InfoText>
                <InfoText>
                  <strong>Total de usos:</strong> {usagesData.usages.length}
                </InfoText>
              </InfoSection>
              <Tabela usages={usagesData.usages} />
            </>
          )}
        </Content>
      </ContentContainer>

      <ToastContainer />
    </>
  );
}
