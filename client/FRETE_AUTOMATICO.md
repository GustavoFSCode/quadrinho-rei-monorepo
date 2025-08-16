# Implementação de Frete Automático

## Funcionalidade Implementada
Na tela de "Realizar Compra", o frete de R$ 20,00 é agora calculado automaticamente quando um endereço de entrega é selecionado.

## Como Funciona

### ✅ **Endereço Selecionado:**
- Frete: **R$ 20,00**
- Total: **Subtotal + R$ 20,00**

### ❌ **Nenhum Endereço Selecionado:**
- Frete: **R$ 0,00** 
- Total: **Apenas subtotal**

### 🔄 **Atualização Automática:**
- O valor total é **atualizado instantaneamente** quando o cliente:
  - ✅ Seleciona um endereço → +R$ 20,00
  - ❌ Desmarca o endereço → -R$ 20,00

## Alterações no Código

### Arquivo: `src/app/carrinho/realizar-compra/page.tsx`

#### 1. **Novos Estados:**
```typescript
const [cartSubtotal, setCartSubtotal] = useState(0);
const FRETE_VALOR = 20.00;
```

#### 2. **Cálculo Automático:**
```typescript
useEffect(() => {
  const novoTotal = selectedDeliveryAddress ? cartSubtotal + FRETE_VALOR : cartSubtotal;
  setTotalValue(novoTotal);
}, [cartSubtotal, selectedDeliveryAddress, FRETE_VALOR]);
```

#### 3. **Separação de Valores:**
- **`cartSubtotal`** → Valor dos produtos no carrinho
- **`totalValue`** → Subtotal + frete (quando aplicável)

#### 4. **Interface Atualizada:**
```typescript
<StyledParagraph>
  Subtotal do carrinho: {cartSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
</StyledParagraph>
<StyledParagraph>
  Frete: {selectedDeliveryAddress 
    ? FRETE_VALOR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : 'R$ 0,00'}
</StyledParagraph>
<StyledParagraph>
  <strong>
    Valor total do pedido: {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
  </strong>
</StyledParagraph>
```

## Fluxo da Funcionalidade

### 1. **Carregamento Inicial:**
```
Subtotal: R$ 50,00
Frete: R$ 0,00
Total: R$ 50,00
```

### 2. **Cliente Seleciona Endereço:**
```
Subtotal: R$ 50,00
Frete: R$ 20,00        ← Adicionado automaticamente
Total: R$ 70,00        ← Atualizado automaticamente
```

### 3. **Cliente Desmarca Endereço:**
```
Subtotal: R$ 50,00
Frete: R$ 0,00         ← Removido automaticamente  
Total: R$ 50,00        ← Volta ao valor original
```

## Validações Mantidas

✅ **Todas as validações existentes continuam funcionando:**
- Verificação de endereço de entrega selecionado
- Verificação de endereço de cobrança selecionado
- Validação de cartões selecionados
- Compatibilidade entre valor de pagamento e valor total

## Interface do Usuário

### **Exibição Detalhada:**
1. **Subtotal do carrinho** → Valor dos produtos
2. **Frete** → R$ 20,00 (se endereço selecionado) ou R$ 0,00
3. **Valor total do pedido** → Subtotal + Frete (em destaque)
4. **Valor total de pagamento** → Soma dos cartões selecionados

### **Feedback Visual:**
- O valor do frete aparece/desaparece dinamicamente
- O total é destacado em negrito
- Atualizações são instantâneas (sem delay)

## Compatibilidade

✅ **Mantém compatibilidade com:**
- Validação de cartões
- Sistema de cupons
- Finalização de compra
- Estados existentes
- Outras funcionalidades

## Testes

✅ **Build bem-sucedido**  
✅ **TypeScript sem erros**  
✅ **Lógica de cálculo implementada**  
✅ **Interface atualizada**

## Valor do Frete

**Valor fixo:** R$ 20,00 para qualquer endereço de entrega selecionado.

*Para alterar este valor, modifique a constante `FRETE_VALOR` no arquivo da página de realizar compra.*