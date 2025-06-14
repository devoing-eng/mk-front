//src/app/components/Home/HeroSection/SearchBar.tsx

"use client";
import type { SearchResult, GroupedSearchResults } from '@/app/types/search';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useState, useRef, useEffect } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import Image from 'next/image';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults>({ coins: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchItems = async () => {
      if (!debouncedQuery.trim()) {
        setResults({ coins: [], users: [] });
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=20`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchItems();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        showDropdown
      ) {
        setShowDropdown(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
    setShowDropdown(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = results.coins.length + results.users.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          const allResults = [...results.coins, ...results.users];
          const selected = allResults[selectedIndex];
          handleResultClick(selected);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on result type
    if (result.type === 'coin') {
      window.location.href = `/coin/${result.id}`;
    } else {
      window.location.href = `/creator/${result.secondaryText}`;
    }
  };

  return (
    <div ref={searchContainerRef} className="relative w-full md:w-1/2 -mt-4">
      <div className="relative">
        <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          id='search-input'
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by name, ticker, or address"
          className="bg-white w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm text-gray-900"
        />
      </div>

      {showDropdown && (query.trim() !== '') && (
        <div
          ref={dropdownRef}
          className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {results.coins.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-700 uppercase px-2 py-1">
                    Coins
                  </div>
                  {results.coins.map((result, idx) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${
                        idx === selectedIndex ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                      {result.imageUrl && (
                        <Image
                          src={result.imageUrl}
                          alt={result.primaryText}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                          priority={false}
                          loading="lazy"
                        />
                      )}
                        <div>
                          <div className="font-medium text-gray-600">{result.primaryText}</div>
                          <div className="text-sm text-gray-500">{result.secondaryText}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.users.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-700 uppercase px-2 py-1">
                    Users
                  </div>
                  {results.users.map((result, idx) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`p-2 hover:bg-gray-100 cursor-pointer rounded ${
                        idx + results.coins.length === selectedIndex ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {result.imageUrl && (
                          <Image
                          src={result.imageUrl}
                          alt={result.primaryText}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                          priority={false}
                          loading="lazy"
                        />
                        )}
                        <div>
                          <div className="font-medium text-gray-600">{result.primaryText}</div>
                          <div className="text-sm text-gray-500">
                            {result.secondaryText.slice(0, 8)}...{result.secondaryText.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.coins.length === 0 && results.users.length === 0 && (
                <div className="p-4 text-center text-gray-500">No results found</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}