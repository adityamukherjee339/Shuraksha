"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Mic, MicOff, Volume2, X } from "lucide-react";

interface FakeCallModalProps {
  onClose: () => void;
}

export function FakeCallModal({ onClose }: FakeCallModalProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initial greeting from AI
    const initialGreeting = "Hey, it's me! Are you almost here?";
    speak(initialGreeting);
    setMessages([{ role: "assistant", content: initialGreeting }]);

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = async (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          
          if (transcript.trim()) {
            handleUserSpeech(transcript);
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleUserSpeech = async (text: string) => {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
          speak(data.reply);
        }
      }
    } catch (e) {
      console.error("Failed to fetch reply", e);
    }
  };

  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    
    // Stop listening while speaking to prevent echo loops
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a female voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google US English"));
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    
    utterance.onend = () => {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch(e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch(e) {}
    }
    setIsListening(!isListening);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-between py-12 px-6">
      <div className="text-center mt-10">
        <h2 className="text-4xl font-light text-white mb-2">Sarah (Friend)</h2>
        <p className="text-gray-400 text-lg">{formatTime(callDuration)}</p>
      </div>

      {/* Avatar Pulse */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-blue-600/20 animate-ping absolute inset-0"></div>
        <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center relative z-10 text-white shadow-xl">
          <Volume2 size={48} />
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-8 w-full max-w-sm mb-12">
        <button className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <Volume2 size={24} />
          </div>
          <span className="text-xs font-medium">Speaker</span>
        </button>
        
        <button 
          onClick={toggleMic}
          className={`flex flex-col items-center gap-2 transition-colors ${isListening ? "text-white" : "text-white/40"}`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isListening ? "bg-white text-gray-900" : "bg-gray-800 text-white/70"}`}>
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
          </div>
          <span className="text-xs font-medium">{isListening ? "Mute" : "Unmute"}</span>
        </button>
        
        <button 
          onClick={onClose}
          className="flex flex-col items-center gap-2 text-white hover:opacity-90 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Phone size={24} className="fill-current transform rotate-[135deg]" />
          </div>
          <span className="text-xs font-medium">End Call</span>
        </button>
      </div>
    </div>
  );
}
