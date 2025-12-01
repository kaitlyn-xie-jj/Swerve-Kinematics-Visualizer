import React, { useMemo } from 'react';
import { RobotState, SwerveModule, Vector2 } from '../types';
import { calculateModuleVelocity, magnitude, radToDeg, formatAngle } from '../utils/math';
import { VectorArrow } from './VectorArrow';

interface SwerveCanvasProps {
  state: RobotState;
}

export const SwerveCanvas: React.FC<SwerveCanvasProps> = ({ state }) => {
  // CONFIGURATION
  const VIEWBOX_SIZE = 600;
  const CENTER = VIEWBOX_SIZE / 2;
  
  // Physical constants (MKS units roughly)
  // We define the robot as being 0.5 meters x 0.5 meters
  // This ensures the radius is small (~0.35m) so omega*r is comparable to v (0-1 range)
  const ROBOT_WIDTH_METERS = 0.5;
  const ROBOT_LENGTH_METERS = 0.5;
  
  // Visualization Scales
  const METERS_TO_PX = 400; // 1 meter = 400 pixels on screen
  const VELOCITY_SCALE_FACTOR = 0.8; // Scale arrow length to look good

  // Define modules in Robot Frame (Meters)
  // Frame: X+ Forward, Y+ Left
  const modules: SwerveModule[] = useMemo(() => [
    { id: 'FL', label: 'Front-Left',  position: { x: ROBOT_LENGTH_METERS / 2, y: ROBOT_WIDTH_METERS / 2 } },
    { id: 'FR', label: 'Front-Right', position: { x: ROBOT_LENGTH_METERS / 2, y: -ROBOT_WIDTH_METERS / 2 } },
    { id: 'RL', label: 'Rear-Left',   position: { x: -ROBOT_LENGTH_METERS / 2, y: ROBOT_WIDTH_METERS / 2 } },
    { id: 'RR', label: 'Rear-Right',  position: { x: -ROBOT_LENGTH_METERS / 2, y: -ROBOT_WIDTH_METERS / 2 } },
  ], []);

  /**
   * Coordinate Transform: Robot Frame (Meters) -> Screen Frame (Pixels)
   * Robot: X+ Up, Y+ Left
   * Screen (SVG): X+ Right, Y+ Down
   */
  const robotToScreen = (v: Vector2): Vector2 => ({
    x: CENTER - (v.y * METERS_TO_PX),
    y: CENTER - (v.x * METERS_TO_PX),
  });

  /**
   * Vector Transform: Robot Vector -> Screen Vector
   * Used for arrows.
   * Vx (Forward) -> -Vy (Up)
   * Vy (Left) -> -Vx (Left)
   */
  const vectorToScreen = (v: Vector2): Vector2 => ({
    x: -v.y,
    y: -v.x,
  });

  // Chassis Velocity Vector
  const chassisVelocityRobot = { x: state.vx, y: state.vy };
  const chassisVelocityScreen = vectorToScreen(chassisVelocityRobot);
  const chassisSpeed = magnitude(chassisVelocityRobot);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden relative">
      {/* Overlay info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded border border-slate-200 shadow-sm text-xs z-10">
        <div className="font-bold text-slate-700 mb-1">ROBOT FRAME (NWU)</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
          <span>+X (Forward)</span> <span className="text-right">Screen Up</span>
          <span>+Y (Left)</span> <span className="text-right">Screen Left</span>
          <span>+ω (CCW)</span> <span className="text-right">Counter-Clockwise</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="w-full h-full max-w-[600px] max-h-[600px]"
      >
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Legend */}
        <g transform={`translate(${VIEWBOX_SIZE - 140}, ${VIEWBOX_SIZE - 110})`}>
           <rect width="120" height="90" fill="white" fillOpacity="0.9" rx="4" stroke="#e2e8f0" />
           <text x="10" y="20" fontSize="10" fontWeight="bold" fill="#64748b">LEGEND</text>
           <line x1="10" y1="40" x2="30" y2="40" stroke="#3b82f6" strokeWidth="3" />
           <text x="36" y="43" fontSize="10" fill="#334155">Chassis V</text>
           <line x1="10" y1="80" x2="30" y2="80" stroke="#ef4444" strokeWidth="3" />
           <text x="36" y="83" fontSize="10" fill="#334155">Wheel V</text>
        </g>

        {/* Robot Chassis */}
        <rect
          x={CENTER - (ROBOT_WIDTH_METERS * METERS_TO_PX) / 2}
          y={CENTER - (ROBOT_LENGTH_METERS * METERS_TO_PX) / 2}
          width={ROBOT_WIDTH_METERS * METERS_TO_PX}
          height={ROBOT_LENGTH_METERS * METERS_TO_PX}
          rx="12"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="3"
        />
        
        {/* Chassis Center Axis */}
        <g transform={`translate(${CENTER}, ${CENTER})`} opacity="0.4">
          <line x1="0" y1="0" x2="0" y2="-40" stroke="#0f172a" strokeWidth="1" />
          <text x="-5" y="-45" fontSize="10" textAnchor="middle">+X</text>
          <line x1="0" y1="0" x2="-40" y2="0" stroke="#0f172a" strokeWidth="1" />
          <text x="-45" y="4" fontSize="10" textAnchor="end">+Y</text>
        </g>

        {/* Chassis Velocity Vector (Blue) */}
        {chassisSpeed > 0.05 && (
          <VectorArrow
            start={{ x: CENTER, y: CENTER }}
            vector={chassisVelocityScreen}
            scale={METERS_TO_PX * VELOCITY_SCALE_FACTOR}
            color="#3b82f6"
            width={5}
            label="V_robot"
            opacity={0.5}
          />
        )}

        {/* Rotation Indicator (Green Arc) */}
        {Math.abs(state.omega) > 0.05 && (
          <g transform={`translate(${CENTER}, ${CENTER})`}>
             <path
              d={state.omega > 0 
                ? "M 50 -20 A 50 50 0 1 0 20 50" // CCW
                : "M 50 20 A 50 50 0 1 1 20 -50" // CW
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeOpacity="0.4"
              strokeLinecap="round"
              markerEnd="url(#arrowheadGreen)"
            />
            <defs>
              <marker id="arrowheadGreen" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" fillOpacity="0.4" />
              </marker>
            </defs>
          </g>
        )}

        {/* SWERVE MODULES */}
        {modules.map((mod) => {
          // 1. Position on Screen
          const modScreenPos = robotToScreen(mod.position);

          // 2. Physics: Wheel Velocity in Robot Frame
          const vWheelRobot = calculateModuleVelocity(
             state.vx, 
             state.vy, 
             state.omega, 
             mod.position.x, 
             mod.position.y
          );

          // 3. Visualization: Vector on Screen
          const vWheelScreen = vectorToScreen(vWheelRobot);
          const speed = magnitude(vWheelRobot);
          
          // 4. Angle Calculation
          // atan2(y, x) in robot frame gives angle from X-axis (Forward)
          // But our atan2 args are based on standard math (Y is vertical in math, but Left in Robot).
          // Robot Frame: X=Forward, Y=Left.
          // Angle 0 is Forward (+X).
          // Angle 90 is Left (+Y).
          // atan2(vy, vx) gives standard math angle.
          const angleRad = Math.atan2(vWheelRobot.y, vWheelRobot.x);
          const angleDeg = radToDeg(angleRad); // 0 is Forward, 90 is Left.
          
          // 5. Wheel Graphic Rotation
          // If Angle=0 (Forward), VectorScreen=(0, -1) [Up].
          // We want wheel vertical.
          // SVG Rotation 0 is Right.
          // -90 is Up.
          // So SVG Rotation = -angleDeg (Standard math CCW) - 90?
          // Let's rely on screen vector directly:
          const screenAngleRad = Math.atan2(vWheelScreen.y, vWheelScreen.x);
          const screenAngleDeg = radToDeg(screenAngleRad); 
          // screenAngleDeg: 0 is Right, -90 is Up.
          // Wheel Graphic: Vertical Rect.
          // To point Up (-90), rotate 0.
          // To point Right (0), rotate 90.
          // To point Left (180), rotate 90.
          const wheelGraphicRotation = screenAngleDeg + 90;

          return (
            <g key={mod.id}>
              {/* Wheel Graphic */}
              <g transform={`translate(${modScreenPos.x}, ${modScreenPos.y}) rotate(${speed > 0.05 ? wheelGraphicRotation : 0})`}>
                {/* Tire */}
                <rect
                  x="-8"
                  y="-16"
                  width="16"
                  height="32"
                  rx="4"
                  fill="#475569"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#94a3b8" strokeWidth="2" />
              </g>

              {/* Module Label */}
              <text 
                x={modScreenPos.x + (mod.position.y > 0 ? 30 : -30)} 
                y={modScreenPos.y + (mod.position.x > 0 ? -30 : 30)} 
                textAnchor="middle" 
                fontSize="11" 
                fill="#64748b"
                fontWeight="bold"
              >
                {mod.id}
              </text>
              
              {/* Data Readout */}
              <g transform={`translate(${modScreenPos.x + (mod.position.y > 0 ? 30 : -30)}, ${modScreenPos.y + (mod.position.x > 0 ? -15 : 45)})`}>
                 <text textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-mono">
                    {speed.toFixed(2)} m/s
                 </text>
                 <text y="10" textAnchor="middle" fontSize="9" fill="#94a3b8" className="font-mono">
                    {formatAngle(angleDeg).toFixed(0)}°
                 </text>
              </g>

              {/* Resultant Vector (Red) */}
              <VectorArrow
                start={modScreenPos}
                vector={vWheelScreen}
                scale={METERS_TO_PX * VELOCITY_SCALE_FACTOR}
                color="#ef4444"
                width={3}
              />
            </g>
          );
        })}

        {/* Center Pivot */}
        <circle cx={CENTER} cy={CENTER} r="4" fill="#0f172a" />
      </svg>
    </div>
  );
};