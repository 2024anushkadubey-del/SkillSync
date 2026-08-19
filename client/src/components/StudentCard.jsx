import React, { useState } from 'react';
import { Star, Repeat, Check, MessageSquare } from 'lucide-react';
import Button from './Button';

export default function StudentCard({ student }) {
  const [requested, setRequested] = useState(false);

  const handleRequestSwap = () => {
    setRequested(!requested);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header: Avatar, Name, Rating */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center border border-indigo-200/60 shadow-inner">
              {student.avatar}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">{student.name}</h4>
              <p className="text-xs text-slate-500">{student.major}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-1 rounded-lg text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{student.rating}</span>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="mb-3.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
            Can Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {student.teaches.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="mb-4">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {student.wantsToLearn.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-medium">
          {student.swapsCount} Swaps done
        </span>

        <Button
          variant={requested ? 'soft' : 'primary'}
          size="sm"
          onClick={handleRequestSwap}
          className="gap-1.5"
        >
          {requested ? (
            <>
              <Check className="w-3.5 h-3.5 text-indigo-600" />
              <span>Requested</span>
            </>
          ) : (
            <>
              <Repeat className="w-3.5 h-3.5" />
              <span>Request Swap</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
