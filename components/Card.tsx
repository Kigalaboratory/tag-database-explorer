
import React from 'react';
import { GameCardType, TagData } from '../types';
import { RATING_TO_SCORE } from '../constants';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.654H5.88a.75.75 0 01-.749-.654L4.125 6.67a.75.75 0 01.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452z" clipRule="evenodd" />
    </svg>
);


const getCardStyle = (rating: number): { base: string; title: string, stars: string } => {
  switch (rating) {
    case 5:
      return { base: 'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 border-amber-400', title: 'text-white', stars: 'text-amber-300' };
    case 4:
      return { base: 'bg-gradient-to-br from-purple-600 to-indigo-800 border-purple-400', title: 'text-white', stars: 'text-purple-300' };
    case 3:
      return { base: 'bg-gradient-to-br from-blue-600 to-cyan-800 border-blue-400', title: 'text-white', stars: 'text-blue-300' };
    case 2:
      return { base: 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-400', title: 'text-white', stars: 'text-emerald-300' };
    default:
      return { base: 'bg-slate-700 border-slate-500', title: 'text-slate-100', stars: 'text-slate-400' };
  }
};

interface CardProps {
  card: GameCardType;
  onClick: () => void;
  revealed: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, revealed }) => {
  const isDelete = 'type' in card && card.type === 'delete';
  const tagData = card as TagData;

  const style = isDelete ? { base: 'bg-red-900 border-red-600', title: 'text-red-100', stars: '' } : getCardStyle(tagData.rating);
  const score = isDelete ? 0 : RATING_TO_SCORE[tagData.rating];
  
  const cardInnerClass = `w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ${revealed ? '[transform:rotateY(180deg)]' : ''}`;

  return (
    <div className="w-full h-48 [perspective:1000px]" onClick={onClick}>
      <div className={cardInnerClass}>
        {/* Card Back */}
        <div className="absolute w-full h-full bg-slate-800 border-2 border-slate-600 rounded-xl flex items-center justify-center [backface-visibility:hidden]">
           <div className="text-indigo-400">
                <svg className="w-16 h-16 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.456-2.456L12.5 18l1.126-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456L20.5 18l-1.126.398a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
           </div>
        </div>

        {/* Card Front */}
        <div className={`absolute w-full h-full border-2 rounded-xl flex flex-col justify-between p-4 ${style.base} [transform:rotateY(180deg)] [backface-visibility:hidden]`}>
          {isDelete ? (
            <div className="flex flex-col items-center justify-center h-full">
              <TrashIcon className={`w-12 h-12 ${style.title}`} />
              <h3 className={`text-2xl font-bold mt-2 ${style.title}`}>削除</h3>
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-xl font-bold ${style.title}`}>{tagData.trans}</h3>
                    <p className={`text-sm ${style.title} opacity-80`}>{tagData.tag} ({tagData.jpTag})</p>
                  </div>
                  <div className={`text-lg font-bold ${style.title}`}>+{score}</div>
                </div>
                <p className="text-xs text-slate-300">{tagData.tagGroup.join(', ')}</p>
              </div>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < tagData.rating ? style.stars : 'text-slate-600'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
