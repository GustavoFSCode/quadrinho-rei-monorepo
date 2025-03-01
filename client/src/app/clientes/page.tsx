"use client";

import { useState, useEffect } from 'react';
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
import Button from "@/components/Button";
import Input from "@/components/Inputs/Input/Input";
import Navbar from "@/components/Navbar";
import Barra from '@/components/icons/Barra';
import Tabela from '@/components/Tables/Clientes';
import Pagination from '@/components/Pagination';
import ModalCadastrarClientes from '@/components/Modals/Clientes/CadastrarCliente';
import FilterModal from '@/components/Modals/Clientes/Filter';
import { getClient } from '@/services/clientService';

export default function Clientes() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await getClient();
                console.log('Resposta de /getClient:', data);
            } catch (error) {
                console.error('Erro ao chamar /getClient:', error);
            }
        })();
    }, []);

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
                    <Tabela />
                </Content>
                <Footer>
                    <Pagination itemsPerPage={13} />
                </Footer>
            </ContentContainer>

            {isModalOpen && (
                <ModalCadastrarClientes onClose={handleCloseModal} />
            )}

            {isFilterModalOpen && (
                <FilterModal onClose={handleCloseFilterModal} />
            )}
        </>
    )
}
