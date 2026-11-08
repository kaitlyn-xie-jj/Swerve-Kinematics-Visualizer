# Swerve Drive Kinematics Visualizer

An interactive educational visualizer for a **four-module swerve-drive robot**. Move a virtual joystick and adjust chassis rotation to see how the translation and rotational velocity vectors combine at each wheel.

This is a browser-based teaching/demo tool, not a controller for physical hardware.

## What you can explore

- **Translation:** drag the joystick to command forward/backward and left/right chassis velocity.
- **Rotation:** adjust the slider to add clockwise or counter-clockwise angular velocity.
- **Each module:** inspect the resultant wheel velocity (red arrow), reported speed, and steering angle.
- **Coordinate convention:** robot-relative +X is forward, +Y is left; positive angular velocity is counter-clockwise.

The view uses a square 0.5 m × 0.5 m chassis with four modules at its corners. Inputs are normalized for an intuitive demo, so the displayed values should **not** be used as calibrated commands for a real drivetrain.

## Run locally

**Prerequisite:** Node.js with npm.

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite. To check the production build:

```bash
npm run build
npm run preview
```

To run the dependency-free kinematics unit tests, use **Node.js 22+**:

```bash
npm test
```

**No Gemini API key is required.** The app's source and `package.json` have no Gemini API integration. The page currently loads Tailwind CSS from a CDN, so an internet connection is useful for the intended styling.

## Kinematics

For each module at robot-frame position `(x, y)`, the visualizer computes the module velocity from chassis translation `(vx, vy)` and angular velocity `ω`:

```text
wheel_vx = vx - ω * y
wheel_vy = vy + ω * x
wheel_speed = sqrt(wheel_vx² + wheel_vy²)
wheel_angle = atan2(wheel_vy, wheel_vx)
```

The implementation is in [`utils/math.ts`](utils/math.ts), with controls in [`components/ControlPanel.tsx`](components/ControlPanel.tsx) and drawing in [`components/SwerveCanvas.tsx`](components/SwerveCanvas.tsx).

## Technology

React, TypeScript, and Vite. The project was originally prototyped in [Google AI Studio](https://ai.studio/apps/drive/1Y4jtRd6n_gGCYwCbpUVzcHCsMM7FZAHM).
