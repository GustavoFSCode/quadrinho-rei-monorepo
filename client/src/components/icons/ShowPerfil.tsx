import React from "react";
import ClickableIcon from '../../styles/ClickableIcon';

interface ShowPerfilProps {
    onClick?: () => void;
}

const ShowPerfil: React.FC<ShowPerfilProps> = ({ onClick }) => (
    <ClickableIcon 
    viewBox="0 0 30 30" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    onClick={onClick}>
        <path d="M22.4614 12.5129V7.5386M22.4614 7.5386H17.4871M22.4614 7.5386L15 15M13.3419 7.5386H11.518C10.6349 7.43943 9.74074 7.53189 8.89659 7.8097C8.4289 8.04852 8.04855 8.42889 7.80973 8.89658C7.5319 9.74073 7.43941 10.6349 7.53862 11.518V18.482C7.43941 19.3651 7.5319 20.2593 7.80973 21.1034C8.04855 21.5711 8.4289 21.9515 8.89659 22.1903C9.74074 22.4681 10.6349 22.5606 11.518 22.4614H18.482C19.3651 22.5606 20.2593 22.4681 21.1034 22.1903C21.5711 21.9515 21.9514 21.5711 22.1903 21.1034C22.4681 20.2593 22.5606 19.3651 22.4614 18.482V16.6581" stroke="#747373" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </ClickableIcon>
);

export default ShowPerfil;