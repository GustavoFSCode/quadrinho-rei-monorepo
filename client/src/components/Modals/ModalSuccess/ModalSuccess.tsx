import React from 'react';
import ButtonOutlineSuccess from '@/components/Buttons/ButtonOutlineSuccess';
import ButtonSuccess from '@/components/Buttons/ButtonSuccess';
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
  subText?: string;
  outlineButton?: IButton;
  solidButton?: IButton;
}

const ModalSuccess = ({
  gap,
  maxwidth,
  maxheight,
  text,
  subText,
  outlineButton,
  solidButton,
}: Props) => {
  return (
    <Modal
      gap={gap}
      maxwidth={maxwidth}
      maxheight={maxheight}
      image={{
        url: '/img/confirm-green-withbg.svg',
        alt: 'icone de sucesso',
      }}
      text={text}
      subText={subText}
      outlineButton={
        outlineButton ? (
          <ButtonOutlineSuccess
            maxwidth={outlineButton && solidButton ? '6.25rem' : '7.5rem'}
            onClick={outlineButton.action}
          >
            {outlineButton.text}
          </ButtonOutlineSuccess>
        ) : undefined
      }
      solidButton={
        solidButton ? (
          <ButtonSuccess
            width={outlineButton && solidButton ? '6.25rem' : '17rem'}
            onClick={solidButton.action}
          >
            {solidButton.text}
          </ButtonSuccess>
        ) : undefined
      }
    />
  );
};

export default ModalSuccess;
