
import * as tf from '@tensorflow/tfjs';

/**
 * Loads a Keras model from the given URL
 * @param modelUrl URL to the model.json file
 * @returns Promise resolving to the loaded model
 */
export const loadModel = async (modelUrl: string): Promise<tf.LayersModel> => {
  try {
    // Load the model
    const model = await tf.loadLayersModel(modelUrl);
    console.log('Model loaded successfully:', model);
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

/**
 * Preprocesses an image for model input
 * @param imageElement Image element or URL
 * @param targetSize Target size [width, height] for the input
 * @returns Tensor ready for model prediction
 */
export const preprocessImage = async (
  imageElement: HTMLImageElement | string,
  targetSize: [number, number] = [224, 224]
): Promise<tf.Tensor> => {
  // Load the image
  let img: tf.Tensor3D;
  if (typeof imageElement === 'string') {
    // If it's a URL or data URL
    const image = new Image();
    image.src = imageElement;
    await new Promise(resolve => {
      image.onload = resolve;
    });
    img = tf.browser.fromPixels(image);
  } else {
    // If it's already an HTML element
    img = tf.browser.fromPixels(imageElement);
  }

  // Resize the image
  const resized = tf.image.resizeBilinear(img, targetSize);
  
  // Normalize pixel values to [0, 1]
  const normalized = resized.div(tf.scalar(255));
  
  // Expand dimensions to match model input shape [1, height, width, channels]
  const batched = normalized.expandDims(0);
  
  // Cleanup tensors to avoid memory leaks
  img.dispose();
  resized.dispose();
  normalized.dispose();
  
  return batched;
};

/**
 * Makes a prediction using the model
 * @param model TensorFlow.js model
 * @param input Preprocessed input tensor
 * @returns Prediction results
 */
export const predictImage = async (model: tf.LayersModel, input: tf.Tensor): Promise<any> => {
  try {
    // Run prediction
    const prediction = await model.predict(input) as tf.Tensor;
    
    // Get data from tensor
    const predictionData = await prediction.data();
    
    // Cleanup tensors
    prediction.dispose();
    input.dispose();
    
    return predictionData;
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
};

/**
 * Map prediction index to skin condition class name
 * @param predictions Array of prediction probabilities
 * @returns Object with class names and their probabilities
 */
export const mapPredictionsToClasses = (predictions: Float32Array | Int32Array | Uint8Array): Record<string, number> => {
  // These class names should be updated to match your actual model's output classes
  const classNames = [
    'Acne', 
    'Eczema',
    'Melanoma',
    'Psoriasis',
    'Rosacea',
    'Vitiligo',
    'Healthy Skin'
  ];
  
  const result: Record<string, number> = {};
  
  // Map each prediction to its class name
  for (let i = 0; i < predictions.length && i < classNames.length; i++) {
    result[classNames[i]] = Number(predictions[i].toFixed(4));
  }
  
  return result;
};
