import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    generateStampImage,
    getCityCountryCorrection,
    getAutocompleteSuggestions,
    getCountryForCity,
} from './services/geminiService';
import { StampData } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import StampDisplay from './components/StampDisplay';

const App: React.FC = () => {
    const [country, setCountry] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [currentStamp, setCurrentStamp] = useState<StampData | null>(null);
    const [stampCollection, setStampCollection] = useState<StampData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // New state for suggestions and corrections
    const [correctionSuggestion, setCorrectionSuggestion] = useState<{
        city: string;
        country: string;
    } | null>(null);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
    const [activeInput, setActiveInput] = useState<'city' | 'country' | null>(null);
    const countryInputRef = useRef<HTMLInputElement>(null);

    // Debounced fetch for city suggestions
    useEffect(() => {
        if (city.length < 2 || activeInput !== 'city') {
            setCitySuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            const suggestions = await getAutocompleteSuggestions('city', city, { country });
            setCitySuggestions(suggestions);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [city, country, activeInput]);

    // Debounced fetch for country suggestions
    useEffect(() => {
        if (country.length < 2 || activeInput !== 'country') {
            setCountrySuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            const suggestions = await getAutocompleteSuggestions('country', country, { city });
            setCountrySuggestions(suggestions);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [country, city, activeInput]);

    const proceedWithGeneration = useCallback(async (cityToUse: string, countryToUse: string) => {
        setIsLoading(true);
        setError(null);
        setCurrentStamp(null);
        setCorrectionSuggestion(null);

        try {
            const imageUrl = await generateStampImage(cityToUse, countryToUse);
            const newStamp: StampData = {
                id: new Date().toISOString(),
                imageUrl,
                city: cityToUse,
                country: countryToUse,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
            };

            setCurrentStamp(newStamp);
            setStampCollection(prev => [newStamp, ...prev]);
            setCity('');
            setCountry('');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleTypoCheck = useCallback(async () => {
        if (!city || !country) {
            setError('Please enter both a city and a country.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentStamp(null);
        setCorrectionSuggestion(null);

        try {
            const correction = await getCityCountryCorrection(city, country);
            if (correction.needsCorrection) {
                setCorrectionSuggestion({
                    city: correction.correctedCity,
                    country: correction.correctedCountry,
                });
                setIsLoading(false); // Stop loading to show suggestion
            } else {
                await proceedWithGeneration(city, country);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
            setIsLoading(false);
        }
    }, [city, country, proceedWithGeneration]);

    const handleSuggestionClick = async (value: string, type: 'city' | 'country') => {
        if (type === 'city') {
            setCity(value);
            setCitySuggestions([]);

            // If country field is empty, proactively find the country for the selected city
            if (!country.trim()) {
                const countryForCity = await getCountryForCity(value);
                if (countryForCity) {
                    setCountry(countryForCity);
                }
            }
            countryInputRef.current?.focus();
        } else {
            // type === 'country'
            setCountry(value);
            setCountrySuggestions([]);
        }
    };

    const isFormInvalid = !city || !country || isLoading;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 bg-[url('https://www.transparenttextures.com/patterns/dark-denim.png')]">
            <main className="container mx-auto px-4 py-8 md:py-12">
                <header className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">AI Passport Stamp Collector</h1>
                    <p className="text-lg text-slate-400">Create and collect unique emblems from around the globe.</p>
                </header>

                <div className="max-w-lg mx-auto bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-700">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="relative">
                            <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                onFocus={() => setActiveInput('city')}
                                onBlur={() => setTimeout(() => setActiveInput(null), 150)}
                                placeholder="e.g., Tokyo"
                                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            {activeInput === 'city' && citySuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {citySuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            role="listitem"
                                            className="px-3 py-2 text-white hover:bg-sky-600 cursor-pointer"
                                            onMouseDown={() => handleSuggestionClick(suggestion, 'city')}
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="relative">
                            <label htmlFor="country" className="block text-sm font-medium text-slate-300 mb-1">
                                Country
                            </label>
                            <input
                                ref={countryInputRef}
                                type="text"
                                id="country"
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                onFocus={() => setActiveInput('country')}
                                onBlur={() => setTimeout(() => setActiveInput(null), 150)}
                                placeholder="e.g., Japan"
                                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            {activeInput === 'country' && countrySuggestions.length > 0 && (
                                <ul className="absolute z-10 w-full bg-slate-800 border border-slate-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {countrySuggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            role="listitem"
                                            className="px-3 py-2 text-white hover:bg-sky-600 cursor-pointer"
                                            onMouseDown={() => handleSuggestionClick(suggestion, 'country')}
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleTypoCheck}
                        disabled={isFormInvalid}
                        className="w-full mt-6 bg-sky-600 text-white font-bold py-3 rounded-lg hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center justify-center"
                    >
                        {isLoading ? 'Crafting Emblem...' : 'Generate Stamp'}
                    </button>
                </div>

                {correctionSuggestion && (
                    <div className="my-6 text-center bg-yellow-900/50 border border-yellow-700 text-yellow-300 p-4 rounded-lg max-w-lg mx-auto">
                        <p className="mb-3">
                            Did you mean:{' '}
                            <strong className="font-bold text-yellow-200">
                                {correctionSuggestion.city}, {correctionSuggestion.country}
                            </strong>
                            ?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <button
                                onClick={() => {
                                    setCity(correctionSuggestion.city);
                                    setCountry(correctionSuggestion.country);
                                    proceedWithGeneration(correctionSuggestion.city, correctionSuggestion.country);
                                }}
                                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition"
                            >
                                Yes, Use Suggestion
                            </button>
                            <button
                                onClick={() => {
                                    setCorrectionSuggestion(null);
                                    proceedWithGeneration(city, country);
                                }}
                                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition"
                            >
                                No, Use My Entry
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 min-h-[400px] flex items-center justify-center">
                    {isLoading && <LoadingSpinner />}
                    {error && (
                        <div className="text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg max-w-md mx-auto">
                            <p className="font-semibold">Generation Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {currentStamp && <StampDisplay stamp={currentStamp} isLarge={true} />}
                    {!isLoading && !error && !currentStamp && !correctionSuggestion && (
                        <div className="text-center text-slate-500">
                            <div className="w-64 h-64 border-4 border-dashed border-slate-700 rounded-full mx-auto flex items-center justify-center">
                                <p className="font-serif text-lg">Your next stamp awaits</p>
                            </div>
                        </div>
                    )}
                </div>

                {stampCollection.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-3xl font-serif text-center mb-8 border-b-2 border-slate-700 pb-2">
                            My Collection
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {stampCollection.map(stamp => (
                                <div
                                    key={stamp.id}
                                    className="transition-transform duration-300 hover:scale-105 cursor-pointer"
                                >
                                    <StampDisplay stamp={stamp} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default App;
