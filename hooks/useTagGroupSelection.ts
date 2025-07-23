import { useState, useCallback } from 'react';

export const useTagGroupSelection = (tagGroups: string[], defaultDeselected: string[] = []) => {
  const [selectedGroups, setSelectedGroups] = useState(() => new Set(tagGroups.filter(g => !defaultDeselected.includes(g))));

  const handleGroupToggle = useCallback((group: string) => {
    setSelectedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedGroups(new Set(tagGroups));
  }, [tagGroups]);

  const handleDeselectAll = useCallback(() => {
    setSelectedGroups(new Set());
  }, []);

  return {
    selectedGroups,
    handleGroupToggle,
    handleSelectAll,
    handleDeselectAll,
  };
};
