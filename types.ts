
export interface TagData {
  tag: string;
  trans: string;
  jpTag: string;
  count: number;
  tagGroup: string[];
  rating: number;
}

export type GameCardType = TagData | { type: 'delete' };

export type AppMode = 'search' | 'random';
