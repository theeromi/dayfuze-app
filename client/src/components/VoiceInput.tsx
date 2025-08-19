import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  onEnd?: () => void;
  isListening: boolean;
  onToggleListening: () => void;
}

// Extend Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function VoiceInput({ onTranscription, onEnd, isListening, onToggleListening }: VoiceInputProps) {
  const recognition = useRef<any>(null);
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognition.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscription(transcript);
        onToggleListening(); // Stop listening after getting result
      };

      recognition.current.onend = () => {
        if (onEnd) onEnd();
        onToggleListening(); // Ensure we update the listening state
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice input error",
          description: `Speech recognition failed: ${event.error}`,
          variant: "destructive",
        });
        onToggleListening(); // Stop listening on error
      };
    } else {
      setIsSupported(false);
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input. Please type your task instead.",
        variant: "destructive",
      });
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, [onTranscription, onEnd, onToggleListening, toast]);

  const startListening = () => {
    if (!isSupported || !recognition.current) return;
    
    try {
      recognition.current.start();
      onToggleListening();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast({
        title: "Voice input failed",
        description: "Couldn't start voice recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
    }
    onToggleListening();
  };

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Hide the voice button if not supported
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`relative ${isListening ? 'text-red-500' : 'text-gray-500'}`}
      data-testid={isListening ? "button-stop-voice" : "button-start-voice"}
    >
      {isListening ? (
        <>
          <Square className="h-4 w-4 mr-1" />
          Stop
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-1" />
          Voice
        </>
      )}
      
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}