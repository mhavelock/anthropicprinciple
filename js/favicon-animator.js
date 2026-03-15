/**
 * Favicon Animator Module
 * ========================
 * Continuously animates the favicon by drawing a square outline
 * frame-by-frame on a canvas, looping indefinitely.
 *
 * Stages (0-100% each cycle):
 * 0-25%:   Top edge (0,0) → (32,0)
 * 25-50%:  Right edge (32,0) → (32,32)
 * 50-75%:  Bottom edge (32,32) → (0,32)
 * 75-100%: Left edge (0,32) → (0,0)
 */

const FaviconAnimator = (() => {
  let canvas = null;
  let context = null;
  let favicon = null;

  let animationProgress = 0;

  const CANVAS_SIZE = 32;
  const ANIMATION_DURATION = 100;
  const ANIMATION_SPEED = 60; // ms per frame
  const GRADIENT_START_COLOR = "#c7f0fe";
  const GRADIENT_END_COLOR = "#56d3c9";

  const setupCanvas = () => {
    if (!canvas) return false;
    context = canvas.getContext("2d");
    if (!context) return false;

    const gradient = context.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gradient.addColorStop(0, GRADIENT_START_COLOR);
    gradient.addColorStop(1, GRADIENT_END_COLOR);
    context.strokeStyle = gradient;
    context.lineWidth = 16;

    return true;
  };

  const animateFrame = () => {
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.beginPath();

    if (animationProgress <= 25) {
      const w = (CANVAS_SIZE / 25) * animationProgress;
      context.moveTo(0, 0);
      context.lineTo(w, 0);
    } else if (animationProgress <= 50) {
      context.moveTo(0, 0);
      context.lineTo(CANVAS_SIZE, 0);
      const h = (CANVAS_SIZE / 25) * (animationProgress - 25);
      context.moveTo(CANVAS_SIZE, 0);
      context.lineTo(CANVAS_SIZE, h);
    } else if (animationProgress <= 75) {
      context.moveTo(0, 0);
      context.lineTo(CANVAS_SIZE, 0);
      context.moveTo(CANVAS_SIZE, 0);
      context.lineTo(CANVAS_SIZE, CANVAS_SIZE);
      const w = -((CANVAS_SIZE / 25) * (animationProgress - 75));
      context.moveTo(CANVAS_SIZE, CANVAS_SIZE);
      context.lineTo(w, CANVAS_SIZE);
    } else {
      context.moveTo(0, 0);
      context.lineTo(CANVAS_SIZE, 0);
      context.moveTo(CANVAS_SIZE, 0);
      context.lineTo(CANVAS_SIZE, CANVAS_SIZE);
      context.moveTo(CANVAS_SIZE, CANVAS_SIZE);
      context.lineTo(0, CANVAS_SIZE);
      const h = -((CANVAS_SIZE / 25) * (animationProgress - ANIMATION_DURATION));
      context.moveTo(0, CANVAS_SIZE);
      context.lineTo(0, h);
    }

    context.stroke();
    favicon.href = canvas.toDataURL("image/png");

    animationProgress = animationProgress >= ANIMATION_DURATION ? 0 : animationProgress + 1;
  };

  const init = () => {
    favicon = document.querySelector('link[rel*="icon"]');

    if (!favicon) {
      console.error("FaviconAnimator: favicon link element not found");
      return false;
    }

    canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    if (!setupCanvas()) return false;

    setInterval(animateFrame, ANIMATION_SPEED);
    return true;
  };

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => FaviconAnimator.init());
