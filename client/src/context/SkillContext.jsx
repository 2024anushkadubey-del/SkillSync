import React, { createContext, useState } from 'react';
import { skillsApi } from '../services/api';
import { mockCurrentUser } from '../data/mockData';

/**
 * SkillContext
 * Experiment 3: Context API Global State Management for SkillSync skills.
 * Holds shared state for skills offered (teach) and skills wanted (learn),
 * along with global updater actions (addSkill, removeSkill).
 */
export const SkillContext = createContext(null);

export function SkillProvider({ children }) {
  // Global state managed using useState
  const [skillsOffered, setSkillsOffered] = useState(mockCurrentUser.skillsOffered || []);
  const [skillsWanted, setSkillsWanted] = useState(mockCurrentUser.skillsWanted || []);

  // Global state updater: Add Skill (preserves Experiment 2 API layer with local state update)
  const addSkill = async ({ type, name, level, category = 'General', description = '' }) => {
    if (!name || !name.trim()) {
      throw new Error('Skill name is required.');
    }

    try {
      const createdSkill = await skillsApi.addSkill({
        type,
        name: name.trim(),
        level,
        category,
        description,
      });

      if (type === 'teach') {
        setSkillsOffered((prev) => [...prev, createdSkill]);
      } else {
        setSkillsWanted((prev) => [...prev, createdSkill]);
      }

      return createdSkill;
    } catch (err) {
      // If server explicitly denied access due to RBAC (403 or 401), rethrow so UI can notify user
      if (err.status === 403 || err.status === 401) {
        throw new Error(err.message || 'Access Denied: You do not have permission to add skills.');
      }

      // Local fallback resilience for offline demo environments
      const fallbackSkill = {
        id: `${type === 'teach' ? 's' : 'w'}-${Date.now()}`,
        name: name.trim(),
        ...(type === 'teach' ? { level: level || 'Intermediate' } : { targetLevel: level || 'Beginner Goal' }),
        category: category || 'General',
        description: description || (type === 'teach' ? 'Peer instruction and practical exercises.' : 'Looking to learn fundamentals and best practices.'),
      };

      if (type === 'teach') {
        setSkillsOffered((prev) => [...prev, fallbackSkill]);
      } else {
        setSkillsWanted((prev) => [...prev, fallbackSkill]);
      }

      return fallbackSkill;
    }
  };

  // Global state updater: Remove Skill
  const removeSkill = async (id) => {
    try {
      await skillsApi.deleteSkill(id);
      setSkillsOffered((prev) => prev.filter((skill) => skill.id !== id));
      setSkillsWanted((prev) => prev.filter((skill) => skill.id !== id));
    } catch (err) {
      if (err.status === 403 || err.status === 401) {
        throw new Error(err.message || 'Access Denied: You do not have permission to delete skills.');
      }
      console.warn('API deletion fallback to local state:', err);
      setSkillsOffered((prev) => prev.filter((skill) => skill.id !== id));
      setSkillsWanted((prev) => prev.filter((skill) => skill.id !== id));
    }
  };

  const value = {
    skillsOffered,
    skillsWanted,
    addSkill,
    removeSkill,
    setSkillsOffered,
    setSkillsWanted,
  };

  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>;
}

export default SkillContext;
