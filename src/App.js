import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./App.css";

const App = () => {
  const webcamRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  const startWebcam = () => {
    !isWebcamActive? setIsWebcamActive(true):setIsWebcamActive(false);
  };

  const startRecording = () => {
    
    setIsRecording(true);

    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    });
    mediaRecorderRef.current.start(1000);
  };

  const stopRecording = async () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    console.log("Recorded Chunks:", recordedChunks);

    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const file = new File([blob], "recording.webm", { type: "video/webm" });

    const formData = new FormData();
    formData.append("file", file);

    // Send file to the backend
    await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    setRecordedChunks([]); // Clear chunks after upload
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Webcam Recorder</h1>
      </header>
      <main className="app-main">
        
          {isWebcamActive &&<div className="webcam-container"> <Webcam audio={true} ref={webcamRef} /> </div>}
       
        <div className="controls-container">
          <button className="control-button start-webcam" onClick={startWebcam}>
            {!isWebcamActive?"Start Webcam":"Stop Webcam"}
          </button>
          <button
            className="control-button start-recording"
            onClick={startRecording}
            disabled={isRecording||!isWebcamActive}
          >
            Start Recording
          </button>
          <button
            className="control-button stop-recording"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
