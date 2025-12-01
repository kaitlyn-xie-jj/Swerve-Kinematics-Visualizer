import React, { useMemo } from 'react';
import { RobotState, SwerveModule, Vector2 } from '../types';
import { degToRad, getRotationVector, addVectors, magnitude, radToDeg } from '../utils/math';
import { VectorArrow } from './VectorArrow';

interface SwerveCanvasProps {
  state: RobotState;
}

export const SwerveCanvas: React.FC<SwerveCanvasProps> = ({ state }) => {
  // Constants for visualization sizing
  const ROBOT_WIDTH = 160;
  const ROBOT_LENGTH = 220;
  const VIEWBOX_SIZE = 600;
  const CENTER = VIEWBOX_SIZE / 2;
  const VECTOR_SCALE = 60; // Scale factor to make vectors visible

  // Define modules relative to center (0,0)
  const modules: SwerveModule[] = useMemo(() => [
    { id: 'FL', position: { x: -ROBOT_WIDTH / 2, y: -ROBOT_LENGTH / 2 } }, // Front Left
    { id: 'FR', position: { x: ROBOT_WIDTH / 2, y: -ROBOT_LENGTH / 2 } },  // Front Right
    { id: 'BL', position: { x: -ROBOT_WIDTH / 2, y: ROBOT_LENGTH / 2 } },  // Back Left
    { id: 'BR', position: { x: ROBOT_WIDTH / 2, y: ROBOT_LENGTH / 2 } },   // Back Right
  ], []);

  // Calculate chassis vectors
  // Standard Math: 0 is Right (positive X), 90 is Down (positive Y in SVG).
  // We offset user input (-90) so 0 degrees on the slider feels like "Up/Forward".
  const chassisTranslation: Vector2 = {
    x: state.translationSpeed * Math.cos(degToRad(state.translationAngle - 90)),
    y: state.translationSpeed * Math.sin(degToRad(state.translationAngle - 90)),
  };

  // Helper to map robot coords to SVG coords (centered)
  const toSvgCoords = (v: Vector2) => ({
    x: CENTER + v.x,
    y: CENTER + v.y,
  });

  return (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden">
      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="w-full h-full max-w-[600px] max-h-[600px]"
      >
        {/* Grid Background */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Legend */}
        <g transform="translate(20, 20)">
           <rect width="140" height="85" fill="white" fillOpacity="0.8" rx="4" stroke="#e2e8f0" />
           <text x="10" y="20" fontSize="10" fontWeight="bold" fill="#64748b">LEGEND</text>
           
           <line x1="10" y1="35" x2="30" y2="35" stroke="#3b82f6" strokeWidth="2" />
           <text x="35" y="38" fontSize="10" fill="#334155">Translation</text>
           
           <line x1="10" y1="55" x2="30" y2="55" stroke="#10b981" strokeWidth="2" />
           <text x="35" y="58" fontSize="10" fill="#334155">Rotation</text>
           
           <line x1="10" y1="75" x2="30" y2="75" stroke="#ef4444" strokeWidth="2" />
           <text x="35" y="78" fontSize="10" fill="#334155">Resultant (Wheel)</text>
        </g>

        {/* Robot Body */}
        <rect
          x={CENTER - ROBOT_WIDTH / 2}
          y={CENTER - ROBOT_LENGTH / 2}
          width={ROBOT_WIDTH}
          height={ROBOT_LENGTH}
          rx="12"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="3"
        />

        {/* Chassis Center Visualization */}
        <circle cx={CENTER} cy={CENTER} r="4" fill="#64748b" />
        
        {/* Chassis Translation Vector (Blue) */}
        <VectorArrow
          start={{ x: CENTER, y: CENTER }}
          vector={chassisTranslation}
          scale={VECTOR_SCALE * 1.5}
          color="#3b82f6"
          width={4}
          label={state.translationSpeed > 0.1 ? "Chassis V" : ""}
        />

        {/* Chassis Rotation Indicator (Curved Arrow) - Only if rotating */}
        {Math.abs(state.rotationSpeed) > 0.05 && (
          <g transform={`translate(${CENTER}, ${CENTER})`}>
             <path
              d={state.rotationSpeed > 0 
                ? "M 30 -10 A 30 30 0 1 0 10 30" // Counter-Clockwise
                : "M 30 10 A 30 30 0 1 1 10 -30" // Clockwise
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeOpacity="0.6"
              markerEnd="url(#arrowhead)"
              transform={`rotate(${state.rotationSpeed * 20})`} // Slight animation spin? Or just static indicator
            />
            {/* Custom Marker for curved path */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" fillOpacity="0.6" />
              </marker>
            </defs>
            <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#10b981" fontWeight="bold">ω</text>
          </g>
        )}

        {/* Modules */}
        {modules.map((mod) => {
          const modCenter = toSvgCoords(mod.position);
          
          // 1. Translation Component
          const vTrans = chassisTranslation;

          // 2. Rotation Component
          // Tangent direction depends on position relative to center
          const vRot = getRotationVector(mod.position, state.rotationSpeed);

          // 3. Resultant
          const vResult = addVectors(vTrans, vRot);

          // Calculate angle for wheel graphic
          // Math.atan2 returns angle relative to X-axis (Right).
          // Our wheel graphic is drawn vertically (along Y-axis).
          // To align the vertical wheel with the vector, we must add 90 degrees.
          // Example: Vector (1,0) is 0 deg. Wheel needs to rotate 90 deg from vertical to be horizontal.
          const wheelAngleRad = Math.atan2(vResult.y, vResult.x);
          const wheelAngleDeg = radToDeg(wheelAngleRad) + 90;

          // Is the vector significant enough to show direction?
          const isMoving = magnitude(vResult) > 0.05;

          return (
            <g key={mod.id}>
              {/* Wheel Graphic */}
              <g transform={`translate(${modCenter.x}, ${modCenter.y}) rotate(${isMoving ? wheelAngleDeg : 0})`}>
                <rect
                  x="-10"
                  y="-18"
                  width="20"
                  height="36"
                  rx="4"
                  fill="#475569"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#64748b" strokeWidth="2" />
              </g>

              {/* Ghost vectors (Components) - Faint to not clutter */}
              <VectorArrow
                start={modCenter}
                vector={vTrans}
                scale={VECTOR_SCALE}
                color="#3b82f6"
                width={2}
                opacity={0.3}
              />
              <VectorArrow
                start={modCenter}
                vector={vRot}
                scale={VECTOR_SCALE} 
                color="#10b981"
                width={2}
                opacity={0.3}
              />

              {/* Resultant Vector (Red) */}
              <VectorArrow
                start={modCenter}
                vector={vResult}
                scale={VECTOR_SCALE}
                color="#ef4444"
                width={3}
                // Only label one to avoid clutter
                label={mod.id === 'FR' && isMoving ? 'V_wheel' : undefined}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};