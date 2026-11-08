import React, { useRef, useEffect } from 'react';
import { RobotState } from '../types';

interface ControlPanelProps {
  state: RobotState;
  onChange: (newState: RobotState) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate deltas normalized to -1 to 1
    // X on screen is Left/Right. In our Robot Frame, Left is +Y, Right is -Y.
    // Y on screen is Up/Down. In our Robot Frame, Up is +X, Down is -X.
    
    let rawX = (clientX - centerX) / (rect.width / 2); // -1 (Left) to 1 (Right)
    let rawY = (clientY - centerY) / (rect.height / 2); // -1 (Up) to 1 (Down)
    
    // Clamp
    rawX = Math.max(-1, Math.min(1, rawX));
    rawY = Math.max(-1, Math.min(1, rawY));
    
    // Map to Robot Frame
    // Screen Up (rawY < 0) -> Robot Forward (+X)
    // Screen Left (rawX < 0) -> Robot Left (+Y)
    const newVx = -rawY; 
    const newVy = -rawX; 

    onChange({ ...state, vx: newVx, vy: newVy });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleJoystickMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDragging.current = true;
    handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleJoystickMove(e.clientX, e.clientY);
      }
    };
    const handleGlobalUp = () => {
      isDragging.current = false;
    };
    
    const handleGlobalTouchMove = (e: TouchEvent) => {
       if (isDragging.current && e.touches.length > 0) {
         e.preventDefault(); // Prevent scrolling while driving
         handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY);
       }
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalUp);
    window.addEventListener('touchcancel', handleGlobalUp);
    window.addEventListener('blur', handleGlobalUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('touchcancel', handleGlobalUp);
      window.removeEventListener('blur', handleGlobalUp);
    };
  }, [state]); // Re-bind if state logic needs it, though refs handle values. Dependency on state might be needed if we used it inside, but here we just dispatch.

  // Visual position of the joystick handle
  // Map vx/vy back to percentages
  // vx=1 (Up) -> top: 0%. vx=-1 (Down) -> top: 100%
  // vy=1 (Left) -> left: 0%. vy=-1 (Right) -> left: 100%
  const handleTop = `${((-state.vx + 1) / 2) * 100}%`;
  const handleLeft = `${((-state.vy + 1) / 2) * 100}%`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md flex flex-col gap-8">
      
      {/* Joystick Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          Translation (Joystick)
        </h2>
        <div className="flex justify-center">
          <div 
            ref={joystickRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="w-48 h-48 bg-slate-100 rounded-xl border-2 border-slate-200 relative cursor-crosshair touch-none shadow-inner"
          >
             {/* Crosshairs */}
             <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 transform -translate-y-1/2 pointer-events-none" />
             <div className="absolute left-1/2 top-0 w-px h-full bg-slate-300 transform -translate-x-1/2 pointer-events-none" />
             
             {/* Labels */}
             <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">+X (Fwd)</span>
             <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-bold">-X (Back)</span>
             <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">+Y (Left)</span>
             <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">-Y (Right)</span>

             {/* Handle */}
             <div 
               className="absolute w-6 h-6 bg-blue-600 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
               style={{ top: handleTop, left: handleLeft }}
             />
             
             {/* Vector Line */}
             <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
               <line 
                 x1="50%" y1="50%" 
                 x2={handleLeft} y2={handleTop} 
                 stroke="#3b82f6" 
                 strokeWidth="2" 
                 strokeOpacity="0.5"
               />
             </svg>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs font-mono text-slate-500">
           <span>Vx: {state.vx.toFixed(2)}</span>
           <span>Vy: {state.vy.toFixed(2)}</span>
        </div>
      </div>

      {/* Rotation Section */}
      <div>
         <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
           Rotation (ω)
         </h2>
         <div className="px-2">
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={state.omega}
              onChange={(e) => onChange({ ...state, omega: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
               <span>CW (-1)</span>
               <span className="text-slate-600 font-mono text-sm">{state.omega.toFixed(2)}</span>
               <span>CCW (+1)</span>
            </div>
         </div>
      </div>

    </div>
  );
};
