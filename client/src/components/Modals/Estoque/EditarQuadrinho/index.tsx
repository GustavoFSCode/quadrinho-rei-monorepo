// src/components/Modals/Estoque/EditarQuadrinho.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ComicSchema } from '@/validations/ComicSchema';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import ToggleButton from '@/components/Button/ToggleTable';
import CustomSelect from '@/components/Select';
import { unformatCurrency } from '@/utils/masks';
import Checkbox from '@/components/Inputs/Checkbox/Checkbox';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  CheckboxGroupLabel,
  CheckboxGroupContainer,
  CheckboxItem,
} from './styled';
import Closed from '@/components/icons/Closed';
import { SubmitButton } from '@/components/Forms/CardForm/styled';
import { ErrorMessage } from '@/components/Forms/AddressForm/styled';

import {
  getProductCategories,
  getPrecificationTypes,
  ProductCategory,
  PrecificationType,
} from '@/services/productService';

export interface IComicForm {
  title: string;
  author: string;
  publisher: string;
  year: number;
  issue: string;
  edition?: string;
  pages: number;
  synopsis: string;
  category: string[];         // array de documentId de categorias
  isbn: string;
  pricingGroup: string;       // documentId do tipo de precificação
  barcode: string;
  dimensions: {
    height: number;
    width: number;
    weight: number;
    depth: number;
  };
  price: number;              // priceSell, já calculado no back
  stock: number;
  active: boolean;
  inactivationReason?: string;
}

interface ComicFormModalProps {
  onClose: () => void;
  onComicSubmit: (data: IComicForm) => void;
  initialData: IComicForm;
  readonly?: boolean;
}

const ComicFormModal: React.FC<ComicFormModalProps> = ({
  onClose,
  onComicSubmit,
  initialData,
  readonly = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IComicForm>({
    resolver: yupResolver(ComicSchema),
    defaultValues: initialData,
  });

  const isRead = readonly;
  const active = watch('active');

  // opções carregadas da API
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [pricingGroupOptions, setPricingGroupOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const catResp = await getProductCategories();
        setCategoryOptions(
          catResp.data.map((c: ProductCategory) => ({
            value: c.documentId,
            label: c.name,
          }))
        );
        const precResp = await getPrecificationTypes();
        setPricingGroupOptions(
          precResp.data.map((p: PrecificationType) => ({
            value: p.documentId,
            label: p.name,
          }))
        );
      } catch (err) {
        console.error('Erro ao carregar opções:', err);
      }
    }
    loadOptions();
  }, []);

  const onSubmit: SubmitHandler<IComicForm> = data => {
    if (!isRead) {
      onComicSubmit(data);
    }
  };

  // Helper para formatar número em "R$ 29,90"
  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          {isRead ? 'Visualizar quadrinho' : 'Editar quadrinho'}
          <Closed onClick={onClose} name="closeComicForm" />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex $direction="column" $gap="1rem">
              {/* Campos de texto */}
              <Input
                id="title"
                label="Título"
                {...register('title')}
                error={errors.title?.message}
                disabled={isRead}
              />
              <Input
                id="author"
                label="Autor"
                {...register('author')}
                error={errors.author?.message}
                disabled={isRead}
              />
              <Input
                id="publisher"
                label="Editora"
                {...register('publisher')}
                error={errors.publisher?.message}
                disabled={isRead}
              />
              <Input
                id="year"
                label="Ano"
                type="number"
                {...register('year')}
                error={errors.year?.message}
                disabled={isRead}
              />
              <Input
                id="issue"
                label="Issue"
                {...register('issue')}
                error={errors.issue?.message}
                disabled={isRead}
              />
              <Input
                id="edition"
                label="Edição"
                {...register('edition')}
                error={errors.edition?.message}
                disabled={isRead}
              />
              <Input
                id="pages"
                label="Páginas"
                type="number"
                {...register('pages')}
                error={errors.pages?.message}
                disabled={isRead}
              />
              <Input
                id="synopsis"
                label="Sinopse"
                {...register('synopsis')}
                error={errors.synopsis?.message}
                disabled={isRead}
              />

              {/* Categorias dinâmicas */}
              <Controller
                control={control}
                name="category"
                defaultValue={initialData.category}
                render={({ field: { value = [], onChange } }) => {
                  const selected = Array.isArray(value) ? value : [];
                  return (
                    <div>
                      <CheckboxGroupLabel>Categoria</CheckboxGroupLabel>
                      <CheckboxGroupContainer>
                        {categoryOptions.map(opt => (
                          <CheckboxItem key={opt.value}>
                            <Checkbox
                              id={`category-${opt.value}`}
                              label={opt.label}
                              checked={selected.includes(opt.value)}
                              disabled={isRead}
                              onChange={e => {
                                const next = e.target.checked
                                  ? [...selected, opt.value]
                                  : selected.filter(v => v !== opt.value);
                                onChange(next);
                              }}
                            />
                          </CheckboxItem>
                        ))}
                      </CheckboxGroupContainer>
                      {errors.category && (
                        <ErrorMessage>{errors.category.message}</ErrorMessage>
                      )}
                    </div>
                  );
                }}
              />

              <Input
                id="isbn"
                label="ISBN"
                {...register('isbn')}
                error={errors.isbn?.message}
                disabled={isRead}
              />

              {/* Tipo de Precificação dinâmico */}
              <Controller
                control={control}
                name="pricingGroup"
                defaultValue={initialData.pricingGroup}
                render={({ field: { value, onChange } }) => (
                  <>
                    <CustomSelect
                      id="pricingGroup"
                      name="pricingGroup"
                      label="Grupo de Precificação"
                      options={pricingGroupOptions}
                      value={value}
                      onChange={opt => onChange(opt?.value ?? '')}
                      isDisabled={isRead}
                    />
                    {errors.pricingGroup && (
                      <ErrorMessage>{errors.pricingGroup.message}</ErrorMessage>
                    )}
                  </>
                )}
              />

              <Input
                id="barcode"
                label="Código de Barras"
                {...register('barcode')}
                error={errors.barcode?.message}
                disabled={isRead}
              />

              {/* Dimensões */}
              <Flex $direction="row" $gap="1rem">
                <Input
                  id="dimensions.height"
                  label="Altura (cm)"
                  type="number"
                  {...register('dimensions.height')}
                  error={errors.dimensions?.height?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.width"
                  label="Largura (cm)"
                  type="number"
                  {...register('dimensions.width')}
                  error={errors.dimensions?.width?.message}
                  disabled={isRead}
                />
              </Flex>
              <Flex $direction="row" $gap="1rem">
                <Input
                  id="dimensions.weight"
                  label="Peso (kg)"
                  type="number"
                  {...register('dimensions.weight')}
                  error={errors.dimensions?.weight?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.depth"
                  label="Profundidade (cm)"
                  type="number"
                  {...register('dimensions.depth')}
                  error={errors.dimensions?.depth?.message}
                  disabled={isRead}
                />
              </Flex>

              {/* Preço de venda (já calculado no back) */}
              <Controller
                control={control}
                name="price"
                defaultValue={initialData.price}
                render={({ field }) => (
                  <Input
                    id="price"
                    label="Preço (R$)"
                    value={formatBRL(field.value)}
                    onChange={e => {
                      const num = unformatCurrency(e.target.value);
                      field.onChange(num);
                    }}
                    error={errors.price?.message}
                    disabled={isRead}
                  />
                )}
              />

              <Input
                id="stock"
                label="Estoque"
                type="number"
                {...register('stock')}
                error={errors.stock?.message}
                disabled={isRead}
              />

              {/* Ativo / Inativação */}
              <Flex $direction="column">
                <Flex $direction="row" $align="center" $gap="0.5rem">
                  <label style={{ fontWeight: 'bold' }}>Produto ativo</label>
                  <ToggleButton
                    onToggle={() => !isRead && setValue('active', !active)}
                    isActive={active}
                    disabled={isRead}
                  />
                </Flex>
                {!active && (
                  <Input
                    id="inactivationReason"
                    label="Motivo de inativação"
                    {...register('inactivationReason')}
                    error={errors.inactivationReason?.message}
                    disabled={isRead}
                  />
                )}
              </Flex>

              {!isRead && (
                <SubmitButton type="submit">
                  {initialData.title ? 'Editar Quadrinho' : 'Salvar Quadrinho'}
                </SubmitButton>
              )}
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ComicFormModal;
