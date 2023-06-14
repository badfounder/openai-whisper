// TranscriptionPage.js

import React, { useState, useRe ,useEffect } from "react";

const TranscriptionPage = () => {
  const [file, setFile] = useState(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("tiny.en");
  const [task, setTask] = useState("transcribe");
  // Add this line
const [progress, setProgress] = useState(0);

  const [language, setLanguage] = useState("en");



  const abortController = new AbortController();

// Add this useEffect hook
useEffect(() => {
  let interval;
  if (loading) {
    interval = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
    }, 500);
  } else {
    setProgress(0);
  }
  return () => clearInterval(interval);
}, [loading]);



  
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendData = async (file, options = {}, signal) => {
    let formData = new FormData();
    formData.append("file", file);
    formData.append("options", JSON.stringify(options));

    try {
      const resp = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
        signal: signal,
      });

      return await resp.json();
    } catch (err) {
      console.log(err);
    }
  };

  const onTranscribe = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setLoading(true);

    const response = await sendData(file, { model, language, task }, abortController.signal);

    if (response && response.transcribedText) {
      setTranscribedText(response.transcribedText);
    } else {
      alert("Failed to transcribe the file");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "50px" }}>
      <h1>Transcription Service</h1>
      <input type="file" accept="audio/*" onChange={onFileChange} />
      <div>
        <label>Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>
      </div>
      <button onClick={onTranscribe} disabled={loading}>
        Transcribe
      </button>
      <div>{loading && (
    <div>
        <p>Transcribing...</p>
        {/* Add these lines for the progress bar */}
        <div style={{ width: '100%', backgroundColor: '#ccc', marginTop: '10px' }}>
            <div style={{ width: `${progress}%`, height: '10px', backgroundColor: 'blue' }}></div>
        </div>
    </div>
)}
</div>
      {loading && <p>Transcribing...</p>}
      {transcribedText && (
        <div>
          <h2>Transcription Result:</h2>
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionPage;