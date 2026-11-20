import React, { useState } from 'react';
import { SwerveCanvas } from './components/SwerveCanvas';
import { ControlPanel } from './components/ControlPanel';
import { RobotState } from './types';

const App: React.FC = () => {
  // Initial state: Slight forward movement and rotation to show the spiral effect immediately
  const [robotState, setRobotState] = useState<RobotState>({
    vx: 0,
    vy: 0,
    omega: 0,
  });

  const [maxWheelSpeed, setMaxWheelSpeed] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M6 12H2"/><path d="m7.8 7.8-2.9-2.9"/><circle cx="12" cy="12" r="3"/></svg>
             </div>
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">Swerve Kinematics <span className="text-slate-400 font-normal">Visualizer</span></h1>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block bg-slate-100 px-3 py-1 rounded-full">
            Educational Demo
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Visualization Area - Takes up more space */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="aspect-square w-full max-h-[600px] mx-auto">
             <SwerveCanvas state={robotState} maxWheelSpeed={maxWheelSpeed} />
          </div>
          
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Core Concept
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              In a Swerve Drive, the robot's motion is the superposition of <strong>Translation</strong> (Chassis Velocity) and <strong>Rotation</strong> (Angular Velocity).
              <br/><br/>
              The applied velocity vector for each wheel (<span className="text-red-500 font-bold">Red</span>) is calculated by adding the robot's translation vector (<span className="text-blue-500 font-bold">Blue</span>) 
              to the tangential velocity vector caused by the rotation (<span className="text-emerald-500 font-bold">Green</span>, not shown to reduce clutter).
              Try lowering the wheel speed limit to see uniform desaturation, a common step in real swerve-drive commands.
            </p>
          </div>
        </div>

        {/* Controls Area - Sidebar */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-6">
          <ControlPanel state={robotState} onChange={setRobotState} />
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 w-full" aria-label="Wheel speed limit lesson">
            <h2 className="font-bold text-slate-800 mb-2">Lesson: Wheel Speed Desaturation</h2>
            <p className="text-sm text-slate-600 mb-3">
              When one module exceeds the wheel speed limit, all four wheel
              vectors are scaled by the same factor. This preserves their
              relative speeds and angles instead of clipping individual wheels.
            </p>
            <label htmlFor="max-wheel-speed" className="block text-sm font-medium text-slate-700 mb-2">
              Maximum wheel speed: {maxWheelSpeed.toFixed(2)} m/s
            </label>
            <input id="max-wheel-speed" type="range" min="0.25" max="2" step="0.05"
              value={maxWheelSpeed}
              onChange={e => setMaxWheelSpeed(Number(e.target.value))}
              className="w-full accent-indigo-600" />
            <p className="text-xs text-slate-500 mt-2">
              Try Vx = 1, Vy = 1, and ω = 1, then lower the limit.
              This normalized teaching example is not calibrated to real motors.
            </p>
          </section>
          
          <div className="text-xs text-slate-400 text-center max-w-[280px]">
            <p className="mb-2"><strong>Tips:</strong></p>
            <ul className="space-y-1 text-left list-disc pl-4">
              <li>Drag the <strong>Joystick</strong> to move the chassis (Up/Down/Left/Right).</li>
              <li>Use the <strong>Slider</strong> to add rotation.</li>
              <li>Try combining Forward + Rotate to see the characteristic "spiral" wheel vectors.</li>
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
