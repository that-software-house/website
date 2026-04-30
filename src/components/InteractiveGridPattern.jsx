import { useMemo, useState } from "react";

export default function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [48, 32],
  className = "",
}) {
  const [hoveredSquare, setHoveredSquare] = useState(null);
  const [horizontal, vertical] = squares;

  const cells = useMemo(() => {
    return Array.from({ length: horizontal * vertical }, (_, index) => {
      const x = (index % horizontal) * width;
      const y = Math.floor(index / horizontal) * height;

      return { index, x, y };
    });
  }, [horizontal, vertical, width, height]);

  return (
    <svg
      className={`interactive-grid ${className}`.trim()}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width * horizontal} ${height * vertical}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {cells.map(({ index, x, y }) => (
        <rect
          key={index}
          x={x}
          y={y}
          width={width}
          height={height}
          className={`interactive-grid__cell ${
            hoveredSquare === index ? "is-active" : ""
          }`.trim()}
          onMouseEnter={() => setHoveredSquare(index)}
          onMouseLeave={() => setHoveredSquare(null)}
        />
      ))}
    </svg>
  );
}
