export interface Vector2 {
  x: number;
  y: number;
}

export interface RobotState {
  translationSpeed: number; // 0 to 1 (or arbitrary units)
  translationAngle: number; // Degrees, 0 is Right (Standard math) or Up (Standard robot) -> Let's use 0 = Up/Forward for intuition
  rotationSpeed: number;    // -1 to 1 (omega)
}

export interface SwerveModule {
  id: string;
  position: Vector2; // Relative to robot center
}