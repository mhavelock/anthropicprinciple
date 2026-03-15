/**
 * Main Application Entry Point
 * ==========================
 * Initializes all modules when the DOM is ready
 *
 * Why DOMContentLoaded instead of onload?
 * - DOMContentLoaded fires as soon as HTML is parsed (faster)
 * - onload waits for all images and resources to load (slower)
 * - We don't need to wait for images to initialize our JavaScript
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the favicon animator module
  const faviconInitialized = FaviconAnimator.init();

  if (!faviconInitialized) {
    console.warn("Favicon animator failed to initialize");
  }
});
