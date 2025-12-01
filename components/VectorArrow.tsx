import React from 'react';
import { Vector2 } from '../types';
import { magnitude, radToDeg } from '../utils/math';

interface VectorArrowProps {
  start: Vector2;
  vector: Vector2;
  color: string;
  label?: string;
  scale?: number;
  width?: number;
  opacity?: number;
}

export const VectorArrow: React.FC<VectorArrowProps> = ({ 
  start, 
  vector, 
  color, 
  label, 
  scale = 1, 
  width = 2,
  opacity = 1
}) => {
  const len = magnitude(vector);
  
  if (len < 0.01) return null;

  const end = {
    x: start.x + vector.x * scale,
    y: start.y + vector.y * scale,
  };

  // Calculate arrow head
  const arrowHeadSize = Math.min(10, len * scale * 0.3);
  const angle = Math.atan2(vector.y, vector.x);
  
  // Arrow head points
  const p1 = {
    x: end.x - arrowHeadSize * Math.cos(angle - Math.PI / 6),
    y: end.y - arrowHeadSize * Math.sin(angle - Math.PI / 6),
  };
  const p2 = {
    x: end.x - arrowHeadSize * Math.cos(angle + Math.PI / 6),
    y: end.y - arrowHeadSize * Math.sin(angle + Math.PI / 6),
  };

  return (
    <g style={{ opacity }}>
      {/* Main Shaft */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      {/* Arrow Head */}
      <path
        d={`M ${end.x} ${end.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`}
        fill={color}
      />
      {/* Label */}
      {label && len > 0.5 && (
        <text
          x={end.x + (vector.x > 0 ? 10 : -10)}
          y={end.y + (vector.y > 0 ? 15 : -15)}
          fill={color}
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          className="select-none pointer-events-none"
        >
          {label}
        </text>
      )}
    </g>
  );
};