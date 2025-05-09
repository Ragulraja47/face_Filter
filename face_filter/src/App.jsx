import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [filters, setFilters] = useState({
    sunglasses: false,
    mustache: false,
    clownNose: false,
    pixelate: false,
    rainbow: false,
  });

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    };
    loadModels();
  }, []);

  const handleFilterToggle = (filter) => {
    setFilters((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const drawFilters = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      const { box, landmarks } = detection;
      const { x, y, width, height } = box;

      if (filters.sunglasses) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y + height * 0.2, width, height * 0.1);
      }

      if (filters.mustache) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x + width * 0.2, y + height * 0.5, width * 0.6, height * 0.1);
      }

      if (filters.clownNose) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height * 0.3, width * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (filters.pixelate) {
        const pixelSize = 10;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          webcamRef.current.video,
          x, y, width, height,
          x, y, width / pixelSize, height / pixelSize
        );
        ctx.drawImage(
          canvas,
          x, y, width / pixelSize, height / pixelSize,
          x, y, width, height
        );
      }

      if (filters.rainbow) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.2, 'orange');
        gradient.addColorStop(0.4, 'yellow');
        gradient.addColorStop(0.6, 'green');
        gradient.addColorStop(0.8, 'blue');
        gradient.addColorStop(1, 'purple');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
      }
    });
  };

  useEffect(() => {
    const detectFaces = async () => {
      if (webcamRef.current && webcamRef.current.video) {
        const detections = await faceapi.detectAllFaces(
          webcamRef.current.video,
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        drawFilters(detections);
      }
      requestAnimationFrame(detectFaces);
    };
    detectFaces();
  }, [filters]);

  return (
    <div>
      <h1>Face Filter App</h1>
      <Webcam ref={webcamRef} />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div>
        <button onClick={() => handleFilterToggle('sunglasses')}>Sunglasses</button>
        <button onClick={() => handleFilterToggle('mustache')}>Mustache</button>
        <button onClick={() => handleFilterToggle('clownNose')}>Clown Nose</button>
        <button onClick={() => handleFilterToggle('pixelate')}>Pixelate</button>
        <button onClick={() => handleFilterToggle('rainbow')}>Rainbow</button>
      </div>
    </div>
  );
};

export default App;
