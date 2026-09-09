import React from 'react';
import { Code2, Palette, Brain, Globe, Video, BookOpen, ArrowRight, Users } from 'lucide-react';
import Badge from './Badge';

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
      className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-forest-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-200/60 text-forest-800 flex items-center justify-center group-hover:bg-forest-900 group-hover:text-white transition-colors duration-200 shadow-2xs">
            <IconComponent className="w-5 h-5" />
          </div>
          <Badge variant="neutral" size="sm">
            <Users className="w-3 h-3 text-stone-500" />
            <span>{category.count}</span>
          </Badge>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-forest-900 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-forest-800 group-hover:text-forest-900">
        <span>View Category Details</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
