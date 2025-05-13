
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow.js when the app loads
tf.ready().then(() => {
  console.log('TensorFlow.js initialized at startup');
}).catch(error => {
  console.error('Error initializing TensorFlow.js:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
