import { Vector2 } from '../types';

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

export const rotateVector = (v: Vector2, angleRad: number): Vector2 => ({
  x: v.x * Math.cos(angleRad) - v.y * Math.sin(angleRad),
  y: v.x * Math.sin(angleRad) + v.y * Math.cos(angleRad),
});

export const addVectors = (v1: Vector2, v2: Vector2): Vector2 => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});

export const magnitude = (v: Vector2): number => Math.sqrt(v.x * v.x + v.y * v.y);

// Calculate the tangential velocity vector for a point rotating around (0,0)
// Positive omega is visual Counter-Clockwise
// In SVG coords (Y is Down):
// Top-Right (x>0, y<0) moving CCW goes Top-Left (-x, -y direction)
export const getRotationVector = (position: Vector2, omega: number): Vector2 => {
  // To rotate CCW in SVG (Right-Hand Rule with Z into screen? or just visual CCW):
  // Vector (1,0) [Right] should go to (0,-1) [Up].
  // x' = y * omega
  // y' = -x * omega
  return {
    x: position.y * omega,
    y: -position.x * omega,
  };
};