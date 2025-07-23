import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from './Card';
import { TagData } from '../types';
import { vi } from 'vitest';

describe('Card component', () => {
  const mockTag: TagData = {
    tag: 'test_tag',
    trans: 'テスト翻訳',
    jpTag: 'テスト日本語タグ',
    count: 123,
    tagGroup: ['一般'],
    rating: 3,
  };

  it('should display the translation as the main title and "tag (jpTag)" as a subtitle', () => {
    render(<Card card={mockTag} onClick={vi.fn()} revealed={true} />);

    // Check for the main title (trans)
    const titleElement = screen.getByRole('heading', { name: /テスト翻訳/i });
    expect(titleElement).toBeInTheDocument();

    // Check for the subtitle "tag (jpTag)"
    const subtitleElement = screen.getByText(/test_tag \(テスト日本語タグ\)/i);
    expect(subtitleElement).toBeInTheDocument();
  });
});
