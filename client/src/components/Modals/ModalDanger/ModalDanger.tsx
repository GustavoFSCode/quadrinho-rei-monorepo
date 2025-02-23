import React from 'react';
import ButtonDanger from '@/components/Buttons/ButtonDanger';
import ButtonOutlineDanger from '@/components/Buttons/ButtonOutlineDanger';
import Modal from '../Modal/Modal';

interface IButton {
  text: string;
  action: () => void;
}

interface Props {
  gap?: string;
  maxwidth?: string;
  maxheight?: string;
  text: string;
  outlineButton?: IButton;
  solidButton?: IButton;
}

const ModalDanger = ({
  gap,
  maxwidth,
  maxheight,
  text,
  outlineButton,
  solidButton,
}: Props) => {
  return (
    <Modal
      gap={gap}
      maxwidth={maxwidth}
      maxheight={maxheight}
      image={{
        url: '/img/modal_warning_icon.svg',
        alt: 'icone de alerta',
      }}
      text={text}
      outlineButton={
        outlineButton ? (
          <ButtonOutlineDanger width="7.5rem" onClick={outlineButton.action}>
            {outlineButton.text}
          </ButtonOutlineDanger>
        ) : undefined
      }
      solidButton={
        solidButton ? (
          <ButtonDanger width="7.5rem" onClick={solidButton.action}>
            {solidButton.text}
          </ButtonDanger>
        ) : undefined
      }
    />
  );
};

export default ModalDanger;
