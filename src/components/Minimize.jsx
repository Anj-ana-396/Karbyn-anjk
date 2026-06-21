import React, { useMemo } from 'react';
import { 
  Award, Shield, Zap, Lock, CheckCircle2,
  Compass, Clock, Flame, BatteryCharging, Leaf
} from 'lucide-react';
import confetti from 'canvas-confetti';
import useTilt from '../hooks/useTilt';

// Static Quest Data
export const ECO_QUESTS = [
  {
    id: "meatless_day",
    title: "Vegetarian Shield",
    description: "Replace all meat meals with vegetarian or vegan meals today.",
    savings: 5.1, // savings in kg (compared to high beef diet)
    category: "diet",
    period: "daily",
    difficulty: "Medium"
  },
  {
    id: "active_commute",
    title: "Zero Emission Drive",
    description: "Walk, bike, or run for all local travel today (up to 10km).",
    savings: 1.7, 
    category: "transport",
    period: "daily",
    difficulty: "Easy"
  },
  {
    id: "power_down",
    title: "Grid Offload",
    description: "Unplug standby electronics and keep HVAC off for 4 hours.",
    savings: 1.2, 
    category: "energy",
    period: "daily",
    difficulty: "Easy"
  },
  {
    id: "dry_wash",
    title: "Dry Cycle Bypass",
    description: "Wash clothes at 30°C and air-dry instead of using the dryer.",
    savings: 0.8,
    category: "energy",
    period: "daily",
    difficulty: "Easy"
  },
  {
    id: "compost_week",
    title: "Bio-Waste Diverter",
    description: "Successfully compost 100% of organic waste and food scraps for 5 days.",
    savings: 2.5,
    category: "waste",
    period: "weekly",
    difficulty: "Medium"
  },
  {
    id: "zero_plastic_week",
    title: "Plastic Overdrive",
    description: "Avoid purchasing or using single-use plastic water bottles, cups, or bags for 7 days.",
    savings: 4.0,
    category: "waste",
    period: "weekly",
    difficulty: "Hard"
  }
];

// Achievements definition
const ACHIEVEMENTS = [
  {
    id: "first_log",
    title: "Signal Online",
    desc: "Complete your first emission entry log.",
    req: "Log 1 emission entry",
    icon: BatteryCharging,
    badgeColor: "text-cyber-blue"
  },
  {
    id: "first_step",
    title: "Green Initiate",
    desc: "Log your first carbon-saving micro-habit.",
    req: "Complete 1 micro-habit",
    icon: Leaf,
    badgeColor: "text-cyber-green"
  },
  {
    id: "ten_kg",
    title: "Carbon Cutter",
    desc: "Save 10kg of CO₂ from the environment.",
    req: "Save 10.0kg CO₂ total",
    icon: Flame,
    badgeColor: "text-amber-400"
  },
  {
    id: "fifty_kg",
    title: "Eco Guardian",
    desc: "Save 50kg of CO₂ from the environment.",
    req: "Save 50.0kg CO₂ total",
    icon: Shield,
    badgeColor: "text-cyber-green"
  },
  {
    id: "hundred_kg",
    title: "Net Zero Sentinel",
    desc: "Reach 100kg of total logged CO₂ savings.",
    req: "Save 100.0kg CO₂ total",
    icon: Award,
    badgeColor: "text-purple-400 glow-text-blue"
  }
];

export default function Minimize({ 
  entries, 
  savingsTotal = 0, 
  completedQuests = [], 
  onToggleQuest 
}) {
  const tiltQuestCard = useTilt(3, 1.01);
  const tiltBadgeCard = useTilt(2, 1.01);

  // Check achievements unlocked states
  const unlockedStates = useMemo(() => {
    const microSavingsCount = entries.filter(e => e.isMicroSaving).length;
    const normalLogsCount = entries.filter(e => !e.isMicroSaving).length;
    
    return {
      first_log: normalLogsCount >= 1,
      first_step: microSavingsCount >= 1,
      ten_kg: savingsTotal >= 10,
      fifty_kg: savingsTotal >= 50,
      hundred_kg: savingsTotal >= 100
    };
  }, [entries, savingsTotal]);

  const handleQuestCheck = (questId, savings, title) => {
    const isCompletedNow = !completedQuests.includes(questId);
    
    if (isCompletedNow) {
      // Trigger futuristic celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00ff66', '#00e5ff', '#ffffff']
      });
    }
    
    onToggleQuest(questId, savings, title);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Quests Console - 3D Card */}
      <div 
        ref={tiltQuestCard.ref}
        style={tiltQuestCard.style}
        onMouseMove={tiltQuestCard.onMouseMove}
        onMouseLeave={tiltQuestCard.onMouseLeave}
        className="lg:col-span-7 cyber-panel p-6 relative overflow-hidden flex flex-col justify-between preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded bg-cyber-green/10 border border-cyber-green/30 text-cyber-green animate-pulse-slow">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-mono uppercase text-cyber-green">Eco Quests Console</h2>
              <p className="text-xs text-cyber-lightgray font-sans">Active daily/weekly minimization protocols</p>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {ECO_QUESTS.map((quest) => {
              const isDone = completedQuests.includes(quest.id);
              
              return (
                <div 
                  key={quest.id}
                  onClick={() => handleQuestCheck(quest.id, quest.savings, quest.title)}
                  className={`cursor-pointer flex items-start gap-3.5 p-3.5 rounded border transition-all duration-300 ${
                    isDone 
                      ? "bg-cyber-green/5 border-cyber-green/40 hover:border-cyber-green/60" 
                      : "bg-cyber-bg/50 border-cyber-border/40 hover:border-cyber-blue/30"
                  }`}
                >
                  <div className="mt-0.5">
                    <CheckCircle2 className={`w-5.5 h-5.5 transition-colors ${
                      isDone ? "text-cyber-green fill-cyber-green/10" : "text-cyber-lightgray/30 hover:text-cyber-blue"
                    }`} />
                  </div>

                  <div className="flex-1 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-bold capitalize text-sm ${isDone ? "text-cyber-green line-through" : "text-white"}`}>
                        {quest.title}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                          quest.period === 'daily' 
                            ? 'border-cyber-blue/20 text-cyber-blue bg-cyber-blue/5' 
                            : 'border-purple-500/20 text-purple-400 bg-purple-500/5'
                        }`}>
                          {quest.period}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          quest.difficulty === 'Easy' ? 'bg-cyber-blue/10 text-cyber-blue' :
                          quest.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-400' : 'bg-cyber-neonred/10 text-cyber-neonred'
                        }`}>
                          {quest.difficulty}
                        </span>
                      </div>
                    </div>

                    <p className="text-cyber-lightgray/80 mt-1 font-sans text-xs">
                      {quest.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-cyber-border/20">
                      <span className="text-[10px] text-cyber-lightgray/60">Estimated Yield:</span>
                      <span className="text-cyber-green font-bold glow-text-green">
                        -{quest.savings.toFixed(1)} kg CO₂e
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Gallery - 3D Card */}
      <div 
        ref={tiltBadgeCard.ref}
        style={tiltBadgeCard.style}
        onMouseMove={tiltBadgeCard.onMouseMove}
        onMouseLeave={tiltBadgeCard.onMouseLeave}
        className="lg:col-span-5 cyber-panel p-6 relative overflow-hidden flex flex-col justify-between preserve-3d"
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue animate-pulse-slow">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-mono uppercase text-cyber-blue">ECO-Achievements</h2>
              <p className="text-xs text-cyber-lightgray font-sans">Unlocked accolades and milestones</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlockedStates[ach.id];
              const Icon = ach.icon;

              return (
                <div 
                  key={ach.id}
                  className={`flex items-center gap-4 p-3 rounded border font-mono transition-all duration-300 ${
                    isUnlocked 
                      ? "bg-cyber-cardlight border-cyber-borderglow/50 glow-border-blue" 
                      : "bg-cyber-bg/30 border-cyber-border/20 opacity-50"
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border ${
                    isUnlocked 
                      ? "bg-cyber-bg border-cyber-borderglow text-cyber-blue" 
                      : "bg-cyber-bg border-cyber-border/10 text-cyber-lightgray"
                  }`}>
                    {isUnlocked ? <Icon className={`w-6 h-6 ${ach.badgeColor}`} /> : <Lock className="w-6 h-6 text-cyber-lightgray/40" />}
                  </div>

                  <div className="text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-cyber-lightgray'}`}>
                        {ach.title}
                      </h3>
                      {isUnlocked && (
                        <span className="text-[9px] uppercase tracking-wider text-cyber-green font-bold">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-cyber-lightgray font-sans mt-0.5">
                      {ach.desc}
                    </p>
                    <div className="text-[9px] text-cyber-blue/60 mt-1 uppercase font-bold">
                      Req: {ach.req}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
