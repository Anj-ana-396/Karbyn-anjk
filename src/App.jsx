import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Database, Compass, 
  Cpu, Activity, Menu, X, ShieldAlert, Award
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Tracker from './components/Tracker';
import Minimize, { ECO_QUESTS } from './components/Minimize';
import FuturisticGlobe from './components/FuturisticGlobe';

// Seed data to make the app look populated on first view
const SEED_ENTRIES = [
  {
    id: "seed-1",
    category: "transport",
    type: "carPetrol",
    typeName: "Petrol Car Travel",
    quantity: 35,
    unit: "km",
    co2: 5.95,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seed-2",
    category: "diet",
    type: "beefLamb",
    typeName: "Beef / Lamb Meal",
    quantity: 2,
    unit: "servings",
    co2: 14.4,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seed-3",
    category: "energy",
    type: "electricity",
    typeName: "Grid Electricity",
    quantity: 15,
    unit: "kWh",
    co2: 5.7,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seed-4",
    category: "goods",
    type: "clothing",
    typeName: "New Clothing",
    quantity: 1,
    unit: "items",
    co2: 10.0,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load state on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('ecosphere_entries');
    const savedQuests = localStorage.getItem('ecosphere_quests');
    
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Seed initial data
      setEntries(SEED_ENTRIES);
      localStorage.setItem('ecosphere_entries', JSON.stringify(SEED_ENTRIES));
    }

    if (savedQuests) {
      setCompletedQuests(JSON.parse(savedQuests));
    }
  }, []);

  // Write changes to localStorage
  const saveEntriesToStorage = (newEntries) => {
    setEntries(newEntries);
    localStorage.setItem('ecosphere_entries', JSON.stringify(newEntries));
  };

  const saveQuestsToStorage = (newQuests) => {
    setCompletedQuests(newQuests);
    localStorage.setItem('ecosphere_quests', JSON.stringify(newQuests));
  };

  // Add normal manual log entry
  const handleAddEntry = (entryData) => {
    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...entryData,
      isMicroSaving: false
    };
    saveEntriesToStorage([...entries, newEntry]);
  };

  // Add quick micro habit saving entry
  const handleAddMicroSaving = (actionId, savingsAmount, actionLabel) => {
    const newMicroEntry = {
      id: `micro-${Date.now()}`,
      category: 'savings',
      type: actionId,
      typeName: actionLabel,
      quantity: 1,
      unit: 'action',
      co2: savingsAmount, // positive offset value
      isMicroSaving: true,
      timestamp: new Date().toISOString()
    };
    saveEntriesToStorage([...entries, newMicroEntry]);
  };

  // Delete log entry
  const handleDeleteEntry = (id) => {
    const filtered = entries.filter(entry => entry.id !== id);
    saveEntriesToStorage(filtered);
  };

  // Toggle Eco Quest completion
  const handleToggleQuest = (questId, savingsAmount, questTitle) => {
    let newQuests;
    if (completedQuests.includes(questId)) {
      newQuests = completedQuests.filter(q => q !== questId);
    } else {
      newQuests = [...completedQuests, questId];
    }
    saveQuestsToStorage(newQuests);
  };

  // Calculate cumulative CO2 savings
  const savingsTotal = useMemo(() => {
    // 1. Savings from micro-habits logs
    const microSavings = entries
      .filter(e => e.isMicroSaving)
      .reduce((sum, e) => sum + e.co2, 0);

    // 2. Savings from completed eco-quests
    const questSavings = completedQuests
      .map(qId => ECO_QUESTS.find(q => q.id === qId)?.savings || 0)
      .reduce((sum, s) => sum + s, 0);

    return microSavings + questSavings;
  }, [entries, completedQuests]);

  const activeSavingsCount = useMemo(() => {
    const microCount = entries.filter(e => e.isMicroSaving).length;
    const questCount = completedQuests.length;
    return microCount + questCount;
  }, [entries, completedQuests]);

  // Sidebar navigation options
  const navItems = [
    { id: 'dashboard', label: 'Command Cockpit', icon: LayoutDashboard },
    { id: 'tracker', label: 'Carbon Ledger', icon: Database },
    { id: 'minimize', label: 'Eco-Quest Matrix', icon: Compass },
  ];

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row bg-cyber-bg text-white font-sans overflow-hidden select-none">
      
      {/* Sci-Fi Ambient Styling Overlays */}
      <div className="cyber-grid-bg" />
      <div className="cyber-vignette" />
      <div className="scanline-overlay absolute inset-0 z-50 pointer-events-none opacity-[0.025]" />

      {/* MOBILE HEADER BAR */}
      <header className="md:hidden flex items-center justify-between p-4 bg-cyber-card border-b border-cyber-border z-40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="font-mono text-sm tracking-widest font-extrabold text-cyber-blue glow-text-blue">
            ECOSPHERE // 3D
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-cyber-blue p-1 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* LEFT NAVIGATION PANEL (SIDEBAR) */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-cyber-card border-r border-cyber-border z-30 transform transition-transform duration-300 md:translate-x-0 md:relative md:flex md:flex-col justify-between shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand details */}
        <div className="p-6 border-b border-cyber-border flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyber-green animate-spin-slow" />
            <span className="font-mono tracking-widest font-black text-cyber-green glow-text-green text-sm">
              ECOSPHERE-3D
            </span>
          </div>
          <div className="text-[9px] font-mono text-cyber-lightgray tracking-wider">
            ATMOSPHERE CONTROL SYSTEM // v1.0.4
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border font-mono text-xs transition-all duration-300
                  ${isActive 
                    ? 'bg-cyber-blue/10 border-cyber-blue text-cyber-blue glow-border-blue' 
                    : 'bg-transparent border-transparent text-cyber-lightgray hover:text-white hover:bg-cyber-bg/50 hover:border-cyber-border/40'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global status panel */}
        <div className="p-4 border-t border-cyber-border font-mono text-[10px] text-cyber-lightgray bg-cyber-bg/20">
          <div className="flex justify-between items-center mb-1.5">
            <span>SECURE.PROTOCOL</span>
            <span className="text-cyber-green font-bold">ONLINE</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span>TOTAL_CO2_SAVED</span>
            <span className="text-cyber-blue font-bold">-{savingsTotal.toFixed(1)} kg</span>
          </div>
          <div className="w-full bg-cyber-border rounded-full h-1 relative overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyber-blue to-cyber-green h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (savingsTotal / 100) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] mt-1 text-cyber-lightgray/50">
            <span>0kg</span>
            <span>Target: 100kg</span>
          </div>
        </div>
      </aside>

      {/* MOBILE OUTSIDE MENU CLOSE BACKDROP */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
        />
      )}

      {/* MAIN CONTENT COCKPIT */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        
        {/* HUD HEADER BAR */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-cyber-border bg-cyber-card/45 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-3 font-mono">
            <Activity className="w-4 h-4 text-cyber-blue animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-cyber-blue font-bold">
              Command Station // {navItems.find(n => n.id === activeView)?.label}
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
              <span className="text-cyber-lightgray">CYBER_GRID: SECURE</span>
            </div>
            <div className="text-cyber-blue">
              UTC: {new Date().toISOString().slice(0, 19).replace('T', ' ')}
            </div>
          </div>
        </header>

        {/* PANELS DISPLAY VIEWPORT */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          
          {/* Holographic Spinning Globe (Renders at top on Dashboard command cockpit view) */}
          {activeView === 'dashboard' && (
            <div className="cyber-panel p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="hud-corner-tl" />
              <div className="hud-corner-tr" />
              <div className="hud-corner-bl" />
              <div className="hud-corner-br" />

              <div className="md:w-1/2 font-mono text-xs space-y-3 relative z-10">
                <span className="text-cyber-green font-bold text-[10px] tracking-widest uppercase block animate-pulse">
                  Holographic Simulation Active
                </span>
                <h1 className="text-2xl font-black uppercase text-white tracking-tight leading-none">
                  EcoSphere-3D Core
                </h1>
                <p className="font-sans text-cyber-lightgray leading-relaxed text-xs">
                  This rotating canvas simulation models the ecological gravity of your choices. Ticking off micro-habits and logging savings sends green restorative data packets rising upwards to heal the grid structure. Drag to rotate the telemetry manually.
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  <div className="bg-cyber-bg/80 border border-cyber-border/40 px-3 py-1.5 rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
                    <span>Savings logged: {activeSavingsCount}</span>
                  </div>
                  <div className="bg-cyber-bg/80 border border-cyber-border/40 px-3 py-1.5 rounded flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse" />
                    <span>Global grid synchronized</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex justify-center">
                <FuturisticGlobe activeSavingsCount={activeSavingsCount} />
              </div>
            </div>
          )}

          {/* Core view renderer */}
          <div className="transition-all duration-300">
            {activeView === 'dashboard' && (
              <Dashboard 
                entries={entries} 
                savingsTotal={savingsTotal} 
                onAddMicroSaving={handleAddMicroSaving} 
              />
            )}
            {activeView === 'tracker' && (
              <Tracker 
                entries={entries} 
                onAddEntry={handleAddEntry} 
                onDeleteEntry={handleDeleteEntry} 
              />
            )}
            {activeView === 'minimize' && (
              <Minimize 
                entries={entries} 
                savingsTotal={savingsTotal} 
                completedQuests={completedQuests} 
                onToggleQuest={handleToggleQuest} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
