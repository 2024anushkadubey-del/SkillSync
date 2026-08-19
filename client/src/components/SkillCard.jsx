import React from 'react';
import { Code2, Palette, Brain, Globe, Video, BookOpen, ArrowRight, Users } from 'lucide-react';

const iconMap = {
  Code2,
  Palette,
  Brain,
  Globe,
  Video,
  BookOpen,
};

export default function SkillCard({ category, onSelect }) {
  const IconComponent = iconMap[category.icon] || Code2;

  return (
    <div
      onClick={onSelect}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            {category.count}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
        <span>Browse peers offering this</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
