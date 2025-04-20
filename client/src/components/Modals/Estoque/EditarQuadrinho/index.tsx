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

  const categoryOptions = [
    { value: 'superhero', label: 'Super-Herói' },
    { value: 'manga', label: 'Mangá' },
    { value: 'independent', label: 'Independente' },
    { value: 'alternative', label: 'Alternativo' },
    { value: 'humor', label: 'Humor' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'drama', label: 'Drama' },
    { value: 'zombie', label: 'Zumbi' },
    { value: 'aventura', label: 'Aventura' },
  ];

  const pricingGroupOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'economy', label: 'Economy' },
  ];

  const active = watch('active');
  const isRead = readonly;

  const onSubmit: SubmitHandler<IComicForm> = data => {
    if (!isRead) {
      onComicSubmit(data);
    }
  };

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
                step="any"
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
                step="any"
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

              <Controller
                control={control}
                name="category"
                render={({ field }) => {
                  const handleCheckboxChange = (
                    val: string,
                    checked: boolean,
                  ) => {
                    if (checked) field.onChange([...field.value, val]);
                    else field.onChange(field.value.filter(v => v !== val));
                  };
                  return (
                    <div>
                      <CheckboxGroupLabel>Categoria</CheckboxGroupLabel>
                      <CheckboxGroupContainer>
                        {categoryOptions.map(opt => (
                          <CheckboxItem key={opt.value}>
                            <Checkbox
                              id={`category-${opt.value}`}
                              label={opt.label}
                              checked={field.value.includes(opt.value)}
                              onChange={e =>
                                handleCheckboxChange(
                                  opt.value,
                                  e.target.checked,
                                )
                              }
                              disabled={isRead}
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
                      onChange={opt => field.onChange(opt ? opt.value : '')}
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

              <Flex $direction="row" $gap="1rem">
                <Input
                  id="dimensions.height"
                  label="Altura (cm)"
                  type="number"
                  step="any"
                  {...register('dimensions.height')}
                  error={errors.dimensions?.height?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.width"
                  label="Largura (cm)"
                  type="number"
                  step="any"
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
                  step="any"
                  {...register('dimensions.weight')}
                  error={errors.dimensions?.weight?.message}
                  disabled={isRead}
                />
                <Input
                  id="dimensions.depth"
                  label="Profundidade (cm)"
                  type="number"
                  step="any"
                  {...register('dimensions.depth')}
                  error={errors.dimensions?.depth?.message}
                  disabled={isRead}
                />
              </Flex>

              <Input
                id="price"
                label="Preço (R$)"
                maskFunction={currencyMask}
                {...register('price')}
                error={errors.price?.message}
                disabled={isRead}
              />
              <Input
                id="stock"
                label="Estoque"
                type="number"
                step="any"
                {...register('stock')}
                error={errors.stock?.message}
                disabled={isRead}
              />

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
                <SubmitButton type="submit" style={{ padding: '0.5rem 1rem' }}>
                  Editar Quadrinho
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
