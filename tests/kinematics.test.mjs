import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateModuleVelocity,
  magnitude,
  addVectors,
  formatAngle,
  degToRad,
  radToDeg,
  desaturateWheelVectors,
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

test('opposite modules have opposite velocities during pure yaw', () => {
  for (const omega of [-3, -0.5, 0, 0.5, 3]) {
    const a = calculateModuleVelocity(0, 0, omega, 0.4, 0.2);
    const b = calculateModuleVelocity(0, 0, omega, -0.4, -0.2);
    assert.ok(Math.abs(a.x + b.x) < 1e-12);
    assert.ok(Math.abs(a.y + b.y) < 1e-12);
    assert.ok(Math.abs(magnitude(a) - Math.abs(omega) * Math.hypot(0.4, 0.2)) < 1e-12);
    assert.ok(Math.abs(a.x * 0.4 + a.y * 0.2) < 1e-12);
  }
});

test('wheel desaturation uniformly limits peak without changing any wheel direction', () => {
  const inputs = [{ x: 3, y: 4 }, { x: -6, y: 8 }, { x: 0, y: 0 }];
  const result = desaturateWheelVectors(inputs, 5);
  assert.equal(result.requestedPeak, 10);
  assert.equal(result.scale, 0.5);
  assert.deepEqual(result.vectors, [{ x: 1.5, y: 2 }, { x: -3, y: 4 }, { x: 0, y: 0 }]);
  for (let i = 0; i < inputs.length; i++) {
    assert.ok(magnitude(result.vectors[i]) <= 5 + 1e-12);
    const cross = inputs[i].x * result.vectors[i].y - inputs[i].y * result.vectors[i].x;
    assert.ok(Math.abs(cross) < 1e-12);
  }
});

test('wheel desaturation leaves feasible requests unchanged and rejects invalid limits', () => {
  const inputs = [{ x: 0.3, y: 0.4 }, { x: -0.1, y: 0 }];
  const result = desaturateWheelVectors(inputs, 0.5);
  assert.equal(result.scale, 1);
  assert.deepEqual(result.vectors, inputs);
  assert.equal(desaturateWheelVectors([], 1).scale, 1);
  for (const limit of [0, -1, NaN, Infinity]) {
    assert.throws(() => desaturateWheelVectors(inputs, limit), RangeError);
  }
});

test('desaturation scales all translational and rotational wheel speeds consistently', () => {
  const corners = [[0.25, 0.25], [0.25, -0.25], [-0.25, 0.25], [-0.25, -0.25]];
  const raw = corners.map(([x, y]) => calculateModuleVelocity(1, 1, 1, x, y));
  const limited = desaturateWheelVectors(raw, 0.8);
  assert.ok(limited.scale < 1);
  for (let i = 0; i < corners.length; i++) {
    const [x, y] = corners[i];
    const expected = calculateModuleVelocity(limited.scale, limited.scale, limited.scale, x, y);
    assert.ok(Math.abs(limited.vectors[i].x - expected.x) < 1e-12);
    assert.ok(Math.abs(limited.vectors[i].y - expected.y) < 1e-12);
    assert.ok(magnitude(limited.vectors[i]) <= 0.8 + 1e-12);
  }
});
