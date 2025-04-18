import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ComicSchema } from '@/validations/ComicSchema';
import Input from '@/components/Inputs/Input/Input';
import { Flex } from '@/styles/global';
import ToggleButton from '@/components/Button/ToggleTable';
import CustomSelect from '@/components/Select';
import { currencyMask } from '@/utils/masks';
import Checkbox from '@/components/Inputs/Checkbox/Checkbox';

import { ModalOverlay, ModalContent, ModalHeader, ModalBody } from './styled';

import Closed from '@/components/icons/Closed';
import { SubmitButton } from '@/components/Forms/CardForm/styled';
import { ErrorMessage } from '@/components/Forms/AddressForm/styled';
// Importe os novos componentes styled para o grupo de checkboxes:
import {
  CheckboxGroupLabel,
  CheckboxGroupContainer,
  CheckboxItem,
} from './styled';

export interface IComicForm {
  title: string;
  author: string;
  publisher: string;
  year: number;
  issue: string;
  edition?: string;
  pages: number;
  synopsis: string;
  category: string[]; // Agora é um array de strings
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
}

const ComicFormModal: React.FC<ComicFormModalProps> = ({
  onClose,
  onComicSubmit,
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
    defaultValues: {
      title: '',
      author: '',
      publisher: '',
      year: new Date().getFullYear(),
      issue: '',
      edition: '',
      pages: 0,
      synopsis: '',
      category: [],
      isbn: '',
      pricingGroup: '',
      barcode: '',
      dimensions: {
        height: 1,
        width: 1,
        weight: 1,
        depth: 1,
      },
      price: 0,
      stock: 1,
      active: true,
      inactivationReason: '',
    },
  });

  // Opções pré-definidas para o grupo de categorias
  const categoryOptions = [
    { value: 'superhero', label: 'Super-Herói' },
    { value: 'manga', label: 'Mangá' },
    { value: 'independent', label: 'Independente' },
    { value: 'alternative', label: 'Alternativo' },
    { value: 'humor', label: 'Humor' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'drama', label: 'Drama' },
    { value: 'zombie', label: 'Zumbi' },
    { value: 'Aventura', label: 'aventura' },
  ];

  // Opções pré-definidas para o grupo de precificação
  const pricingGroupOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'economy', label: 'Economy' },
  ];

  const active = watch('active');

  const onSubmit: SubmitHandler<IComicForm> = data => {
    console.log('Dados do quadrinho:', data);
    onComicSubmit(data);
    onClose();
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          Editar quadrinho
          <Closed onClick={onClose} name="closeComicForm" />
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex $gap="1rem" $direction="column">
              <Input
                id="title"
                label="Título"
                placeholder="Título do quadrinho"
                {...register('title')}
                error={errors.title?.message}
              />

              <Input
                id="author"
                label="Autor"
                placeholder="Nome do autor"
                {...register('author')}
                error={errors.author?.message}
              />

              <Input
                id="publisher"
                label="Editora"
                placeholder="Editora"
                {...register('publisher')}
                error={errors.publisher?.message}
              />

              <Input
                id="year"
                label="Ano"
                type="number"
                placeholder="Ano de publicação"
                {...register('year')}
                error={errors.year?.message}
              />

              <Input
                id="issue"
                label="Issue"
                placeholder="Número da issue"
                {...register('issue')}
                error={errors.issue?.message}
              />

              <Input
                id="edition"
                label="Edição"
                placeholder="Edição (opcional)"
                {...register('edition')}
                error={errors.edition?.message}
              />

              <Input
                id="pages"
                label="Número de Páginas"
                type="number"
                placeholder="Quantidade de páginas"
                {...register('pages')}
                error={errors.pages?.message}
              />

              <Input
                id="synopsis"
                label="Sinopse"
                placeholder="Sinopse do quadrinho"
                {...register('synopsis')}
                error={errors.synopsis?.message}
              />

              {/* Grupo de checkboxes para Categoria usando os novos componentes styled */}
              <Controller
                control={control}
                name="category"
                render={({ field }) => {
                  const handleCheckboxChange = (
                    optionValue: string,
                    checked: boolean,
                  ) => {
                    if (checked) {
                      field.onChange([...field.value, optionValue]);
                    } else {
                      field.onChange(
                        field.value.filter((v: string) => v !== optionValue),
                      );
                    }
                  };

                  return (
                    <div>
                      <CheckboxGroupLabel>Categoria</CheckboxGroupLabel>
                      <CheckboxGroupContainer>
                        {categoryOptions.map(option => (
                          <CheckboxItem key={option.value}>
                            <Checkbox
                              id={`category-${option.value}`}
                              label={option.label}
                              checked={field.value.includes(option.value)}
                              onChange={e =>
                                handleCheckboxChange(
                                  option.value,
                                  e.target.checked,
                                )
                              }
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
                placeholder="Número ISBN"
                {...register('isbn')}
                error={errors.isbn?.message}
              />

              {/* Campo de Grupo de Precificação via CustomSelect */}
              <Controller
                control={control}
                name="pricingGroup"
                render={({ field }) => (
                  <>
                    <CustomSelect
                      id="pricingGroup"
                      name="pricingGroup"
                      label="Grupo de Precificação"
                      options={pricingGroupOptions}
                      value={field.value}
                      onChange={option =>
                        field.onChange(option ? option.value : '')
                      }
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
                placeholder="Código de Barras"
                {...register('barcode')}
                error={errors.barcode?.message}
              />

              <Flex $direction="row" $gap="1rem" $margin="0 0 1rem 0">
                <Input
                  id="dimensions.height"
                  label="Altura (cm)"
                  type="number"
                  placeholder="Altura"
                  {...register('dimensions.height')}
                  error={errors.dimensions?.height?.message}
                />
                <Input
                  id="dimensions.width"
                  label="Largura (cm)"
                  type="number"
                  placeholder="Largura"
                  {...register('dimensions.width')}
                  error={errors.dimensions?.width?.message}
                />
              </Flex>

              <Flex $direction="row" $gap="1rem" $margin="0 0 1rem 0">
                <Input
                  id="dimensions.weight"
                  label="Peso (kg)"
                  type="number"
                  placeholder="Peso"
                  {...register('dimensions.weight')}
                  error={errors.dimensions?.weight?.message}
                />
                <Input
                  id="dimensions.depth"
                  label="Profundidade (cm)"
                  type="number"
                  placeholder="Profundidade"
                  {...register('dimensions.depth')}
                  error={errors.dimensions?.depth?.message}
                />
              </Flex>

              <Input
                id="price"
                label="Preço (R$)"
                type="text"
                maskFunction={currencyMask}
                placeholder="Preço"
                {...register('price')}
                error={errors.price?.message}
              />

              <Input
                id="stock"
                label="Estoque"
                type="number"
                placeholder="Quantidade em estoque"
                {...register('stock')}
                error={errors.stock?.message}
              />

              <Flex $direction="column">
                <Flex $direction="row" $align="center" $gap="0.5rem">
                  <label style={{ fontWeight: 'bold' }}>Produto ativo</label>
                  <ToggleButton
                    onToggle={() => setValue('active', !active)}
                    isActive={active}
                  />
                </Flex>
                {!active && (
                  <Flex $direction="column">
                    <Input
                      id="inactivationReason"
                      label="Motivo de inativação"
                      placeholder="Informe o motivo de inativação"
                      {...register('inactivationReason')}
                      error={errors.inactivationReason?.message}
                    />
                  </Flex>
                )}
              </Flex>

              <SubmitButton type="submit" style={{ padding: '0.5rem 1rem' }}>
                Editar Quadrinho
              </SubmitButton>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ComicFormModal;
