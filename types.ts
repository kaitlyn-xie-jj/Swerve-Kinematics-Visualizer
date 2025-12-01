export interface Vector2 {
  x: number;
  y: number;
}

export interface RobotState {
  vx: number;    // -1 to 1. Positive is Forward (Robot X+)
  vy: number;    // -1 to 1. Positive is Left (Robot Y+)
  omega: number; // -1 to 1. Positive is CCW
}

export interface SwerveModule {
  id: string;
  label: string;
  position: Vector2; // Robot Frame coordinates: X+ Forward, Y+ Left
}
