import React, { useState, useRef } from "react";
import BaseInput, { BaseInputProps } from "../BaseInput";
import { MicButton } from "./styled";
import { MicIcon } from '@/components/icons/Mic';

interface InputAudioProps extends BaseInputProps {
  onAudioRecorded?: (audioUrl: string) => void;
}

const InputAudio = ({
  id,
  name,
  label,
  width,
  height,
  placeholder,
  value,
  onChange,
  onBlur,
  onAudioRecorded,
  ...rest
}: InputAudioProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const handleMicClick = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          if (onAudioRecorded) {
            onAudioRecorded(audioUrl);
          }
          stream.getTracks().forEach(track => track.stop());
          mediaRecorderRef.current = null;
          setIsRecording(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Erro ao acessar o microfone', error);
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <BaseInput
        id={id}
        name={name}
        label={label}
        type="text"
        placeholder={placeholder}
        width={width}
        height={height}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...rest}
      />
    </div>
  );
};

export default InputAudio;
