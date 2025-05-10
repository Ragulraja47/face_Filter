import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceFilter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load models
  const loadModels = async () => {
    const MODEL_URL = '/models'; // path to the models in public folder
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Load face detection model
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL); // Load face landmark model
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL); // Load face recognition model
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL); // Load age/gender model (optional)

    setModelsLoaded(true); // Indicate that models are loaded
  };

  // Start video stream
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    videoRef.current.srcObject = stream;
  };

  // Handle face detection and apply filters
  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (videoRef.current && canvasRef.current && modelsLoaded) {
        const detections = await faceapi.detectAllFaces(videoRef.current)
          .withFaceLandmarks()
          .withFaceDescriptors();
        
        // Clear the previous drawings
        canvasRef.current?.clear();
        
        // Draw face detection and landmarks
        faceapi.draw.drawDetections(canvasRef.current, detections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, detections);
        
        // Apply filter to detected faces
        detections.forEach(detection => {
          const { alignedRect } = detection;
          const { _x, _y, _width, _height } = alignedRect._box;
          applyGlassesFilter(_x, _y, _width, _height);
        });
      }
    }, 100);
  };

  // Apply filter (glasses for example) on the detected face
  const applyGlassesFilter = (x, y, width, height) => {
    const glassesImage = new Image();
    glassesImage.src = '/path/to/glasses.png'; // Update with path to your filter image
    
    glassesImage.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const scaleFactor = width / glassesImage.width;
      
      ctx.drawImage(glassesImage, x, y + height / 4, glassesImage.width * scaleFactor, glassesImage.height * scaleFactor);
    };
  };

  useEffect(() => {
    loadModels();
    startVideo();

    return () => {
      // Cleanup when the component is unmounted
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onplay = handleVideoOnPlay;
    }
  }, [modelsLoaded]);

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay muted />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default FaceFilter;
