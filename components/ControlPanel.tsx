import React from 'react';
import { RobotState } from '../types';

interface ControlPanelProps {
  state: RobotState;
  onChange: (newState: RobotState) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange }) => {
  const handleChange = (key: keyof RobotState, value: number) => {
    onChange({ ...state, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
      <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Controls
      </h2>

      <div className="space-y-8">
        {/* Translation Speed */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-600">Chassis Speed (Translation)</label>
            <span className="text-sm font-mono text-slate-500">{(state.translationSpeed * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={state.translationSpeed}
            onChange={(e) => handleChange('translationSpeed', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Translation Angle */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-600">Direction</label>
            <span className="text-sm font-mono text-slate-500">{state.translationAngle.toFixed(0)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={state.translationAngle}
            onChange={(e) => handleChange('translationAngle', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
        </div>

        {/* Rotation Speed - The primary request */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-indigo-900">Rotation Speed (ω)</label>
            <span className="text-sm font-mono text-indigo-700">{state.rotationSpeed.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1.5"
            max="1.5"
            step="0.05"
            value={state.rotationSpeed}
            onChange={(e) => handleChange('rotationSpeed', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <p className="text-xs text-indigo-600 mt-2">
            Drag to see how rotation adds to the wheel vectors!
          </p>
        </div>
      </div>
    </div>
  );
};