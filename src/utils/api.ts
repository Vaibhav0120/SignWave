import * as tf from "@tensorflow/tfjs";

let model: tf.GraphModel | null = null;

export const loadModel = async (): Promise<void> => {
  if (!model) {
    model = await tf.loadGraphModel("/model/model.json");
  }
};

export const predictSign = async (
  imageData: ImageData
): Promise<{ prediction: string; handDetected: boolean }> => {
  if (!model) {
    throw new Error("Model not loaded");
  }

  const img = tf.browser.fromPixels(imageData);
  const resized = tf.image.resizeBilinear(img, [640, 480]);
  const casted = resized.cast("int32");
  const expanded = casted.expandDims(0);
  const obj = await model.executeAsync(expanded);

  tf.dispose(img);
  tf.dispose(resized);
  tf.dispose(casted);
  tf.dispose(expanded);

  if (Array.isArray(obj)) {
    const boxes = await obj[1].array();
    const classes = await obj[2].array();
    const scores = await obj[4].array();

    tf.dispose(obj);

    if (scores[0][0] > 0.8) {
      const labelMap: { [key: number]: string } = {
        1: "Hello",
        2: "Thank You",
        3: "I Love You",
        4: "Yes",
        5: "No",
      };
      const prediction = labelMap[classes[0][0]] || "Unknown";
      return { prediction, handDetected: true };
    }
  }

  return { prediction: "", handDetected: false };
};
