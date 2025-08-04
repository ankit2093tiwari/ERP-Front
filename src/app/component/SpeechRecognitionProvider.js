"use client";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const SpeechRecognitionProvider = ({ onCommand }) => {
  const { transcript, finalTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const timeoutRef = useRef(null);
  const [countdown, setCountdown] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  // Always call hooks unconditionally
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        setFocusedField(e.target);
      }
    };
    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);

  useEffect(() => {
    if (finalTranscript) {
      console.log("Final Transcript:", finalTranscript);

      if (focusedField) {
        const currentValue = focusedField.value || "";
        const newValue = (currentValue + " " + finalTranscript).trim();

        let nativeSetter;

        if (focusedField.tagName === "TEXTAREA") {
          nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        } else if (focusedField.tagName === "INPUT") {
          nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        }

        if (nativeSetter) {
          nativeSetter.call(focusedField, newValue);

          const event = new Event("input", { bubbles: true });
          focusedField.dispatchEvent(event);
        }
      } else {
        const isCommandExecuted = onCommand(finalTranscript.toLowerCase()); // Route/Action Commands
      }

      resetTranscript();
    }
  }, [finalTranscript, focusedField, onCommand, resetTranscript]);

  useEffect(() => {
    let interval;
    if (listening && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && listening) {
      stopListening();
    }
    return () => clearInterval(interval);
  }, [listening, countdown]);

  const startListening = () => {
    if (!listening) {
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      setCountdown(10);
      timeoutRef.current = setTimeout(stopListening, 10000);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current);
    setCountdown(0);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Only conditionally return after all hooks are declared
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="">
        <h2>Your browser does not support Speech Recognition.</h2>
      </div>
    );
  }

  return (
    <button className="mic-button" onClick={toggleListening}>
      🎤 {listening ? `Listening... (${countdown}s)` : "Start"}
    </button>
  );
};

export default SpeechRecognitionProvider;
