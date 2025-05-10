import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceFilter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Load models
  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'; // path to the models in public folder
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL); // Load face detection model
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL); // Load face landmark model
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL); // Load face recognition model
      await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL); // Load age/gender model (optional)

      setModelsLoaded(true); // Indicate that models are loaded
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
    }
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
        try {
          const detections = await faceapi.detectAllFaces(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptors();

          console.log('Detections:', detections); // Log detections to verify

          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw face detection and landmarks
          faceapi.draw.drawDetections(canvas, detections);
          faceapi.draw.drawFaceLandmarks(canvas, detections);

          // Apply filter to detected faces
          detections.forEach(detection => {
            const { alignedRect } = detection;
            const { _x, _y, _width, _height } = alignedRect._box;
            if (selectedFilter) {
              applyFilter(_x, _y, _width, _height, selectedFilter);
            }
          });
        } catch (error) {
          console.error('Error during face detection or filter application:', error);
        }
      }
    }, 100);
  };

  // Apply filter on the detected face
  const applyFilter = (x, y, width, height, filter) => {
    const filterImage = new Image();
    filterImage.src = `/path/to/${filter}.png`; // Update with path to your filter images

    filterImage.onload = () => {
      console.log('Applying filter:', filter); // Log filter application
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const scaleFactor = width / filterImage.width;

      ctx.drawImage(filterImage, x, y + height / 4, filterImage.width * scaleFactor, filterImage.height * scaleFactor);
    };

    filterImage.onerror = () => {
      console.error('Error loading filter image:', filterImage.src);
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

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }, [modelsLoaded]);

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay muted />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setSelectedFilter('glasses')}>Glasses</button>
        <button onClick={() => setSelectedFilter('hat')}>Hat</button>
        <button onClick={() => setSelectedFilter(null)}>None</button>
      </div>
    </div>
  );
};

export default FaceFilter;
