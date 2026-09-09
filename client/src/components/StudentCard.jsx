import React from 'react';
import { Star, Repeat, Check, User } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export default function StudentCard({ student, onRequestSwap, onViewProfile, isRequested = false }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header: Avatar, Name, Rating */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-forest-100 text-forest-900 font-bold text-sm flex items-center justify-center border border-forest-200/70 shadow-2xs">
              {student.avatar}
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                {student.name}
              </h4>
              <p className="text-xs text-stone-500">{student.major}</p>
            </div>
          </div>
          
          <Badge variant="amber" size="sm">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span className="font-bold">{student.rating}</span>
          </Badge>
        </div>

        {/* Skills Offered (Can Teach) */}
        <div className="mb-3">
          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
            Can Teach:
          </span>
          <div className="flex flex-wrap gap-1">
            {student.teaches.map((skill, index) => (
              <Badge key={index} variant="forest" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Skills Wanted (Wants to Learn) */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1.5">
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1">
            {student.wantsToLearn.map((skill, index) => (
              <Badge key={index} variant="neutral" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <span className="text-xs text-stone-500 font-medium self-center sm:self-auto">
          {student.swapsCount} Swaps completed
        </span>

        <div className="flex items-center gap-1.5">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(student)}
              title="View student profile preview"
            >
              <User className="w-3.5 h-3.5" />
              <span>Details</span>
            </Button>
          )}

          <Button
            variant={isRequested ? 'soft' : 'primary'}
            size="sm"
            onClick={() => onRequestSwap(student)}
            className="flex-1 sm:flex-initial"
          >
            {isRequested ? (
              <>
                <Check className="w-3.5 h-3.5 text-forest-800" />
                <span>Requested</span>
              </>
            ) : (
              <>
                <Repeat className="w-3.5 h-3.5" />
                <span>Swap</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
