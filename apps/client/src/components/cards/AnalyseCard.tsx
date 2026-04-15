"use client"

import type { AnalyseCardProps } from "@/types/analyse";

const accentColors = [
  { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-400", glow: "group-hover:shadow-purple-900/20" },
  { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   icon: "text-cyan-400",   glow: "group-hover:shadow-cyan-900/20" },
  { bg: "bg-blue-500/10",   border: "border-blue-500/20",   icon: "text-blue-400",   glow: "group-hover:shadow-blue-900/20" },
  { bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: "text-pink-400",   glow: "group-hover:shadow-pink-900/20" },
];

const AnalyseCard = ({ id, logo, title, desc }: AnalyseCardProps) => {
  const accent = accentColors[(id - 1) % accentColors.length];

  return (
    <div
      className={`group flex flex-col gap-4 rounded-2xl p-6 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 hover:shadow-xl ${accent.glow}`}
    >
      <div className={`w-12 h-12 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center ${accent.icon} transition-transform duration-300 group-hover:scale-110`}>
        {logo}
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-white text-base">{title}</h3>
        <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export default AnalyseCard;
