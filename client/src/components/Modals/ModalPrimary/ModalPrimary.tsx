/* eslint-disable prettier/prettier */
import React from 'react';
import ButtonOutlinePrimary from '@/components/Buttons/ButtonOutlinePrimary';
import ButtonPrimary from '@/components/Buttons/ButtonPrimary';
import Modal from '../Modal/Modal';

interface IButton {
  text: string;
  action: () => void;
}

interface Props {
  text: string;
  outlineButton?: IButton;
  solidButton?: IButton;
}

const ModalPrimary = ({ text, outlineButton, solidButton }: Props) => {
  return (
    <Modal
      image={{
        url: '/img/modal_question_icon.svg',
        alt: 'icone de questionamento',
      }}
      text={text}
      outlineButton={outlineButton ? (
        <ButtonOutlinePrimary maxwidth="7.5rem" onClick={outlineButton.action}>
          {outlineButton.text}
        </ButtonOutlinePrimary>
      ) : undefined}
      solidButton={solidButton ? (
        <ButtonPrimary width="7.5rem" onClick={solidButton.action}>
          {solidButton.text}
        </ButtonPrimary>
      ) : undefined}
    />
  );
};

export default ModalPrimary;
