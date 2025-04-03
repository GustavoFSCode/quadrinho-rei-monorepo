import React, { useState, useEffect } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeadCell,
  TableBody,
  TableBodyCell,
} from './styled';
import { Flex } from '@/styles/global';

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
}

interface TabelaProps {
  onTotalChange: (total: number) => void;
}

const Tabela: React.FC<TabelaProps> = ({ onTotalChange }) => {
  const products: Product[] = [
    { id: 1, title: 'Homem-Aranha: N°1', price: 25.0, stock: 10 },
    { id: 2, title: 'Homem-Aranha: N°2', price: 25.0, stock: 10 },
    { id: 11, title: 'Batman: Noite Sombria', price: 30.0, stock: 25 },
    { id: 12, title: 'Superman: O Último Herói', price: 20.0, stock: 15 },
  ];

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    products.forEach(product => {
      // Alguns produtos iniciam com quantidade 3; os demais, 1
      initial[product.id] = product.id === 1 || product.id === 11 ? 3 : 1;
    });
    return initial;
  });

  useEffect(() => {
    const total = products.reduce(
      (acc, product) => acc + product.price * (quantities[product.id] || 0),
      0,
    );
    onTotalChange(total);
  }, [quantities, products, onTotalChange]);

  return (
    <Flex $direction="column">
      <h2>Pedido - #1</h2>
      <TableContainer>
        <Table aria-label="Tabela de Produtos">
          <TableHead>
            <TableRow>
              <TableHeadCell>Produtos</TableHeadCell>
              <TableHeadCell>Preço</TableHeadCell>
              {/* Note o 'center' aqui */}
              <TableHeadCell center>Quantidade</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(product => (
              <TableRow key={product.id}>
                <TableBodyCell productTitle>{product.title}</TableBodyCell>
                <TableBodyCell>
                  {product.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </TableBodyCell>
                {/* E aqui também para centralizar */}
                <TableBodyCell center>{quantities[product.id]}</TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Flex>
  );
};

export default Tabela;
