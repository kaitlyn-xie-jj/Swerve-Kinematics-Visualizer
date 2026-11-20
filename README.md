# Swerve Drive Kinematics Visualizer

An interactive educational visualizer for a **four-module swerve-drive robot**. Move a virtual joystick and adjust chassis rotation to see how the translation and rotational velocity vectors combine at each wheel.

This is a browser-based teaching/demo tool, not a controller for physical hardware.

## What you can explore

- **Translation:** drag the joystick or use the keyboard-accessible Vx/Vy sliders to command forward/backward and left/right chassis velocity.
- **Rotation:** adjust the slider to add clockwise or counter-clockwise angular velocity; use **Reset all controls** to return every input to zero.
- **Wheel speed limit:** lower the maximum module speed and watch the four commanded wheel vectors desaturate uniformly, preserving their relative direction and ratios.
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

## New lesson: wheel speed desaturation

A swerve drivetrain cannot demand unlimited wheel speeds. If the fastest requested module velocity has magnitude `v_peak` and the allowed maximum is `v_max`, the visualizer computes:

```text
scale = min(1, v_max / v_peak)   (scale = 1 when v_peak is 0)
applied_wheel_velocity[i] = scale * requested_wheel_velocity[i]
```

**Try it:** set Vx = +1, Vy = +1, ω = +1, and lower the **Maximum wheel speed** slider. The "Requested peak" readout stays tied to the original request while the red arrows and module readings show the applied, limited speeds.

Because every module is multiplied by the **same** factor, steering directions and translation-to-rotation ratios are preserved. Clipping each wheel independently would generally distort the intended chassis motion. For simplicity, the teaching model uses normalized translation and angular controls with a nominal 0.5 m square chassis; it omits motor dynamics, steering transients, and real-world wheel calibration.

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
