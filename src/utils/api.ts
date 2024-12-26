import * as tf from '@tensorflow/tfjs';

let model: tf.GraphModel | null = null;

export const loadModel = async (): Promise<void> => {
  try {
    if (!model) {
      console.log('Loading model...');
      model = await tf.loadGraphModel('/model/model.json');
      console.log('Model loaded successfully');
    }
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

interface PredictionResult {
  boxes: number[][];
  scores: number[];
  classes: string[];
  prediction: string;
}

export const predictSign = async (imageData: ImageData): Promise<PredictionResult> => {
  if (!model) {
    console.error('Model not loaded');
    throw new Error('Model not loaded');
  }

  let tensor: tf.Tensor | null = null;
  let result: tf.Tensor[] | null = null;

  try {
    // Convert ImageData to tensor and preprocess
    tensor = tf.tidy(() => {
      const img = tf.browser.fromPixels(imageData);
      
      // Resize the image to 320x320 (model's expected input size)
      const resized = tf.image.resizeBilinear(img, [320, 320]);
      
      // Normalize the image to 0-255 range and convert to int32
      const normalized = tf.cast(resized, 'int32');
      
      // Add batch dimension
      return normalized.expandDims(0);
    });

    result = await model.executeAsync(tensor) as tf.Tensor[];

    // Process results
    const boxes = await result[1].array() as number[][][];
    const scores = await result[2].array() as number[][];
    const classes = await result[3].array() as number[][];

    const labelMap: { [key: number]: string } = {
      1: 'Hello',
      2: 'Thank You',
      3: 'I Love You',
      4: 'Yes',
      5: 'No',
    };

    const processedClasses = classes[0].map(classId => labelMap[Math.round(classId)] || "Unknown");
    
    let prediction = '';
    const highestScoreIndex = scores[0].indexOf(Math.max(...scores[0]));
    if (scores[0][highestScoreIndex] > 0.5) {
      prediction = processedClasses[highestScoreIndex];
    }

    return { 
      boxes: boxes[0], 
      scores: scores[0], 
      classes: processedClasses,
      prediction
    };
  } catch (error) {
    console.error('Error during prediction:', error);
    throw error;
  } finally {
    // Clean up tensors
    if (tensor) tf.dispose(tensor);
    if (result) tf.dispose(result);
  }
};

export const getModelInfo = (): string => {
  if (!model) {
    return 'Model not loaded';
  }
  return `Model loaded: Input shape: ${model.inputs[0].shape}, Output shape: ${model.outputs[0].shape}`;
};

