import React, { useState } from 'react';
import { SwerveCanvas } from './components/SwerveCanvas';
import { ControlPanel } from './components/ControlPanel';
import { RobotState } from './types';

const App: React.FC = () => {
  // Initial state demonstrating a mix of translation and rotation (the "swerve" effect)
  const [robotState, setRobotState] = useState<RobotState>({
    translationSpeed: 0.5,
    translationAngle: 0,
    rotationSpeed: 0.2, // Small rotation initially to show the curve
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
               S
             </div>
             <h1 className="text-xl font-bold text-slate-800">Swerve Kinematics Visualizer</h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Educational Demo
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visualization Area */}
        <div className="lg:col-span-2 min-h-[400px] flex flex-col gap-4">
          <SwerveCanvas state={robotState} />
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 leading-relaxed">
            <h3 className="font-bold mb-1">How it works:</h3>
            <p>
              Swerve drive combines <strong>Translation</strong> (moving the chassis in a direction) and <strong>Rotation</strong> (spinning the chassis). 
              Each wheel's velocity vector (Red) is the vector sum of the Chassis Velocity (Blue) and the Tangential Rotation Velocity (Green) at that specific corner.
            </p>
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex flex-col items-center">
          <ControlPanel state={robotState} onChange={setRobotState} />
          
          <div className="mt-6 text-xs text-slate-400 max-w-xs text-center">
            Adjust the sliders to see how wheel vectors change. 
            Notice how wheels point differently when rotating and translating simultaneously!
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;