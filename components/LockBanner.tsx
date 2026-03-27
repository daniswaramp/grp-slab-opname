import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { UserRole } from '../types';

interface LockBannerProps {
  isLocked: boolean;
  lockedBy?: string | null;
  lockedAt?: string | null;
  role?: UserRole;
  onToggleLock?: () => void;
}

const LockBanner: React.FC<LockBannerProps> = ({ 
  isLocked, 
  lockedBy, 
  lockedAt,
  role = UserRole.USER,
  onToggleLock 
}) => {
  if (!isLocked && role !== UserRole.ADMIN) return null;

  return (
    <div className={`w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
      isLocked 
        ? 'bg-amber-50 border-b border-amber-200 text-amber-700' 
        : 'bg-gray-50 border-b border-gray-100 text-gray-400'
    }`}>
      {isLocked ? (
        <>
          <Lock size={14} className="text-amber-600" />
          <span>Not in Opname Agenda</span>
          {lockedBy && (
            <span className="text-xs font-normal text-amber-600 ml-2">
              (Locked by {lockedBy})
            </span>
          )}
        </>
      ) : (
        <>
          <Unlock size={14} />
          <span>System Unlocked</span>
        </>
      )}
      
      {role === UserRole.ADMIN && onToggleLock && (
        <button
          onClick={onToggleLock}
          className={`ml-3 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            isLocked
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          {isLocked ? 'Unlock' : 'Lock'}
        </button>
      )}
    </div>
  );
};

export default LockBanner;