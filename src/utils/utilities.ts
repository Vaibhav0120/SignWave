export const drawRect = (
  ctx: CanvasRenderingContext2D,
  prediction: string
): void => {
  // Get canvas properties
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Clear previous drawings
  ctx.clearRect(0, 0, width, height);

  // Set styling
  ctx.strokeStyle = 'green';
  ctx.lineWidth = 2;
  ctx.font = '24px Arial';
  ctx.fillStyle = 'green';

  // Draw rectangle and text
  ctx.beginPath();
  ctx.fillText(prediction, 10, 30);
  ctx.rect(5, 5, width - 10, height - 10);
  ctx.stroke();
};

