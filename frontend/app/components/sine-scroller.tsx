import { useEffect, useRef } from "react";

interface SineScrollerProps {
  text: string;
  className?: string;
  speed?: number;
  amplitude?: number;
  frequency?: number;
}

export function SineScroller({ 
  text, 
  className = "", 
  speed = 2, 
  amplitude = 20, 
  frequency = 0.01 
}: SineScrollerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let scrollX = canvas.width;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Set font style for 80s look
    ctx.font = "bold 32px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const animate = () => {
      const canvasWidth = canvas.width / window.devicePixelRatio;
      const canvasHeight = canvas.height / window.devicePixelRatio;

      // Clear canvas with black background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Measure text width
      const textWidth = ctx.measureText(text).width;

      // Update scroll position
      scrollX -= speed;
      if (scrollX < -textWidth) {
        scrollX = canvasWidth;
      }

      // Draw each character with sine wave effect
      let charX = scrollX;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        
        // Calculate sine wave Y position
        const sineOffset = Math.sin((charX * frequency) + time) * amplitude;
        const charY = (canvasHeight / 2) + sineOffset;

        // Create gradient effect for 80s look
        const gradient = ctx.createLinearGradient(charX, charY - 20, charX, charY + 20);
        gradient.addColorStop(0, "#ff00ff"); // Magenta
        gradient.addColorStop(0.5, "#00ffff"); // Cyan
        gradient.addColorStop(1, "#ffff00"); // Yellow

        ctx.fillStyle = gradient;
        ctx.fillText(char, charX, charY);

        // Add glow effect
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.fillText(char, charX, charY);
        ctx.shadowBlur = 0;

        charX += charWidth;
      }

      time += 0.05;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, speed, amplitude, frequency]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-20 ${className}`}
      style={{ background: "#000000" }}
    />
  );
}