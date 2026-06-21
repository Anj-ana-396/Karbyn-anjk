import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { DAILY_BUDGET, MICRO_ACTIONS } from '../utils/carbonCalcs';
import useTilt from '../hooks/useTilt';
import confetti from 'canvas-confetti';

export default function Dashboard({ 
  entries, 
  savingsTotal = 0, 
  onAddMicroSaving 
}) {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const tiltGauge = useTilt(6, 1.02);
  const tiltStats = useTilt(4, 1.01);
  const tiltHabits = useTilt(2, 1.00);

  // Calculate emissions today
  const emissionsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= today && !entry.isMicroSaving;
      })
      .reduce((sum, entry) => sum + entry.co2, 0);
  }, [entries]);

  // Calculate micro savings today
  const savingsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return entries
      .filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= today && entry.isMicroSaving;
      })
      .reduce((sum, entry) => sum + entry.co2, 0);
  }, [entries]);

  // Net CO2 output today
  const netCO2Today = useMemo(() => {
    return Math.max(0, emissionsToday - savingsToday);
  }, [emissionsToday, savingsToday]);

  // Circular gauge calculation
  const circumference = 502; // 2 * Math.PI * 80 radius
  const budgetRatio = netCO2Today / DAILY_BUDGET;
  const progressOffset = circumference - Math.min(budgetRatio, 1) * circumference;

  // Visual status details
  const carbonStatus = useMemo(() => {
    if (netCO2Today === 0 && emissionsToday === 0) {
      return { label: "GRID ZERO", color: "text-cyber-green glow-text-green", stroke: "#00ff66", shadow: "shadow-[0_0_20px_rgba(0,255,102,0.3)]" };
    }
    if (netCO2Today <= DAILY_BUDGET * 0.5) {
      return { label: "EFFICIENT", color: "text-cyber-blue glow-text-blue", stroke: "#00e5ff", shadow: "shadow-[0_0_20px_rgba(0,229,255,0.3)]" };
    }
    if (netCO2Today <= DAILY_BUDGET) {
      return { label: "BALANCED", color: "text-cyber-green glow-text-green", stroke: "#00ff66", shadow: "shadow-[0_0_20px_rgba(0,255,102,0.3)]" };
    }
    return { label: "CRITICAL LIMIT", color: "text-cyber-neonred glow-text-red", stroke: "#ff3366", shadow: "shadow-[0_0_20px_rgba(255,51,96,0.3)]" };
  }, [netCO2Today, emissionsToday]);

  const handleMicroClick = (action, e) => {
    // Canvas confetti burst
    confetti({
      particleCount: 30,
      angle: 60 + Math.random() * 60,
      spread: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#00ff66', '#00e5ff']
    });

    // Add floating text feedback animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now() + Math.random();

    setFloatingTexts(prev => [...prev, {
      id,
      label: `-${(action.savings * 1000).toFixed(0)}g CO₂`,
      x,
      y
    }]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 900);

    // Bubble action event up to store in state
    onAddMicroSaving(action.id, action.savings, action.label);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 3D Carbon Ring Indicator */}
      <div 
        ref={tiltGauge.ref}
        style={tiltGauge.style}
        onMouseMove={tiltGauge.onMouseMove}
        onMouseLeave={tiltGauge.onMouseLeave}
        className="lg:col-span-4 cyber-panel p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[340px] preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <span className="text-[10px] font-mono tracking-widest text-cyber-blue uppercase mb-3 block">
          Carbon Budget Core
        </span>

        {/* Circular SVG Gauge */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle 
              cx="96" 
              cy="96" 
              r="80" 
              stroke="rgba(24, 32, 48, 0.4)" 
              strokeWidth="8" 
              fill="transparent" 
            />
            {/* Active Carbon Progress Circle */}
            <circle 
              cx="96" 
              cy="96" 
              r="80" 
              stroke={carbonStatus.stroke}
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${carbonStatus.stroke})`
              }}
            />
          </svg>
          
          {/* Inner textual data */}
          <div className="absolute text-center flex flex-col items-center justify-center font-mono">
            <span className="text-3xl font-extrabold tracking-tighter text-white">
              {netCO2Today.toFixed(1)}
            </span>
            <span className="text-[10px] text-cyber-lightgray uppercase">
              kg CO₂ Today
            </span>
            <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded border border-current bg-cyber-bg/70 ${carbonStatus.color}`}>
              {carbonStatus.label}
            </div>
          </div>
        </div>

        <div className="text-center font-mono mt-4">
          <span className="text-xs text-cyber-lightgray">Daily Target Ceiling: </span>
          <span className="text-xs text-cyber-blue font-bold">{DAILY_BUDGET} kg</span>
        </div>
      </div>

      {/* Stats HUD Card */}
      <div 
        ref={tiltStats.ref}
        style={tiltStats.style}
        onMouseMove={tiltStats.onMouseMove}
        onMouseLeave={tiltStats.onMouseLeave}
        className="lg:col-span-8 cyber-panel p-6 relative overflow-hidden flex flex-col justify-between preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyber-blue/15 border border-cyber-blue/30 text-cyber-blue animate-pulse-slow">
              <Icons.Activity className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyber-blue">Active Environmental HUD</h3>
          </div>
          <div className="text-[9px] font-mono text-cyber-lightgray uppercase">
            STATUS: ONLINE
          </div>
        </div>

        {/* HUD grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-cyber-bg/50 border border-cyber-border/40 rounded p-3 font-mono">
            <span className="text-[10px] text-cyber-lightgray block">TODAY'S OUTPUT</span>
            <span className="text-lg font-bold text-white block mt-0.5">+{emissionsToday.toFixed(1)} kg</span>
            <span className="text-[9px] text-cyber-lightgray/60">Gross carbon logs</span>
          </div>

          <div className="bg-cyber-bg/50 border border-cyber-border/40 rounded p-3 font-mono">
            <span className="text-[10px] text-cyber-lightgray block">TODAY'S MITIGATION</span>
            <span className="text-lg font-bold text-cyber-green block mt-0.5">-{savingsToday.toFixed(1)} kg</span>
            <span className="text-[9px] text-cyber-green/70">From small actions</span>
          </div>

          <div className="bg-cyber-bg/50 border border-cyber-border/40 rounded p-3 font-mono">
            <span className="text-[10px] text-cyber-lightgray block">CUMULATIVE SAVINGS</span>
            <span className="text-lg font-bold text-cyber-green glow-text-green block mt-0.5">
              -{savingsTotal.toFixed(1)} kg
            </span>
            <span className="text-[9px] text-cyber-lightgray/60">Total offsets saved</span>
          </div>

          <div className="bg-cyber-bg/50 border border-cyber-border/40 rounded p-3 font-mono">
            <span className="text-[10px] text-cyber-lightgray block">DAILY GAP</span>
            <span className={`text-lg font-bold block mt-0.5 ${netCO2Today > DAILY_BUDGET ? 'text-cyber-neonred' : 'text-cyber-blue'}`}>
              {(DAILY_BUDGET - netCO2Today).toFixed(1)} kg
            </span>
            <span className="text-[9px] text-cyber-lightgray/60">Remaining budget</span>
          </div>
        </div>

        {/* Mini information tip panel */}
        <div className="bg-cyber-blue/5 border border-cyber-blue/20 rounded p-3 text-xs flex gap-3 items-center">
          <Icons.ShieldAlert className="w-5 h-5 text-cyber-blue shrink-0 animate-bounce" />
          <p className="font-sans text-cyber-lightgray leading-relaxed text-xs">
            <strong className="text-white font-mono uppercase mr-1">Tactic:</strong>
            Mitigate your gross carbon emissions today by using the **Micro-Habit Logger** below. Every saved gram of carbon pulls the global projection closer to net-zero stabilization!
          </p>
        </div>
      </div>

      {/* Small Steps Counter / Micro Habits Logger */}
      <div 
        ref={tiltHabits.ref}
        style={tiltHabits.style}
        onMouseMove={tiltHabits.onMouseMove}
        onMouseLeave={tiltHabits.onMouseLeave}
        className="lg:col-span-12 cyber-panel p-6 relative overflow-hidden preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded bg-cyber-green/10 border border-cyber-green/30 text-cyber-green animate-pulse-slow">
            <Icons.Leaf className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-mono uppercase text-cyber-green">Micro-Habit Rapid Logger</h2>
            <p className="text-xs text-cyber-lightgray font-sans">Every small choice counts. Select quick habits completed right now:</p>
          </div>
        </div>

        {/* Micro Habits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
          {MICRO_ACTIONS.map((action) => {
            const Icon = Icons[action.icon] || Icons.Leaf;
            
            return (
              <button
                key={action.id}
                onClick={(e) => handleMicroClick(action, e)}
                className="relative overflow-hidden flex items-center gap-3 p-3 bg-cyber-bg/40 border border-cyber-border/40 hover:border-cyber-green/50 hover:bg-cyber-green/5 rounded text-left group transition-all duration-300 select-none active:scale-[0.98]"
              >
                <div className="p-2 bg-cyber-card border border-cyber-border/40 text-cyber-lightgray group-hover:text-cyber-green group-hover:border-cyber-green/30 rounded transition-all">
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="font-mono text-xs flex-1">
                  <div className="font-bold text-white group-hover:text-cyber-green transition-colors text-[11px] leading-tight">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-cyber-green font-bold mt-0.5">
                    -{(action.savings * 1000).toFixed(0)}g CO₂
                  </div>
                </div>

                {/* Local floating animated text messages */}
                {floatingTexts.map(t => (
                  <span 
                    key={t.id}
                    style={{ left: t.x, top: t.y }}
                    className="absolute text-xs font-bold text-cyber-green glow-text-green font-mono pointer-events-none animate-ping duration-1000"
                  >
                    {t.label}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
