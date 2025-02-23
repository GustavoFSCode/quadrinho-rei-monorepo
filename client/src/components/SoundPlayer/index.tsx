import React, { useState, useRef, useEffect } from 'react';
import { Container, IconWrapper, TimeStamp, ProgressBar, Progress } from './styled';
import SoundIcon from '@/components/icons/Sound';
import PlayIcon from '@/components/icons/Play';
import PauseIcon from '@/components/icons/Pause';

interface SoundPlayerProps {
  src: string;
}

const SoundPlayer: React.FC<SoundPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      let audioDuration = audioRef.current.duration;
      if (!isFinite(audioDuration) || audioDuration === 0) {
        // Forçar a atualização da duração
        audioRef.current.currentTime = Number.MAX_SAFE_INTEGER;
        audioRef.current.ontimeupdate = () => {
          audioRef.current!.ontimeupdate = null;
          audioDuration = audioRef.current!.duration;
          if (isFinite(audioDuration)) {
            setDuration(audioDuration);
            audioRef.current!.currentTime = 0;
          }
        };
      } else {
        setDuration(audioDuration);
      }
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handlePlaying = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('timeupdate', onTimeUpdate);

      // Forçar o carregamento do áudio
      audio.load();

      return () => {
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        audio.removeEventListener('timeupdate', onTimeUpdate);
      };
    }
  }, [src]);

  const formatTime = (time: number) => {
    if (!isFinite(time) || time < 0) {
      return '0:00';
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration && isFinite(duration) && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercent =
    duration && isFinite(duration) && duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Container>
      <IconWrapper>
        <SoundIcon />
      </IconWrapper>
      <TimeStamp>{formatTime(currentTime)}</TimeStamp>
      <ProgressBar onClick={handleProgressClick}>
        <Progress style={{ width: `${progressPercent}%` }} />
        <div className="thumb" style={{ left: `${progressPercent}%` }} />
      </ProgressBar>
      <TimeStamp>{formatTime(duration)}</TimeStamp>
      <IconWrapper onClick={togglePlayPause}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </IconWrapper>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
      />
    </Container>
  );
};

export default SoundPlayer;
