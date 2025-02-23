import styled from "styled-components";
import Link from "next/link";

interface SidebarProps {
  isExpanded: boolean;
}

export const SidebarContainer = styled.div<SidebarProps>`
  width: ${(props) => (props.isExpanded ? "200px" : "80px")};
  height: 100vh;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 0 20px 20px 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  transition: width 0.3s ease;
  cursor: pointer;
  z-index: 1000; /* Garante que a navbar fique acima do conteúdo */

  &::-webkit-scrollbar {
    width: 8px;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
`;

export const TopIconContainer = styled.div<SidebarProps>`
    width: ${(props) => (props.isExpanded ? "200px" : "80px")};
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 20px;
`;

export const SetaIcon = styled.svg`
    position: absolute;
    top: 15px;
    right: 15px;
    cursor: pointer;
    width: 17px;
    height: 14px;
    transition: background-color 0.3s ease, border-radius 0.3s ease, padding 0.3s ease;
`;

export const TopIcon = styled.div<SidebarProps>`
    width: ${(props) => (props.isExpanded ? "205px" : "70px")}; /* Ajustar o tamanho quando expandido */
    height: ${(props) => (props.isExpanded ? "81px" : "81px")};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease, width 0.3s ease, height 0.3s ease;

    svg {
        width: ${(props) => (props.isExpanded ? "240px" : "80px")}; /* Ajustar o tamanho quando expandido */
        height: ${(props) => (props.isExpanded ? "81px" : "80px")};
        transition: color 0.3s ease;

    }

    &:focus {
        outline: none;
        background-color: #e0e0e0;
    }
`;

export const MiddleIconContainer = styled.div<SidebarProps>`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    justify-content: flex-start;
`;

interface IconPartProps {
    isActive?: boolean;
}

export const IconPart = styled(Link)<SidebarProps & IconPartProps & { isActive?: boolean; isExpanded?: boolean }>`
    position: relative;
    width: ${(props) => (props.isExpanded ? "200px" : "80px")};
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 30px;
    background-color: transparent;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, width 0.3s ease, height 0.3s ease, gap 0.3s ease;
    text-decoration: none;

    ${(props) =>
        props.isActive &&
        `&::after {
            content: '';
            position: absolute;
            right: ${props.isExpanded ? '0px' : '0px'};
            height: 40px;
            width: 15px;
            background-color: red;
            border-radius: 10px 0 0 10px;
            transition: right 0.3s ease;
        }`}

    &:hover {
        background-color: #f0f0f0;
        transform: scale(1.05);
    }

    svg {
        width: 20px;
        height: 24px;
        color: #747373;
        transition: color 0.3s ease, width 0.3s ease, height 0.3s ease;

        &:hover {
            color: #333;
        }
    }

    span {
        display: ${(props) => (props.isExpanded ? "inline" : "none")};
        font-family: "Primary", sans-serif;
        font-size: 16px;
        font-weight: 400;
        line-height: 19.09px;
        color: #747373;
        margin-left: 10px;
        white-space: nowrap;

    }

    &:focus {
        outline: none;
        background-color: #e0e0e0;
    }
`;

export const BottomIconContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
`;
