import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TagData, AppMode, GameCardType } from './types';
import { RATING_TO_SCORE, DELETE_CARD_CHANCE, HAND_SIZE } from './constants';
import Modal from './components/Modal';
import Card from './components/Card';
import { useCsvData } from './hooks/useCsvData';
import { useTagGroupSelection } from './hooks/useTagGroupSelection';

// --- ICONS (defined outside component to prevent re-creation) ---
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const ShuffleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99" />
    </svg>
);
const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99" />
    </svg>
);


// --- Animated Score Hook ---
const useAnimatedScore = (targetScore: number, duration = 600) => {
    const [displayedScore, setDisplayedScore] = useState(targetScore);
    const frameRef = useRef<number | null>(null);
  
    useEffect(() => {
        const startScore = displayedScore;
        let startTime: number | null = null;
    
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentAnimatedScore = Math.floor(startScore + (targetScore - startScore) * progress);
            setDisplayedScore(currentAnimatedScore);
    
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
    
        frameRef.current = requestAnimationFrame(animate);
    
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetScore, duration]);
  
    return displayedScore;
};


// --- Main Application Component ---
const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('random');
  const { allTags, isLoading, error } = useCsvData('/data/danbooru_tag_data_rated.csv');
  
  const tagGroups = useMemo(() => {
    if (allTags.length === 0) return [];
    const uniqueGroups = [...new Set(allTags.flatMap(tag => tag.tagGroup))];
    return uniqueGroups.sort();
  }, [allTags]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center items-center">
        <p className="text-2xl text-slate-400">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex justify-center items-center">
        <p className="text-2xl">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            Tag Database Explorer
          </h1>
          <p className="text-slate-400 mt-2">Search tags or play the random tag game</p>
        </header>

        <div className="flex justify-center mb-8 bg-slate-800 p-1 rounded-full w-full max-w-xs mx-auto">
          <button
            onClick={() => setMode('random')}
            className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'random' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <ShuffleIcon className="w-5 h-5 inline-block mr-2"/>
            Random
          </button>
          <button
            onClick={() => setMode('search')}
            className={`w-1/2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}
          >
            <SearchIcon className="w-5 h-5 inline-block mr-2"/>
            Search
          </button>
        </div>

        <main>
          {mode === 'search' && <SearchMode allTags={allTags} tagGroups={tagGroups} />}
          {mode === 'random' && <RandomMode allTags={allTags} tagGroups={tagGroups} />}
        </main>
      </div>
    </div>
  );
};

// --- Search Mode Component ---
const SearchMode: React.FC<{ allTags: TagData[]; tagGroups: string[] }> = ({ allTags, tagGroups }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { selectedGroups, handleGroupToggle, handleSelectAll, handleDeselectAll } = useTagGroupSelection(tagGroups);

    const filteredTags = useMemo(() => {
        return allTags.filter(tag => {
            const matchesSearch = tag.trans.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGroup = tag.tagGroup.some(g => selectedGroups.has(g));
            return matchesSearch && matchesGroup;
        });
    }, [allTags, searchTerm, selectedGroups]);

    return (
        <div className="animate-fade-in">
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-slate-300">Filters</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSelectAll} className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">すべて選択</button>
                        <button onClick={handleDeselectAll} className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">すべて解除</button>
                    </div>
                </div>
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="日本語でタグを検索..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                    />
                    <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tagGroups.map(group => (
                        <button
                            key={group}
                            onClick={() => handleGroupToggle(group)}
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 border ${
                                selectedGroups.has(group)
                                ? 'bg-indigo-500 text-white border-indigo-500'
                                : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto bg-slate-800/50 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-slate-300">trans</th>
                            <th className="p-4 font-semibold text-sm text-slate-300">tag</th>
                            <th className="p-4 font-semibold text-sm text-slate-300">tagGroup</th>
                            <th className="p-4 font-semibold text-sm text-slate-300">Rating</th>
                            <th className="p-4 font-semibold text-sm text-slate-300">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTags.slice(0, 100).map((tag, index) => (
                            <tr key={index} className="border-b border-slate-700 hover:bg-slate-800">
                                <td className="p-4 font-medium">{tag.trans}</td>
                                <td className="p-4 text-slate-400">{tag.tag}</td>
                                <td className="p-4 text-slate-400">{tag.tagGroup.join(', ')}</td>
                                <td className="p-4 text-slate-400">{tag.rating}</td>
                                <td className="p-4 text-slate-400">{tag.count.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTags.length > 100 && <p className="text-center p-4 text-slate-500">Showing first 100 results...</p>}
            </div>
        </div>
    );
};

// --- Random Mode Component ---
const RandomMode: React.FC<{ allTags: TagData[]; tagGroups: string[] }> = ({ allTags, tagGroups }) => {
    const [score, setScore] = useState(0);
    const animatedScore = useAnimatedScore(score);
    const [hand, setHand] = useState<GameCardType[]>([]);
    const [revealed, setRevealed] = useState<boolean[]>([]);
    const { selectedGroups, handleGroupToggle, handleSelectAll, handleDeselectAll } = useTagGroupSelection(tagGroups, ['キャラクター', '版権']);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'drawn' | 'selected'>('idle');

    const drawingPool = useMemo(() => {
        if (selectedGroups.size === 0) return [];
        return allTags.filter(tag => tag.tagGroup.some(g => selectedGroups.has(g)));
    }, [allTags, selectedGroups]);
    
    const handleDraw = useCallback(() => {
      if (drawingPool.length < HAND_SIZE) {
          alert("Not enough tags in the selected groups to draw a hand.");
          return;
      }
  
      const newHand: GameCardType[] = [];
      const usedIndices = new Set<number>();
  
      for (let i = 0; i < HAND_SIZE; i++) {
          if (Math.random() < DELETE_CARD_CHANCE) {
              newHand.push({ type: 'delete' });
          } else {
              let randomIndex;
              do {
                  randomIndex = Math.floor(Math.random() * drawingPool.length);
              } while (usedIndices.has(randomIndex));
              usedIndices.add(randomIndex);
              newHand.push(drawingPool[randomIndex]);
          }
      }
      setHand(newHand);
      setRevealed(Array(HAND_SIZE).fill(false));
      setGameState('drawn');

      // Staggered reveal animation
      newHand.forEach((_, index) => {
        setTimeout(() => {
            setRevealed(prev => {
                const newRevealed = [...prev];
                newRevealed[index] = true;
                return newRevealed;
            });
        }, index * 150);
      });

  }, [drawingPool]);

    const handleCardClick = (card: GameCardType, index: number) => {
        if (gameState !== 'drawn' || !revealed[index]) return;

        if ('rating' in card) {
            setScore(prev => prev + RATING_TO_SCORE[card.rating]);
        }
        setGameState('selected');
    };

    const handleReset = () => {
        setScore(0);
        setHand([]);
        setGameState('idle');
        setIsModalOpen(false);
    };

    return (
        <div className="animate-fade-in flex flex-col items-center">
            <div className="w-full max-w-md bg-slate-800/50 rounded-2xl p-6 shadow-lg mb-8 text-center">
                <p className="text-slate-400 text-sm font-medium">SCORE</p>
                <p className="text-5xl font-bold text-white tracking-tighter">{animatedScore.toLocaleString()}</p>
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center mx-auto"
                >
                    <ResetIcon className="w-4 h-4 mr-1"/>
                    Reset Score
                </button>
            </div>
            
            <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {hand.map((card, index) => (
                    <div
                        key={index}
                        className={`${(gameState === 'drawn') ? 'cursor-pointer' : 'opacity-50'}`}
                    >
                      <Card card={card} revealed={revealed[index]} onClick={() => handleCardClick(card, index)} />
                    </div>
                ))}
            </div>

            {gameState !== 'drawn' && (
                <button
                    onClick={handleDraw}
                    disabled={drawingPool.length < HAND_SIZE}
                    className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {gameState === 'idle' ? 'Draw Cards' : 'Draw Again'}
                </button>
            )}
            
            <div className="mt-8 w-full max-w-4xl p-4 bg-slate-800/50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-slate-300">Tag Group Pool</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSelectAll} className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">すべて選択</button>
                        <button onClick={handleDeselectAll} className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">すべて解除</button>
                    </div>
                </div>
                 <div className="flex flex-wrap gap-2">
                    {tagGroups.map(group => (
                        <button
                            key={group}
                            onClick={() => handleGroupToggle(group)}
                            className={`px-3 py-1 text-sm rounded-full transition-all duration-200 border ${
                                selectedGroups.has(group)
                                ? 'bg-emerald-500 text-white border-emerald-500'
                                : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reset Score?">
                <p className="text-slate-300 mb-6">Are you sure you want to reset your score to 0? This action cannot be undone.</p>
                <div className="flex justify-end gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">Cancel</button>
                    <button onClick={handleReset} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors">Reset</button>
                </div>
            </Modal>
        </div>
    );
};

export default App;
