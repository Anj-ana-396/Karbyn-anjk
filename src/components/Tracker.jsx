import React, { useState, useMemo } from 'react';
import { 
  Car, Zap, Utensils, ShoppingBag, 
  Trash2, Plus, Calendar, AlertTriangle,
  TrendingUp, Award, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { calculateEmission, EMISSION_FACTORS } from '../utils/carbonCalcs';
import useTilt from '../hooks/useTilt';

export default function Tracker({ entries, onAddEntry, onDeleteEntry }) {
  const [activeTab, setActiveTab] = useState('transport');
  const [selectedSubtype, setSelectedSubtype] = useState('carPetrol');
  const [quantity, setQuantity] = useState(10);
  const tiltTrackerCard = useTilt(3, 1.01);

  // Form configurations
  const formConfigs = {
    transport: {
      title: "Transport log",
      icon: Car,
      color: "cyber-blue",
      subtypes: [
        { key: "carPetrol", label: "Petrol Car", unit: "km", min: 1, max: 200, def: 15 },
        { key: "carDiesel", label: "Diesel Car", unit: "km", min: 1, max: 200, def: 15 },
        { key: "carHybrid", label: "Hybrid Car", unit: "km", min: 1, max: 200, def: 15 },
        { key: "carElectric", label: "Electric Car", unit: "km", min: 1, max: 200, def: 15 },
        { key: "train", label: "Train travel", unit: "km", min: 1, max: 500, def: 40 },
        { key: "bus", label: "Bus ride", unit: "km", min: 1, max: 100, def: 10 },
        { key: "flightShort", label: "Short Haul Flight", unit: "km", min: 50, max: 1500, def: 400 },
        { key: "flightLong", label: "Long Haul Flight", unit: "km", min: 1500, max: 10000, def: 2500 },
      ]
    },
    energy: {
      title: "Utility Power log",
      icon: Zap,
      color: "cyber-blue",
      subtypes: [
        { key: "electricity", label: "Grid Electricity", unit: "kWh", min: 1, max: 50, def: 8 },
        { key: "gas", label: "Natural Gas", unit: "kWh", min: 1, max: 100, def: 12 },
      ]
    },
    diet: {
      title: "Diet / Food consumed",
      icon: Utensils,
      color: "cyber-green",
      subtypes: [
        { key: "beefLamb", label: "Beef / Lamb Meal", unit: "servings", min: 1, max: 5, def: 1 },
        { key: "poultryPork", label: "Pork / Poultry Meal", unit: "servings", min: 1, max: 5, def: 1 },
        { key: "vegetarian", label: "Vegetarian Meal", unit: "servings", min: 1, max: 5, def: 1 },
        { key: "vegan", label: "Vegan Meal", unit: "servings", min: 1, max: 5, def: 1 },
      ]
    },
    goods: {
      title: "Retail & Goods log",
      icon: ShoppingBag,
      color: "cyber-blue",
      subtypes: [
        { key: "clothing", label: "New Clothing", unit: "items", min: 1, max: 10, def: 1 },
        { key: "electronics", label: "New Electronics", unit: "items", min: 1, max: 3, def: 1 },
        { key: "packagingPlastic", label: "Plastic Packaging / Bottled Items", unit: "items", min: 1, max: 20, def: 4 },
      ]
    }
  };

  // Keep subtype in sync when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const defaultSubtype = formConfigs[tab].subtypes[0];
    setSelectedSubtype(defaultSubtype.key);
    setQuantity(defaultSubtype.def);
  };

  const currentConfig = formConfigs[activeTab];
  const activeSubtypeConfig = useMemo(() => {
    return currentConfig.subtypes.find(s => s.key === selectedSubtype) || currentConfig.subtypes[0];
  }, [selectedSubtype, currentConfig]);

  // Dynamic footprint calculation for form feedback
  const estimatedCO2 = useMemo(() => {
    return calculateEmission(activeTab, selectedSubtype, quantity);
  }, [activeTab, selectedSubtype, quantity]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddEntry({
      category: activeTab,
      type: selectedSubtype,
      typeName: activeSubtypeConfig.label,
      quantity: parseFloat(quantity),
      unit: activeSubtypeConfig.unit,
      co2: estimatedCO2,
      timestamp: new Date().toISOString()
    });
    // Reset to defaults
    setQuantity(activeSubtypeConfig.def);
  };

  // Compile last 7 days chart data
  const chartData = useMemo(() => {
    const dailyData = {};
    const last7Days = [];
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last7Days.push(dateString);
      dailyData[dateString] = 0;
    }

    // Populate from entries
    entries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      const dateString = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyData[dateString] !== undefined) {
        dailyData[dateString] += entry.co2;
      }
    });

    return last7Days.map(date => ({
      name: date,
      CO2: parseFloat(dailyData[date].toFixed(2))
    }));
  }, [entries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Logger & Input - 3D Tilted Card */}
      <div 
        ref={tiltTrackerCard.ref}
        style={tiltTrackerCard.style}
        onMouseMove={tiltTrackerCard.onMouseMove}
        onMouseLeave={tiltTrackerCard.onMouseLeave}
        className="lg:col-span-5 cyber-panel p-6 relative overflow-hidden flex flex-col justify-between preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue animate-pulse-slow">
              <Plus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-mono uppercase text-cyber-blue">Eco Logs Terminal</h2>
              <p className="text-xs text-cyber-lightgray font-sans">Input daily energy/activity output</p>
            </div>
          </div>

          {/* Core Categories Selector Tab */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {Object.entries(formConfigs).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isSelected = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded border transition-all duration-200 ${
                    isSelected 
                      ? "bg-cyber-blue/15 border-cyber-blue text-cyber-blue glow-border-blue" 
                      : "bg-cyber-card border-cyber-border/40 text-cyber-lightgray hover:text-white hover:border-cyber-border"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-mono tracking-tight capitalize">{key}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4 font-mono">
            {/* Subtypes dropdown/radio */}
            <div>
              <label className="text-xs text-cyber-lightgray block mb-1">Select Activity Type</label>
              <select
                value={selectedSubtype}
                onChange={(e) => {
                  setSelectedSubtype(e.target.value);
                  const selectedSub = currentConfig.subtypes.find(s => s.key === e.target.value);
                  setQuantity(selectedSub.def);
                }}
                className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-blue/70"
              >
                {currentConfig.subtypes.map(sub => (
                  <option key={sub.key} value={sub.key} className="bg-cyber-card">
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Slider quantity input */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cyber-lightgray">Quantity Input:</span>
                <span className="text-cyber-blue font-bold">
                  {quantity} {activeSubtypeConfig.unit}
                </span>
              </div>
              <input
                type="range"
                min={activeSubtypeConfig.min}
                max={activeSubtypeConfig.max}
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="w-full h-1 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-blue"
              />
              <div className="flex justify-between text-[10px] text-cyber-lightgray mt-1">
                <span>{activeSubtypeConfig.min}</span>
                <span>{activeSubtypeConfig.max}</span>
              </div>
            </div>

            {/* Simulated Live Projection */}
            <div className="bg-cyber-bg/60 border border-cyber-border/40 rounded p-3 text-center">
              <div className="text-[10px] uppercase text-cyber-lightgray">Estimated Impact Projection</div>
              <div className={`text-xl font-bold mt-1 tracking-tight ${estimatedCO2 > 5 ? 'text-cyber-neonred glow-text-red' : 'text-cyber-blue glow-text-blue'}`}>
                +{estimatedCO2.toFixed(2)} kg CO₂e
              </div>
              <div className="text-[9px] text-cyber-lightgray/70 mt-1">
                Using global average standard emission conversions
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyber-blue border border-cyber-blue text-black font-bold uppercase rounded text-xs hover:bg-transparent hover:text-cyber-blue transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]"
            >
              <Plus className="w-4 h-4" /> Log Entry To System
            </button>
          </form>
        </div>
      </div>

      {/* Chart & History List */}
      <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
        {/* Glow Trend Chart */}
        <div className="cyber-panel p-5 relative overflow-hidden flex-1 min-h-[220px]">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-blue" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-cyber-blue">Carbon Emission Diagnostics (7 Days)</h3>
            </div>
            <div className="text-[10px] font-mono text-cyber-lightgray">Unit: kg CO₂e</div>
          </div>

          <div className="w-full h-[160px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#182030" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tickLine={false} 
                  axisLine={{ stroke: '#182030' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tickLine={false} 
                  axisLine={{ stroke: '#182030' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#080c14', 
                    border: '1px solid #182030', 
                    borderRadius: '6px', 
                    fontFamily: 'monospace',
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#00e5ff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="CO2" 
                  stroke="#00e5ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCo2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Log Table */}
        <div className="cyber-panel p-5 relative overflow-hidden flex-1 min-h-[220px] flex flex-col">
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-cyber-blue" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyber-blue">Chronological System Registry</h3>
          </div>

          <div className="overflow-y-auto flex-1 max-h-[160px] pr-1 space-y-2">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-cyber-lightgray py-6">
                <AlertTriangle className="w-7 h-7 text-cyber-lightgray/40 mb-2" />
                <span className="text-xs font-mono uppercase">Emission ledger empty. System idle.</span>
              </div>
            ) : (
              [...entries].reverse().map((entry) => {
                const date = new Date(entry.timestamp);
                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateString = date.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
                
                return (
                  <div 
                    key={entry.id}
                    className="flex items-center justify-between p-2.5 bg-cyber-bg/50 border border-cyber-border/40 hover:border-cyber-border rounded transition-all group font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-cyber-lightgray/60 bg-cyber-card px-1.5 py-0.5 border border-cyber-border/20 rounded">
                        {dateString} {timeString}
                      </span>
                      <div>
                        <div className="font-semibold text-white capitalize">{entry.typeName}</div>
                        <div className="text-[10px] text-cyber-lightgray/80">
                          Qty: {entry.quantity} {entry.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${entry.co2 > 5 ? 'text-cyber-neonred' : 'text-cyber-blue'}`}>
                        +{entry.co2.toFixed(1)} kg CO₂
                      </span>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-cyber-lightgray/50 hover:text-cyber-neonred transition-colors p-1"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
