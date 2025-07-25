// src/components/Modals/Estoque/CadastrarQuadrinho.tsx

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
  category: string[];
  isbn: string;
  pricingGroup: string;
  barcode: string;
  dimensions: {
    height: number;
    width: number;
    weight: number;
    depth: number;
  };
  price: number;
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

  const active = watch('active');
  const isRead = readonly;

  // opções vindas da API
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>([]);
  const [pricingGroupOptions, setPricingGroupOptions] = useState<{ value: string; label: string }[]>([]);

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
    onComicSubmit(data);
    onClose();
  };

  // Formata número para "R$ 29,90"
  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          {isRead
            ? 'Visualizar quadrinho'
            : initialData.title
            ? 'Editar quadrinho'
            : 'Cadastrar quadrinho'}
          <Closed onClick={onClose} name="closeComicForm" />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex $direction="column" $gap="1rem">
              {/* Campos de texto */}
              <Input
                id="title"
                label="Título"
                placeholder="Título do quadrinho"
                {...register('title')}
                error={errors.title?.message}
                disabled={isRead}
              />
              <Input
                id="author"
                label="Autor"
                placeholder="Nome do autor"
                {...register('author')}
                error={errors.author?.message}
                disabled={isRead}
              />
              <Input
                id="publisher"
                label="Editora"
                placeholder="Editora"
                {...register('publisher')}
                error={errors.publisher?.message}
                disabled={isRead}
              />
              <Input
                id="year"
                label="Ano"
                type="number"
                placeholder="Ano de publicação"
                {...register('year')}
                error={errors.year?.message}
                disabled={isRead}
              />
              <Input
                id="issue"
                label="Issue"
                placeholder="Número da issue"
                {...register('issue')}
                error={errors.issue?.message}
                disabled={isRead}
              />
              <Input
                id="edition"
                label="Edição"
                placeholder="Edição (opcional)"
                {...register('edition')}
                error={errors.edition?.message}
                disabled={isRead}
              />
              <Input
                id="pages"
                label="Número de Páginas"
                type="number"
                placeholder="Quantidade de páginas"
                {...register('pages')}
                error={errors.pages?.message}
                disabled={isRead}
              />
              <Input
                id="synopsis"
                label="Sinopse"
                placeholder="Sinopse do quadrinho"
                {...register('synopsis')}
                error={errors.synopsis?.message}
                disabled={isRead}
              />

              {/* Categoria */}
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
                                if (e.target.checked) onChange([...selected, opt.value]);
                                else onChange(selected.filter(v => v !== opt.value));
                              }}
                            />
                          </CheckboxItem>
                        ))}
                      </CheckboxGroupContainer>
                      {errors.category && <ErrorMessage>{errors.category.message}</ErrorMessage>}
                    </div>
                  );
                }}
              />

              <Input
                id="isbn"
                label="ISBN"
                placeholder="Número ISBN"
                {...register('isbn')}
                error={errors.isbn?.message}
                disabled={isRead}
              />

              {/* Grupo de Precificação */}
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
                      placeholder="Selecione um grupo"
                    />
                    {errors.pricingGroup && <ErrorMessage>{errors.pricingGroup.message}</ErrorMessage>}
                  </>
                )}
              />

              <Input
                id="barcode"
                label="Código de Barras"
                placeholder="Código de Barras"
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
                  placeholder="Altura"
                  {...register('dimensions.height')}
                  error={errors.dimensions?.height?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.width"
                  label="Largura (cm)"
                  type="number"
                  placeholder="Largura"
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
                  placeholder="Peso"
                  {...register('dimensions.weight')}
                  error={errors.dimensions?.weight?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.depth"
                  label="Profundidade (cm)"
                  type="number"
                  placeholder="Profundidade"
                  {...register('dimensions.depth')}
                  error={errors.dimensions?.depth?.message}
                  disabled={isRead}
                />
              </Flex>

              {/* Preço formatado */}
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
                      const numeric = unformatCurrency(e.target.value);
                      field.onChange(numeric);
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
                placeholder="Quantidade em estoque"
                {...register('stock')}
                error={errors.stock?.message}
                disabled={isRead}
              />

              {/* Ativo / inativação */}
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
                    placeholder="Informe o motivo"
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
