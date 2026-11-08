import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateModuleVelocity,
  magnitude,
  addVectors,
  formatAngle,
  degToRad,
  radToDeg,
} from '../utils/math.ts';

test('pure translation gives each module the chassis velocity', () => {
  assert.deepEqual(calculateModuleVelocity(1, -0.5, 0, 0.25, -0.25), { x: 1, y: -0.5 });
});

test('positive yaw rotates a front-left wheel toward robot left', () => {
  assert.deepEqual(calculateModuleVelocity(0, 0, 1, 0.25, 0.25), { x: -0.25, y: 0.25 });
});

test('translation and rotation combine by vector addition', () => {
  assert.deepEqual(calculateModuleVelocity(0.5, -0.25, 2, -0.25, 0.25), { x: 0, y: -0.75 });
});

test('vector helpers preserve magnitude and signed components', () => {
  assert.equal(magnitude({ x: 3, y: 4 }), 5);
  assert.deepEqual(addVectors({ x: 1, y: -2 }, { x: 2, y: 3 }), { x: 3, y: 1 });
});

test('angle conversion and wrapping match robot-frame convention', () => {
  assert.equal(formatAngle(190), -170);
  assert.equal(formatAngle(-190), 170);
  assert.equal(formatAngle(-180), 180);
  assert.ok(Math.abs(degToRad(180) - Math.PI) < 1e-12);
  assert.equal(radToDeg(Math.PI), 180);
});
