
import React, { useState } from 'react';
import { SearchIcon } from './Icons';

interface SearchInputProps {
  initialValue: string;
  onSearch: (topic: string) => void;
  isLoading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ initialValue, onSearch, isLoading }) => {
  const [topic, setTopic] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(topic);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="relative flex-grow">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="напр., Прощення, Надія, Сила..."
          className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <SearchIcon />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {isLoading ? 'Пошук...' : 'Знайти'}
      </button>
    </form>
  );
};

export default SearchInput;
