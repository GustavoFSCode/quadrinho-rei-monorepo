"use client";
import { useState } from 'react';
import {
    ContentContainer,
    Header,
    HeaderTop,
    HeaderBottom,
    HeaderTitle,
    SearchAndActionsBox,
    StyledInputBox,
    ButtonBox,
    Content,
    Footer
} from './styled';
import Filter from '@/components/icons/Filter';
import Plus from '@/components/icons/Plus';
import Lupa from '@/components/icons/Lupa';
import Button from "@/components/Button";
import Input from "@/components/Inputs/Input/Input";
import Navbar from "@/components/Navbar";
import Barra from '@/components/icons/Barra';
import Tabela from '@/components/Tables/Clientes';
import Pagination from '@/components/Pagination';
import ModalCadastrarAdministrador from '@/components/Modals/Clientes/CadastrarCliente';
import FilterModal from '@/components/Modals/Clientes/Filter';

export default function Administradores() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Estado para o modal de filtro

    const handleOpenModal = () => {
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleOpenFilterModal = () => {
        setIsFilterModalOpen(true);
    }

    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
    }

    return (
        <>
            <Navbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            <ContentContainer isExpanded={isExpanded}>
                <Header>
                    <HeaderTop>
                        <HeaderTitle>Clientes</HeaderTitle>
                    </HeaderTop>
                    <HeaderBottom>
                        <SearchAndActionsBox>
                            <StyledInputBox>
                                <Input
                                    id="search"
                                    label=""
                                    placeholder="Buscar pelo nome"
                                    width="232px"
                                    onChange={() => { }}
                                />
                                <Barra />
                            </StyledInputBox>

                            <ButtonBox>
                                <Button
                                    text={
                                        <>
                                            <Filter />
                                            Filtro
                                        </>
                                    }
                                    type="button"
                                    variant="outline"
                                    width='103px'
                                    height='39px'
                                    onClick={handleOpenFilterModal}
                                />
                                <Button
                                    text={
                                        <>
                                            <Plus />
                                            Cadastrar cliente
                                        </>
                                    }
                                    type="button"
                                    variant="purple"
                                    width='195px'
                                    height='39px'
                                    onClick={handleOpenModal}
                                />
                            </ButtonBox>
                        </SearchAndActionsBox>
                    </HeaderBottom>
                </Header>
                <Content>
                    <Tabela/>
                </Content>
                <Footer>
                    <Pagination itemsPerPage={13}/>
                </Footer>
            </ContentContainer>

            {isModalOpen && (
                <ModalCadastrarAdministrador onClose={handleCloseModal} />
            )}

            {isFilterModalOpen && (
                <FilterModal onClose={handleCloseFilterModal} /> // Renderiza o modal de filtro
            )}
        </>
    )
}
