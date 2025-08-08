"use client";
import { useEffect, useState, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const SpeechRecognitionProvider = ({ onCommand }) => {
  const { transcript, finalTranscript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const timeoutRef = useRef(null);
  const micRef = useRef(null);
  const suppressBlur = useRef(false);
  const [countdown, setCountdown] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [micPosition, setMicPosition] = useState({ top: 0, left: 0, visible: false });

  // Handle Focus on Inputs
  useEffect(() => {
    const handleFocus = (e) => {
      // console.log( "input type:",e.target.type);
      // console.log(e.target.tagName, "input tagName") ;

      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") return;
      const disallowedTypes = ["file", "date", "number", "password", "time", "radio", "checkbox", "datetime-local", "month", "week", "color"];
      if (
        e.target.tagName === "INPUT" &&
        (disallowedTypes.includes(e.target.type) || e.target.readOnly || e.target.disabled)
      ) {
        return; // Skip disallowed types and readonly/disabled fields
      }
      setFocusedField(e.target);

      const rect = e.target.getBoundingClientRect();
      setMicPosition({
        top: rect.top + window.scrollY,
        left: rect.right - 30 + window.scrollX,
        visible: true,
      });
    };

    const handleClick = (e) => {
      if (micRef.current && micRef.current.contains(e.target)) {
        suppressBlur.current = true;
        if (focusedField) focusedField.focus(); // Ensure input focus remains
      } else {
        suppressBlur.current = false;
      }
    };

    const handleBlur = (e) => {
      setTimeout(() => {
        if (suppressBlur.current) return; // Skip hiding mic if mic clicked
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
          // Moving focus to another input, reposition mic
          const rect = document.activeElement.getBoundingClientRect();
          setFocusedField(document.activeElement);
          setMicPosition({
            top: rect.top + window.scrollY,
            left: rect.right - 30 + window.scrollX,
            visible: true,
          });
        } else {
          // Truly unfocused, hide mic
          setFocusedField(null);
          setMicPosition((prev) => ({ ...prev, visible: false }));
        }
      }, 50);
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("focusout", handleBlur);
    };
  }, [focusedField]);

  useEffect(() => {
    if (finalTranscript) {
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
        onCommand(finalTranscript.toLowerCase());
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

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      {focusedField && (() => {
        const domType = focusedField.getAttribute("type") || "";
        const disallowedTypes = ["file", "date", "number", "password", "time", "radio", "checkbox", "datetime-local", "month", "week", "color"];

        if (focusedField.tagName === "INPUT" && disallowedTypes.includes(domType)) return null;
        if (focusedField.readOnly || focusedField.disabled) return null;

        const rect = focusedField.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return null; // hidden or off-screen input

        return (
          <button
            ref={micRef}
            onClick={toggleListening}
            style={{
              position: "absolute",
              top: micPosition.top + 6 + "px",
              left: micPosition.left - 10 + "px",
              zIndex: 9999,
              backgroundColor: listening ? "#28a745" : "#007bff",
              color: "#fff",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              cursor: "pointer",
              userSelect: "none",
              transition: "opacity 0.2s ease",
              border: 'none'
            }}
          >
            🎤
          </button>
        );
      })()}


    </>
  );
};

export default SpeechRecognitionProvider;
