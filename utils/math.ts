import { Vector2 } from '../types';

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

export const magnitude = (v: Vector2): number => Math.sqrt(v.x * v.x + v.y * v.y);

export const addVectors = (v1: Vector2, v2: Vector2): Vector2 => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});

export const formatAngle = (deg: number): number => {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
};

/**
 * Calculates the velocity vector for a specific swerve module.
 * Coordinate System: Robot Frame (NWU - North West Up)
 * X+ Forward, Y+ Left, Z+ Up
 * 
 * Formula: V_wheel = V_robot + Omega x R
 * 
 * Result:
 * vx_wheel = vx_robot - omega * ry
 * vy_wheel = vy_robot + omega * rx
 */
export const calculateModuleVelocity = (
  vx: number, 
  vy: number, 
  omega: number, 
  moduleX: number, 
  moduleY: number
): Vector2 => {
  return {
    x: vx - omega * moduleY,
    y: vy + omega * moduleX
  };
};