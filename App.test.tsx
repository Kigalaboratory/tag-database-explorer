import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { vi } from 'vitest';
import { TagData } from './types';

// Mock the useCsvData hook
vi.mock('./hooks/useCsvData', () => ({
  useCsvData: () => ({
    allTags: [
      { tag: 'tag1', trans: '翻訳1', jpTag: 'jpTag1', tagGroup: ['キャラクター'], rating: 1, count: 100 },
      { tag: 'tag2', trans: '翻訳2', jpTag: 'jpTag2', tagGroup: ['版権'], rating: 2, count: 200 },
      { tag: 'tag3', trans: '翻訳3', jpTag: 'jpTag3', tagGroup: ['一般'], rating: 3, count: 300 },
      { tag: 'tag4', trans: '翻訳4', jpTag: 'jpTag4', tagGroup: ['キャラクター', '一般'], rating: 4, count: 400 },
    ] as TagData[],
    isLoading: false,
    error: null,
  }),
}));

describe('Tag Database Explorer', () => {
  describe('SearchMode', () => {
    beforeEach(() => {
      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    });

    it('should select all tag groups when "Select All" is clicked', () => {
      // Initially, some might be unselected, so first click deselect all
      fireEvent.click(screen.getByRole('button', { name: /すべて解除/i }));
      // Then click select all
      fireEvent.click(screen.getByRole('button', { name: /すべて選択/i }));
      
      const buttons = screen.getAllByRole('button', { name: /(キャラクター|版権|一般)/i });
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-indigo-500');
      });
    });

    it('should deselect all tag groups when "Deselect All" is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: /すべて解除/i }));
      
      const buttons = screen.getAllByRole('button', { name: /(キャラクター|版権|一般)/i });
      buttons.forEach(button => {
        expect(button).not.toHaveClass('bg-indigo-500');
      });
    });
  });

  describe('RandomMode', () => {
    beforeEach(() => {
      render(<App />);
      // Default mode is random, no need to click
    });

    it('should have "キャラクター" and "版権" deselected by default', () => {
      const characterButton = screen.getByRole('button', { name: 'キャラクター' });
      const copyrightButton = screen.getByRole('button', { name: '版権' });
      const generalButton = screen.getByRole('button', { name: '一般' });

      expect(characterButton).not.toHaveClass('bg-emerald-500');
      expect(copyrightButton).not.toHaveClass('bg-emerald-500');
      expect(generalButton).toHaveClass('bg-emerald-500');
    });

    it('should select all tag groups when "Select All" is clicked', () => {
      // First click deselect all to ensure a clean state
      fireEvent.click(screen.getByRole('button', { name: /すべて解除/i }));
      // Then click select all
      fireEvent.click(screen.getByRole('button', { name: /すべて選択/i }));
      
      const buttons = screen.getAllByRole('button', { name: /(キャラクター|版権|一般)/i });
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-emerald-500');
      });
    });

    it('should deselect all tag groups when "Deselect All" is clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: /すべて解除/i }));
      
      const buttons = screen.getAllByRole('button', { name: /(キャラクター|版権|一般)/i });
      buttons.forEach(button => {
        expect(button).not.toHaveClass('bg-emerald-500');
      });
    });
  });
});
