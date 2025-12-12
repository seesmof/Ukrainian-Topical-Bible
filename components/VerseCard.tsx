
import React from 'react';
import { Verse } from '../types';
import { LinkIcon } from './Icons';

interface VerseCardProps {
  verse: Verse;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse }) => {
  const bibleGatewayUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(
    verse.linkReference
  )}&version=UKR`;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
      <blockquote className="border-l-4 border-blue-500 pl-4">
        <p className="text-slate-700 text-lg italic">
          "{verse.verse}"
        </p>
      </blockquote>
      <div className="mt-4 flex justify-end">
        <a
          href={bibleGatewayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 hover:underline"
        >
          <cite className="not-italic">{verse.reference}</cite>
          <LinkIcon />
        </a>
      </div>
    </div>
  );
};

export default VerseCard;
