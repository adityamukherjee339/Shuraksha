import { useState, useEffect, useCallback } from "react";

export function useVoiceCommand(triggerWord: string, onTrigger: () => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        if (transcript.includes(triggerWord.toLowerCase())) {
          onTrigger();
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please allow microphone access to use voice SOS.");
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart listening if it stops unexpectedly while it should be listening
        if (isListening) {
          recognition.start();
        }
      };

      recognition.start();
      
      return () => {
        setIsListening(false);
        recognition.stop();
      };
    } catch (e) {
      console.error(e);
      setError("Failed to start voice recognition.");
    }
  }, [triggerWord, onTrigger, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, startListening, stopListening, error };
}
