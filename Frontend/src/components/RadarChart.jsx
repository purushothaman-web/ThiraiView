import React from 'react';

const RadarChart = ({ data, size = 300 }) => {
  // data = { action: 0.9, emotion: 0.2, ... }
  const keys = Object.keys(data);
  const values = Object.values(data);
  const count = keys.length;
  const radius = size / 2 - 40; // padding
  const center = size / 2;

  // Helper to calculate coordinates
  const getCoordinates = (value, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const x = center + Math.cos(angle) * radius * value;
    const y = center + Math.sin(angle) * radius * value;
    return { x, y };
  };

  // Generate polygon points
  const points = values.map((v, i) => {
    const { x, y } = getCoordinates(v, i);
    return `${x},${y}`;
  }).join(' ');

  // Background polygons (grid)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative flex justify-center items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid */}
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={values.map((_, i) => {
              const { x, y } = getCoordinates(level, i);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#333"
            strokeWidth="1"
            className="opacity-50"
          />
        ))}

        {/* Axes */}
        {keys.map((key, i) => {
          const { x, y } = getCoordinates(1.1, i); // Labels slightly outside
          const start = getCoordinates(0, i);
          const end = getCoordinates(1, i);
          return (
            <g key={key}>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#333" strokeWidth="1" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#888"
                fontSize="12"
                fontWeight="bold"
                className="uppercase tracking-wider"
              >
                {key}
              </text>
            </g>
          );
        })}

        {/* Data Polygon */}
        <polygon
          points={points}
          fill="rgba(255, 215, 0, 0.2)"
          stroke="#FFD700"
          strokeWidth="2"
          className="drop-shadow-lg filter"
        >
          <animate attributeName="points" dur="1s" repeatCount="1" from={values.map((_, i) => {
             const { x, y } = getCoordinates(0, i);
             return `${x},${y}`;
          }).join(' ')} to={points} />
        </polygon>

        {/* Data Points */}
        {values.map((v, i) => {
          const { x, y } = getCoordinates(v, i);
          return (
             <circle key={i} cx={x} cy={y} r="4" fill="#FFD700" className="animate-pulse" />
          );
        })}
      </svg>
    </div>
  );
};

export default RadarChart;
