'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from "next/navigation";
import { SidebarContainer, TopIconContainer, IconPart, MiddleIconContainer, BottomIconContainer, TopIcon } from "./styled"
import ModalLogout from '@/components/Modals/Logout';
import { GiArtificialHive } from "react-icons/gi";
import { FiShoppingCart } from "react-icons/fi";
import { IoHomeOutline } from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { GoInbox } from "react-icons/go";
import { BsGraphDown } from "react-icons/bs";
import { CiDollar } from "react-icons/ci";
import { PiNewspaperLight } from "react-icons/pi";

import {
    Jogadores,
    Perfil,
    Sair,
} from "../icons/notBold";
import {
    BoldJogadores,
    BoldPerfil,
} from "../icons/bold";
import Seta from "../icons/Seta";

interface NavbarProps {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isExpanded, setIsExpanded }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth(); // Inclui o usuário no destructuring

    const handleLinkClick = (event: React.MouseEvent) => {
        event.stopPropagation();
    };

    const handleLogoutClick = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setIsModalOpen(true);
    };

    const handleModalClose = (shouldLogout: boolean) => {
        setIsModalOpen(false);
        if (shouldLogout) {
            logout();
            router.push('/login');
        }
    };

    // Definição dos ícones e suas rotas com roles permitidas
    const menuItems = [
        { id: 'icon1', href: '/home', label: 'Home', Icon: IoHomeOutline, BoldIcon: IoHomeOutline, roles: [3, 6, 4, 5, 7] },
        { id: 'icon2', href: '/carrinho', label: 'Carrinho', Icon: FiShoppingCart, BoldIcon: FiShoppingCart, roles: [3, 6, 4, 5, 7] },
        { id: 'icon3', href: '/minhas-compras', label: 'Minhas compras', Icon: RiFileList3Line, BoldIcon: RiFileList3Line, roles: [3, 6, 4, 5, 7] },
        { id: 'icon4', href: '/clientes', label: 'Clientes', Icon: Jogadores, BoldIcon: BoldJogadores, roles: [3, 6, 4, 5, 7] },
        { id: 'icon5', href: '/estoque', label: 'Estoque', Icon: GoInbox, BoldIcon: GoInbox, roles: [3, 6, 4, 5, 7] },
        { id: 'icon6', href: '/vendas', label: 'Vendas', Icon: CiDollar, BoldIcon: CiDollar, roles: [3, 6, 4, 5, 7] },
        { id: 'icon7', href: '/trocas', label: 'Trocas', Icon: PiNewspaperLight, BoldIcon: PiNewspaperLight, roles: [3, 6, 4, 5, 7] },
        { id: 'icon7', href: '/dashboard', label: 'Dashboard', Icon: BsGraphDown, BoldIcon: BsGraphDown, roles: [3, 6, 4, 5, 7] },
        { id: 'icon8', href: '/chat-ia', label: 'Chat IA', Icon: GiArtificialHive, BoldIcon: GiArtificialHive, roles: [3, 6, 4, 5, 7] }
    ];

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    const toggleNavbar = () => {
        if (!isExpanded){
            setIsExpanded(true);
        }
    };

    const collapseNavbar = () => {
        setIsExpanded(false);
    };

    return (
        <>
        <SidebarContainer isExpanded={isExpanded} onClick={toggleNavbar}>
            <TopIconContainer isExpanded={isExpanded}>

            </TopIconContainer>

            {isExpanded && (
               <Seta
               onClick={collapseNavbar}
                />
            )}

            <MiddleIconContainer isExpanded={isExpanded}>
                {menuItems.map(item => {
                    // if (!item.roles.includes(user?.role.id || 0)) {
                    //     return null; // Não renderiza se o usuário não tiver acesso
                    // }

                    const active = isActive(item.href);
                    const IconComponent = active ? item.BoldIcon : item.Icon;

                    return (
                        <IconPart
                            key={item.id}
                            href={item.href}
                            id={item.id}
                            isActive={active}
                            isExpanded={isExpanded}
                            onClick={handleLinkClick}
                        >
                            <IconComponent />
                            {isExpanded && <span>{item.label}</span>}
                        </IconPart>
                    );
                })}
            </MiddleIconContainer>

            <BottomIconContainer>
                    <IconPart
                    id="icon13"
                    href="/perfil"
                    isExpanded={isExpanded}
                    isActive={isActive("/perfil")}
                    onClick={handleLinkClick}
                    >
                        {isActive("/perfil") ? <BoldPerfil /> : <Perfil />}
                        {isExpanded && <span> Meu perfil</span>}
                    </IconPart>
                    <IconPart
                        href="#" // Evita a navegação
                        isExpanded={isExpanded}
                        onClick={handleLogoutClick} // Novo handler
                    >
                        <Sair/>
                        {isExpanded && <span> Sair</span>}
                    </IconPart>
            </BottomIconContainer>
        </SidebarContainer>
        {isModalOpen && (
            <ModalLogout onClose={handleModalClose} />
          )}
        </>

    )
}

export default Navbar;
