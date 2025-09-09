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

  // New states for live transcription
  const [isProcessing, setIsProcessing] = useState(false);
  const [baseText, setBaseText] = useState(""); // Store the original text before voice input
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);

  // Handle Focus on Inputs
  useEffect(() => {
    const handleFocus = (e) => {
      if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") return;
      const disallowedTypes = ["file", "date", "number", "password", "time", "radio", "checkbox", "datetime-local", "month", "week", "color"];
      if (
        e.target.tagName === "INPUT" &&
        (disallowedTypes.includes(e.target.type) || e.target.readOnly || e.target.disabled)
      ) {
        return;
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
        if (focusedField) focusedField.focus();
      } else {
        suppressBlur.current = false;
      }
    };


    // console.log(document.activeElement,"activeElement");

    const handleBlur = (e) => {
      setTimeout(() => {
        if (suppressBlur.current) return;
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
          const rect = document.activeElement.getBoundingClientRect();
          setFocusedField(document.activeElement);
          setMicPosition({
            top: rect.top + window.scrollY,
            left: rect.right - 30 + window.scrollX,
            visible: true,
          });
        } else {
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

  // UPDATED: Handle LIVE transcript (real-time updates)
  useEffect(() => {


    if (transcript && focusedField && listening) {
      setIsProcessing(true);
      // console.log(transcript, "transcript recieved!");

      // Combine base text with live transcript
      const newValue = (baseText + " " + transcript).trim();

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

      setLastTranscriptLength(transcript.length);

      // Hide processing indicator after a short delay
      setTimeout(() => setIsProcessing(false), 200);
    }
  }, [transcript, focusedField, baseText, listening]);

  // Handle final transcript (when speech ends)
  useEffect(() => {
    if (finalTranscript) {
      if (focusedField) {
        // Update base text to include the finalized transcript
        const newBaseText = (baseText + " " + finalTranscript).trim();
        setBaseText(newBaseText);

        // Ensure final text is in the field
        let nativeSetter;
        if (focusedField.tagName === "TEXTAREA") {
          nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        } else if (focusedField.tagName === "INPUT") {
          nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        }

        if (nativeSetter) {
          nativeSetter.call(focusedField, newBaseText);
          const event = new Event("input", { bubbles: true });
          focusedField.dispatchEvent(event);
        }
      } else {
        onCommand(finalTranscript.toLowerCase());
      }
      resetTranscript();
    }
  }, [finalTranscript, focusedField, onCommand, resetTranscript, baseText]);

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
    if (!listening && focusedField) {
      // Store current text as base text
      setBaseText(focusedField.value || "");
      setIsProcessing(false);

      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
      setCountdown(10);
      timeoutRef.current = setTimeout(stopListening, 10000);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    clearTimeout(timeoutRef.current);
    setCountdown(0);
    setIsProcessing(false);
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    console.log("Browser not sopport speech recognization!");
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
        if (rect.width < 10 || rect.height < 10) return null;

        return (
          <>
            {/* Mic Button */}
            <button
              ref={micRef}
              onClick={toggleListening}
              style={{
                position: "absolute",
                top: micPosition.top - 55 + "px",
                left: micPosition.left - 255 + "px",
                zIndex: 9999,
                backgroundColor: isProcessing ? "#ffc107" : listening ? "#28a745" : "#007bff",
                color: "#fff",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                boxShadow: listening ? "0 0 15px rgba(40, 167, 69, 0.6)" : "0 2px 6px rgba(0,0,0,0.3)",
                cursor: "pointer",
                userSelect: "none",
                border: 'none',
                transform: listening ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                animation: listening ? 'pulse 1.5s infinite' : 'none'
              }}
              title={listening ? `Listening live... (${countdown}s)` : 'Click for live voice input'}
            >
              🎤
            </button>

            {/* Live Processing Indicator */}
            {/* {listening && transcript && (
              <div
                style={{
                  position: "absolute",
                  top: micPosition.top - 35 + "px",
                  left: micPosition.left - 40 + "px",
                  zIndex: 10000,
                  backgroundColor: 'rgba(40, 167, 69, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                🎙️ Live: "{transcript.slice(-20)}..."
              </div>
            )} */}

            {/* Sound Wave Animation */}
            {listening && (
              <div
                style={{
                  position: "absolute",
                  top: micPosition.top - 68 + "px",
                  left: micPosition.left - 280 + "px",
                  zIndex: 9998,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      backgroundColor: '#28a745',
                      borderRadius: '1px',
                      animation: `wave${i} 0.8s ease-in-out infinite`,
                      height: '15px'
                    }}
                  />
                ))}
              </div>
            )}

            {/* CSS Animations */}
            <style jsx>{`
              @keyframes pulse {
                0%, 100% { 
                  box-shadow: 0 0 15px rgba(40, 167, 69, 0.6);
                  transform: scale(1.1);
                }
                50% { 
                  box-shadow: 0 0 25px rgba(40, 167, 69, 0.9);
                  transform: scale(1.15);
                }
              }
              
              @keyframes wave1 {
                0%, 100% { height: 8px; }
                50% { height: 18px; }
              }
              
              @keyframes wave2 {
                0%, 100% { height: 12px; }
                50% { height: 22px; }
              }
              
              @keyframes wave3 {
                0%, 100% { height: 10px; }
                50% { height: 20px; }
              }
              
              @keyframes wave4 {
                0%, 100% { height: 6px; }
                50% { height: 16px; }
              }
              
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </>
        );
      })()}
    </>
  );
};

export default SpeechRecognitionProvider;