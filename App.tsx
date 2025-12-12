
import React, { useState, useCallback } from 'react';
import { Verse } from './types';
import { findVersesByTopic } from './services/geminiService';
import SearchInput from './components/SearchInput';
import VerseCard from './components/VerseCard';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { BibleIcon } from './components/Icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('Любов');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = useCallback(async (searchTopic: string) => {
    if (!searchTopic.trim()) {
      setError('Будь ласка, введіть тему для пошуку.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerses([]);
    setHasSearched(true);

    try {
      const result = await findVersesByTopic(searchTopic);
      setVerses(result);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити вірші. Будь ласка, перевірте свій API ключ та спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
               <BibleIcon />
               <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Тематичний Пошук по Біблії
              </h1>
            </div>
            <p className="text-slate-600 text-lg">
              Введіть тему для пошуку відповідних біблійних віршів.
            </p>
          </header>

          <SearchInput
            initialValue={topic}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          
          {error && <ErrorMessage message={error} />}

          <div className="mt-8 space-y-4">
            {isLoading && <LoadingSpinner />}
            
            {!isLoading && !error && hasSearched && verses.length === 0 && (
              <div className="text-center py-10 px-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-slate-700">Віршів не знайдено</h3>
                <p className="text-slate-500 mt-1">Спробуйте пошукати іншу тему.</p>
              </div>
            )}
            
            {!isLoading && verses.length > 0 && (
              verses.map((verse, index) => (
                <VerseCard key={`${verse.reference}-${index}`} verse={verse} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
