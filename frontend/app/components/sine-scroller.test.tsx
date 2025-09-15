import { render, screen } from "@testing-library/react";
import { SineScroller } from "./sine-scroller";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock HTMLCanvasElement and getContext for testing
const mockGetContext = vi.fn(() => ({
  scale: vi.fn(),
  fillStyle: "",
  fillRect: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillText: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  shadowColor: "",
  shadowBlur: 0,
  font: "",
  textAlign: "",
  textBaseline: ""
}));

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

// Mock requestAnimationFrame for testing
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

describe("SineScroller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a canvas element", () => {
    const { container } = render(<SineScroller text="Test Text" />);
    
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas?.tagName).toBe("CANVAS");
  });

  it("applies custom className", () => {
    const { container } = render(<SineScroller text="Test Text" className="custom-class" />);
    
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveClass("custom-class");
  });

  it("initializes canvas context", () => {
    render(<SineScroller text="Test Text" />);
    
    expect(mockGetContext).toHaveBeenCalledWith("2d");
  });
});