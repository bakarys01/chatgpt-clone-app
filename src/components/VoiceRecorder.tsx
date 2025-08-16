"use client";

import { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export default function VoiceRecorder({ onTranscription, onError }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecording();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;
      
      // Start audio level monitoring
      const updateAudioLevel = () => {
        if (analyzerRef.current) {
          const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
          analyzerRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onError?.('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('operation', 'transcribe');
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      onTranscription?.(data.text);
    } catch (error) {
      console.error('Transcription error:', error);
      onError?.(error instanceof Error ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelStyle = () => {
    const intensity = Math.min(audioLevel / 50, 1); // Normalize to 0-1
    return {
      transform: `scale(${1 + intensity * 0.5})`,
      opacity: 0.7 + intensity * 0.3,
    };
  };

  return (
    <div className="flex items-center space-x-2">
      {!isRecording && !isTranscribing ? (
        <button
          onClick={startRecording}
          className="flex items-center justify-center w-12 h-12 border-2 border-orange-200 rounded-2xl bg-white hover:bg-orange-50 text-orange-500 hover:text-orange-600 transition-colors"
          title="Start voice recording"
        >
          🎤
        </button>
      ) : isRecording ? (
        <div className="flex items-center space-x-3">
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl transition-all shadow-lg"
            style={getAudioLevelStyle()}
            title="Stop recording"
          >
            ⏹️
          </button>
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-600 font-mono font-medium">{formatTime(recordingTime)}</span>
          </div>
          
          {/* Audio level visualizer - Claude style */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-orange-400 to-red-400 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(4, (audioLevel / 255) * 20 + Math.random() * 8)}px`,
                  opacity: audioLevel > i * 30 ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 border-2 border-orange-400 border-t-transparent rounded-2xl animate-spin"></div>
          <span className="text-sm text-orange-600 font-medium">Transcribing...</span>
        </div>
      )}
    </div>
  );
}