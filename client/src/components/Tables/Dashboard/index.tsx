// src/components/Tables/Dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import CustomSelect from '@/components/Select';
import { Flex } from '@/styles/global';
import Button from '@/components/Button';
import { getDashboardSales, getDashboardCategories, DashboardFilters } from '@/services/dashboardService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

// Períodos predefinidos para facilitar a seleção
const periodOptions = [
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'last90days', label: 'Últimos 90 dias' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'thisYear', label: 'Este ano' },
  { value: 'custom', label: 'Período customizado' },
];

// Função para calcular datas baseadas no período selecionado
const getPeriodDates = (period: string): { date1: string; date2: string } | null => {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (period) {
    case 'last7days':
      return {
        date1: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
        date2: formatDate(today)
      };
    case 'last30days':
      return {
        date1: formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
        date2: formatDate(today)
      };
    case 'last90days':
      return {
        date1: formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
        date2: formatDate(today)
      };
    case 'thisMonth':
      return {
        date1: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)),
        date2: formatDate(today)
      };
    case 'lastMonth':
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        date1: formatDate(lastMonth),
        date2: formatDate(lastDayOfLastMonth)
      };
    case 'thisYear':
      return {
        date1: formatDate(new Date(today.getFullYear(), 0, 1)),
        date2: formatDate(today)
      };
    default:
      return null;
  }
};

const Tabela: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filters, setFilters] = useState<DashboardFilters>({});

  // Inicializar com últimos 30 dias
  useEffect(() => {
    const periodDates = getPeriodDates('last30days');
    if (periodDates) {
      setStartDate(periodDates.date1);
      setEndDate(periodDates.date2);
    }
  }, []);

  // Buscar categorias disponíveis
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['dashboardCategories'],
    queryFn: getDashboardCategories,
  });

  // Buscar dados de vendas
  const { data: salesData, isLoading: salesLoading, error: salesError, refetch } = useQuery({
    queryKey: ['dashboardSales', filters],
    queryFn: () => getDashboardSales(filters),
    enabled: true,
  });

  // Atualizar filtros quando datas ou categoria mudar
  useEffect(() => {
    if (startDate && endDate) {
      const newFilters: DashboardFilters = {
        category: selectedCategory || undefined,
        date1: startDate,
        date2: endDate,
      };
      setFilters(newFilters);
    }
  }, [selectedCategory, startDate, endDate]);

  // Função para aplicar período predefinido
  const applyPeriod = (period: string) => {
    const periodDates = getPeriodDates(period);
    if (periodDates) {
      setStartDate(periodDates.date1);
      setEndDate(periodDates.date2);
    }
  };

  // Preparar dados para o gráfico
  const chartData = {
    labels: salesData?.map(item => {
      const [year, month] = item.yearMonth.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                         'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }) || [],
    datasets: [
      {
        label: 'Quantidade de Vendas',
        data: salesData?.map(item => item.totalValue) || [],
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(147, 51, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
      },
    ],
  };

  // Calcular estatísticas
  const totalSales = salesData?.reduce((acc, item) => acc + item.totalValue, 0) || 0;
  const averagePerMonth = salesData?.length ? totalSales / salesData.length : 0;

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' }
        }
      },
      title: {
        display: true,
        text: selectedCategory
          ? `Vendas por Período - ${categories?.find(c => c.documentId === selectedCategory)?.name || 'Categoria Selecionada'}`
          : 'Vendas por Período - Todas as Categorias',
        font: { size: 18, weight: 'bold' }
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: { weight: 'bold' }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Período',
          font: { size: 14, weight: 'bold' }
        },
        grid: { display: false }
      },
      y: {
        title: {
          display: true,
          text: 'Quantidade de Vendas',
          font: { size: 14, weight: 'bold' }
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  // Preparar opções de categoria para o select
  const categoryOptions = categories?.map(cat => ({
    value: cat.documentId,
    label: cat.name
  })) || [];

  if (salesError) {
    toast.error('Erro ao carregar dados do dashboard');
  }

  return (
    <Container>
      {/* Header com estatísticas */}
      <StatsHeader>
        <StatsCard>
          <StatsTitle>Total de Vendas</StatsTitle>
          <StatsValue>{totalSales}</StatsValue>
          <StatsSubtitle>no período selecionado</StatsSubtitle>
        </StatsCard>
        <StatsCard>
          <StatsTitle>Média por Mês</StatsTitle>
          <StatsValue>{Math.round(averagePerMonth)}</StatsValue>
          <StatsSubtitle>vendas mensais</StatsSubtitle>
        </StatsCard>
        <StatsCard>
          <StatsTitle>Meses com Vendas</StatsTitle>
          <StatsValue>{salesData?.length || 0}</StatsValue>
          <StatsSubtitle>períodos ativos</StatsSubtitle>
        </StatsCard>
      </StatsHeader>

      {/* Filtros */}
      <FiltersSection>
        <FilterRow $direction="row" $gap="1rem" $align="center">
          <FilterGroup>
            <FilterLabel>Categoria:</FilterLabel>
            <CustomSelect
              name="category"
              options={categoryOptions}
              value={selectedCategory || ''}
              placeholder="Todas as categorias"
              isClearable
              width="200px"
              onChange={opt => setSelectedCategory(opt?.value || null)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Data início:</FilterLabel>
            <DateInput
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Data fim:</FilterLabel>
            <DateInput
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </FilterGroup>

          <Button
            text="Atualizar"
            type="button"
            variant="purple"
            width="120px"
            height="39px"
            onClick={() => refetch()}
            disabled={salesLoading}
          />
        </FilterRow>
      </FiltersSection>

      {/* Loading */}
      {salesLoading && <LoadingMessage>Carregando dados...</LoadingMessage>}

      {/* Gráfico */}
      {!salesLoading && (
        <ChartBox>
          <Line data={chartData} options={options} />
        </ChartBox>
      )}

      {/* Mensagem quando não há dados */}
      {!salesLoading && (!salesData || salesData.length === 0) && (
        <NoDataMessage>
          <p>Nenhum dado encontrado para os filtros selecionados.</p>
          <p>Tente alterar a categoria ou o período.</p>
        </NoDataMessage>
      )}
    </Container>
  );
};

export default Tabela;

// === styled-components ===
const Container = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-height: 800px;
`;

const StatsHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(147, 51, 234, 0.05));
  border: 1px solid rgba(147, 51, 234, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(147, 51, 234, 0.15);
  }
`;

const StatsTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatsValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #7c3aed;
  margin: 8px 0;
`;

const StatsSubtitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
`;

const FiltersSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
`;

const FilterRow = styled(Flex)`
  flex-wrap: wrap;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 160px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const DateInput = styled.input`
  padding: 0 12px;
  height: 39px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const ChartBox = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  height: 500px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #6b7280;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;

  p {
    margin: 8px 0;
    font-size: 16px;

    &:first-child {
      font-weight: 600;
      color: #374151;
    }
  }
`;

const QuickPeriodRow = styled(Flex)`
  margin-top: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const QuickPeriodLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
`;

const QuickPeriodButton = styled.button`
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #7c3aed;
    color: #7c3aed;
  }

  &:active {
    background: rgba(124, 58, 237, 0.1);
  }
`;
