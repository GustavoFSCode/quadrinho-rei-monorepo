import styled from 'styled-components';

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .pagination {
    display: flex;
    list-style: none;
    padding: 0px;
  }

  .pagination li {
    margin: 0 5px;
    cursor: pointer;

    &.page-item:not(.active) a { /* Hover não será aplicado no item ativo */
      padding: 8px;
      border-radius: 50%;
      text-decoration: none;
      color: #666768;
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      height: 24px;
      line-height: 24px;

      &:hover {
        background-color: #e0e0e0;
        width: 25px;
      }
    }
  }

  .pagination li.active a {
    background-color: #F1DE3B;
    border-radius: 50%;
    width: 25px;
    color: white;
    padding: 8px;
    border-radius: 50%;
    text-decoration: none;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    height: 24px;
    line-height: 24px;
  }

  .pagination li.disabled a {
    color: #aaa;
    pointer-events: none;
  }

  @media (max-width: 628px) {
    flex-wrap: wrap;
    .pagination {
      margin-top: 5px;
    }
  }
`;

export const PaginationFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 50px;
  margin-right: 44px;

  @media (max-width: 628px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PaginationText = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: #666768;
`;

export const PageButton = styled.button<{ active?: boolean }>`
  border: none;
  background: ${({ active }) => (active ? 'red' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : '#333')};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;

  &:hover {
    background-color: ${({ active }) => (!active ? '#e0e0e0' : 'red')};
  }
`;

export const PageArrow = styled.button`
  border: none;
  background: transparent;
  color: #666768;
  cursor: pointer;
  padding: 4px;
  min-width: 24px;
  min-height: 24px;
  display: flex;
  justify-content: center;
  align-items: center; /* Certificar que o conteúdo esteja centralizado */

  &:hover {
    background-color: #e0e0e0;
    border-radius: 100%;
  }
`;
