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

      recognition.onresult = async (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        
        // Immediate fallback
        if (transcript.includes(triggerWord.toLowerCase())) {
          onTrigger();
          return;
        }

        // AI Intent Detection (debounce or throttle might be needed in prod, but for now we check the final transcript block)
        if (event.results[current].isFinal) {
          try {
            const res = await fetch("/api/ai/intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transcript }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.isDistress) {
                onTrigger();
              }
            }
          } catch (e) {
            console.error("Failed to analyze intent:", e);
          }
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
