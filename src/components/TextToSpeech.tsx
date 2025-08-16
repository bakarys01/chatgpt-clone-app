"use client";

import { useState, useRef } from 'react';

interface TextToSpeechProps {
  text: string;
  voice?: string;
  model?: string;
}

const AVAILABLE_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced' },
  { value: 'echo', label: 'Echo', description: 'Clear, professional' },
  { value: 'fable', label: 'Fable', description: 'Warm, expressive' },
  { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative' },
  { value: 'nova', label: 'Nova', description: 'Bright, energetic' },
  { value: 'shimmer', label: 'Shimmer', description: 'Soft, gentle' },
];

export default function TextToSpeech({ text, voice = 'alloy', model = 'tts-1' }: TextToSpeechProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voice);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAndPlaySpeech = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('operation', 'speak');
      formData.append('text', text.trim());
      formData.append('voice', selectedVoice);
      formData.append('model', model);

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Speech synthesis failed');
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setError(error instanceof Error ? error.message : 'Speech synthesis failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const downloadAudio = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('operation', 'speak');
      formData.append('text', text.trim());
      formData.append('voice', selectedVoice);
      formData.append('model', model);

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Speech synthesis failed');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `speech-${selectedVoice}-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!text.trim()) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
      {/* Voice selector */}
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        className="text-xs border border-gray-300 rounded px-2 py-1"
        disabled={isGenerating || isPlaying}
      >
        {AVAILABLE_VOICES.map((v) => (
          <option key={v.value} value={v.value} title={v.description}>
            {v.label}
          </option>
        ))}
      </select>

      {/* Play/Stop button */}
      {!isPlaying ? (
        <button
          onClick={generateAndPlaySpeech}
          disabled={isGenerating}
          className="flex items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
          title="Play as speech"
        >
          {isGenerating ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '▶️'
          )}
        </button>
      ) : (
        <button
          onClick={stopPlayback}
          className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          title="Stop playback"
        >
          ⏹️
        </button>
      )}

      {/* Download button */}
      <button
        onClick={downloadAudio}
        disabled={isGenerating || isPlaying}
        className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors disabled:opacity-50"
        title="Download as MP3"
      >
        📥
      </button>

      {/* Error display */}
      {error && (
        <span className="text-xs text-red-600" title={error}>
          ⚠️
        </span>
      )}
    </div>
  );
}