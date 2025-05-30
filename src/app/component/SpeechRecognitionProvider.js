"use client";
import { useEffect, useRef, useState } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function SpeechRecognitionProvider({ onCommand }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null); // Timeout to auto-stop after 5 seconds

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("Heard:", transcript);
      if (onCommand) {
        onCommand(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    if (isListening) {
      recognition.start();

      // Stop automatically after 5 seconds
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
        setIsListening(false);
      }, 5000);
    } else {
      recognition.stop();
      clearTimeout(timeoutRef.current);
    }

    return () => {
      recognition.stop();
      clearTimeout(timeoutRef.current);
    };
  }, [isListening, onCommand]);

  return (
    <button
      onClick={() => setIsListening((prev) => !prev)}
      className="mic-button"
    >
      🎤 {isListening ? "Listening..." : ""}
    </button>
  );
}
