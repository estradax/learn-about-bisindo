import type { HandLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

// Standard 21-point MediaPipe hand topology.
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

function drawHand(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[], width: number, height: number) {
  ctx.strokeStyle = "#5ee6a8";
  ctx.lineWidth = 2;
  for (const [a, b] of HAND_CONNECTIONS) {
    const p1 = landmarks[a];
    const p2 = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffb703";
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/** Draws MediaPipe hand landmarks/connections onto a canvas sized to match the source video frame. */
export function drawHandLandmarks(
  canvas: HTMLCanvasElement,
  handResult: HandLandmarkerResult | null,
  width: number,
  height: number,
) {
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  if (!handResult) return;
  for (const landmarks of handResult.landmarks) {
    drawHand(ctx, landmarks, width, height);
  }
}
