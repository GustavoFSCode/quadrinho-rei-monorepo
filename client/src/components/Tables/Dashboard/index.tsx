// src/components/Tabela/index.tsx
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { format, subDays } from 'date-fns';
import CustomSelect from '@/components/Select';
import { Flex } from '@/styles/global';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const categoryOptions = [
  { value: 'superhero', label: 'Super-Herói' },
  { value: 'manga', label: 'Mangá' },
  { value: 'independent', label: 'Independente' },
  { value: 'alternative', label: 'Alternativo' },
  { value: 'humor', label: 'Humor' },
  { value: 'sci-fi', label: 'Sci‑Fi' },
  { value: 'drama', label: 'Drama' },
  { value: 'zombie', label: 'Zumbi' },
  { value: 'aventura', label: 'Aventura' },
];

interface SalesData {
  date: string; // formato 'yyyy-MM-dd'
  category: string;
  sales: number;
}

const generateMockData = (): SalesData[] => {
  const cats = categoryOptions.map(o => o.value);
  const today = new Date();
  const data: SalesData[] = [];
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    cats.forEach(cat => {
      data.push({
        date,
        category: cat,
        sales: Math.floor(Math.random() * 20) + 1,
      });
    });
  }
  return data;
};

const mockSalesData = generateMockData();

const Tabela: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredData = useMemo(() => {
    return mockSalesData.filter(item => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      return true;
    });
  }, [selectedCategory, startDate, endDate]);

  const labels = useMemo(() => {
    return Array.from(new Set(filteredData.map(d => d.date))).sort();
  }, [filteredData]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Vendas',
          data: labels.map(date =>
            filteredData
              .filter(d => d.date === date)
              .reduce((sum, d) => sum + d.sales, 0),
          ),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    }),
    [labels, filteredData],
  );

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Gráfico de Vendas' },
      datalabels: { anchor: 'end', align: 'end' },
    },
    scales: {
      x: { title: { display: true, text: 'Data' } },
      y: {
        title: { display: true, text: 'Total de Vendas' },
        beginAtZero: true,
      },
    },
  };

  return (
    <Container>
      <Filters $direction="row" $gap="1rem" $align="center">
        <CustomSelect
          name="category"
          options={categoryOptions}
          value={selectedCategory || ''}
          placeholder="Categoria"
          isClearable
          width="200px"
          onChange={opt => setSelectedCategory(opt?.value || null)}
        />
        <DateInput
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <DateInput
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />
      </Filters>
      <ChartBox>
        <Bar data={data} options={options} />
      </ChartBox>
    </Container>
  );
};

export default Tabela;

// === styled-components ===
const Container = styled.div`
  height: 800px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Filters = styled(Flex)`
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 0 12px;
  height: 39px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ChartBox = styled.div`
  width: 85vw;
  height: 700px;
`;
