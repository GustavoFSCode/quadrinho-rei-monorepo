// Timer.tsx

import React, { useEffect, useState } from 'react';
import {
  Wrapper,
  DisplayWrapper,
  TimeDisplay,
  IconWrapper,
  DisplayLabel,
} from './styled';
import { PlusIcon } from "@/components/icons/MiniPlus";
import { LessIcon } from "@/components/icons/MiniLess";
import { TimerIcon } from "@/components/icons/Timer";
import { RedTimerIcon } from "@/components/icons/RedTimer";

interface TimerProps {
  customTime: string; // formato "HH:mm"
  height?: string;
  width?: string;
  label?: string;
  onTimerEnd?: () => void;
  mode: 'countdown' | 'stopwatch';
}

const Timer: React.FC<TimerProps> = ({ customTime, height, width, label, onTimerEnd, mode }) => {
  const [time, setTime] = useState<number>(0); // Segundos restantes ou passados
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  // Definir isCountdown com base no modo
  const isCountdown = mode === 'countdown';

  // Inicializar o Timer
  useEffect(() => {
    if (isCountdown) {
      const [hours, minutes] = customTime.split(':').map(Number);
      const now = new Date();
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);
      let diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
      if (diffInSeconds < 0) diffInSeconds = 0;
      setTime(diffInSeconds);
    } else if (mode === 'stopwatch') {
      setTime(0);
    }
    setIsTimerActive(true);
  }, [customTime, isCountdown, mode]);

  // Gerenciar o intervalo do Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive) {
      if (isCountdown && time > 0) {
        interval = setInterval(() => {
          setTime(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsTimerActive(false);
              if (onTimerEnd) onTimerEnd();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (!isCountdown) {
        // Modo stopwatch
        interval = setInterval(() => {
          setTime(prev => prev + 1);
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [isTimerActive, time, isCountdown, onTimerEnd]);

  // Handlers para incrementar e decrementar o tempo (apenas para countdown)
  const handleIncreaseTime = () => {
    if (isCountdown) {
      setTime(prev => prev + 5); // Adiciona 5 segundos
    }
  };

  const handleDecreaseTime = () => {
    if (isCountdown) {
      setTime(prev => (prev - 5 > 0 ? prev - 5 : 0)); // Remove 5 segundos
      if (time - 5 <= 0) {
        setIsTimerActive(false);
        if (onTimerEnd) onTimerEnd();
      }
    }
  };

  // Formatar o tempo para "HH:MM:SS"
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const hDisplay = h > 0 ? `${h}:` : '';
    const mDisplay = `${m < 10 && h > 0 ? '0' : ''}${m}:`;
    const sDisplay = s < 10 ? `0${s}` : s;

    return `${hDisplay}${mDisplay}${sDisplay}`;
  };

  const displayTime = formatTime(time);

  // Verificar se falta menos de 1 minuto (apenas para countdown)
  const isLessThanOneMinute = isCountdown && time <= 60;

  return (
    <Wrapper>
      {label && <DisplayLabel>{label}</DisplayLabel>}
      <DisplayWrapper
        height={height}
        width={width}
        isLessThanOneMinute={isLessThanOneMinute}
        isCountdown={isCountdown} // Passando a nova prop
      >
        {isCountdown && (
          <IconWrapper onClick={handleDecreaseTime}>
            <LessIcon />
          </IconWrapper>
        )}

        <IconWrapper center={!isCountdown}>
          {isLessThanOneMinute ? <RedTimerIcon /> : <TimerIcon />}
          <TimeDisplay isLessThanOneMinute={isLessThanOneMinute}>
            {displayTime}
          </TimeDisplay>
        </IconWrapper>

        {isCountdown && (
          <IconWrapper onClick={handleIncreaseTime}>
            <PlusIcon />
          </IconWrapper>
        )}
      </DisplayWrapper>
    </Wrapper>
  );
};

export default Timer;
