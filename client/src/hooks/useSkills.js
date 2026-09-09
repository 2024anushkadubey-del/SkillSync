import { useContext } from 'react';
import { SkillContext } from '../context/SkillContext';

/**
 * Custom Hook: useSkills
 * Experiment 3: Provides a clean, simplified interface for consuming
 * global skill state and actions throughout the SkillSync application.
 */
export function useSkills() {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error('useSkills must be used within a SkillProvider');
  }
  return context;
}

export default useSkills;
