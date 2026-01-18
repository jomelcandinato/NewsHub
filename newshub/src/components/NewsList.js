import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from './NewsCard';
import CategoryFilter from './CategoryFilter';
import CountryToggle from './CountryToggle';
import NewsAPI from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NewsList = ({ searchQuery }) => {
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [country, setCountry] = useState('ph');
    const [category, setCategory] = useState('top');
    const [searchResults, setSearchResults] = useState(null);
    const [lastSearchQuery, setLastSearchQuery] = useState('');
    const { user } = useAuth();

    const getCategoryTitle = (selectedCategory, selectedCountry, articleCount) => {
        const categoryLabels = {
            'top': 'Top',
            'business': 'Business',
            'entertainment': 'Entertainment',
            'environment': 'Environment',
            'food': 'Food',
            'health': 'Health',
            'politics': 'Politics',
            'science': 'Science',
            'sports': 'Sports',
            'technology': 'Technology',
            'crime': 'Crime'
        };
        
        const countryLabel = selectedCountry === 'ph' ? 'Philippine' : 'Worldwide';
        const categoryLabel = categoryLabels[selectedCategory] || selectedCategory;
        
        return `${countryLabel} ${categoryLabel} News (${articleCount} articles)`;
    };

    const getMockData = useCallback((selectedCountry = country, selectedCategory = category) => {
        // Philippine mock data for each category
        const phMockData = {
            top: [
                {
                    article_id: 'ph-top-1',
                    title: 'Philippine Economy Shows Strong Growth in Q4 2024',
                    description: 'The Philippine economy recorded impressive growth figures driven by various sectors.',
                    content: 'The Philippine economy expanded significantly in the last quarter, with multiple sectors contributing to the positive performance. Government initiatives and private sector investments have played key roles.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Philippine News Agency',
                    category: ['top', 'business'],
                    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                },
                {
                    article_id: 'ph-top-2',
                    title: 'New Government Initiatives Announced to Boost Development',
                    description: 'President announces comprehensive development plan for the coming year.',
                    content: 'The Philippine government has unveiled a new development strategy focusing on infrastructure, education, and economic reforms to propel national growth.',
                    pubDate: new Date(Date.now() - 86400000).toISOString(),
                    source_name: 'Manila Bulletin',
                    category: ['top', 'politics'],
                    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            business: [
                {
                    article_id: 'ph-biz-1',
                    title: 'Philippine Economy Grows 6.5% in Q4 2024',
                    description: 'The Philippine economy showed strong growth driven by robust domestic consumption and exports.',
                    content: 'The Philippine economy expanded by 6.5% in the fourth quarter of 2024, exceeding market expectations. Growth was fueled by strong domestic demand, increased infrastructure spending, and rising exports.',
                    pubDate: new Date().toISOString(),
                    source_name: 'BusinessWorld',
                    category: ['business'],
                    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                },
                {
                    article_id: 'ph-biz-2',
                    title: 'Local Bank Reports Record Profits',
                    description: 'Major Philippine bank announces highest quarterly earnings in company history.',
                    content: 'BPI reported record-breaking profits for the last quarter, attributing the success to increased digital banking adoption and strong loan growth.',
                    pubDate: new Date(Date.now() - 86400000).toISOString(),
                    source_name: 'Philippine Daily Inquirer',
                    category: ['business'],
                    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            entertainment: [
                {
                    article_id: 'ph-ent-1',
                    title: 'Filipino Film Wins International Award',
                    description: 'Local independent film wins top prize at Cannes Film Festival.',
                    content: 'A Filipino independent film directed by a young filmmaker from Cebu won the Palme d\'Or at the Cannes Film Festival, marking a historic achievement for Philippine cinema.',
                    pubDate: new Date().toISOString(),
                    source_name: 'ABS-CBN Entertainment',
                    category: ['entertainment'],
                    image_url: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            environment: [
                {
                    article_id: 'ph-env-1',
                    title: 'Philippines Launches New Marine Protected Area',
                    description: 'Government establishes 500-hectare marine sanctuary in Palawan.',
                    content: 'The Philippine government has designated a new marine protected area covering 500 hectares of coral reefs in Palawan, home to endangered sea turtles and diverse marine life.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Rappler',
                    category: ['environment'],
                    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            food: [
                {
                    article_id: 'ph-food-1',
                    title: 'Traditional Filipino Restaurant Wins Michelin Star',
                    description: 'Manila restaurant becomes first Filipino eatery to receive Michelin recognition.',
                    content: 'A family-owned restaurant in Manila specializing in traditional Filipino cuisine has been awarded a Michelin star, bringing international recognition to Philippine culinary heritage.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Food Magazine PH',
                    category: ['food'],
                    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            health: [
                {
                    article_id: 'ph-health-1',
                    title: 'New Medical Center Opens in Rural Area',
                    description: 'Modern healthcare facility provides services to underserved communities.',
                    content: 'A new medical center equipped with modern facilities has opened in a rural province, providing comprehensive healthcare services to previously underserved communities.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Philippine Daily Inquirer',
                    category: ['health'],
                    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            politics: [
                {
                    article_id: 'ph-pol-1',
                    title: 'Senate Approves New Anti-Corruption Bill',
                    description: 'Legislation strengthens anti-corruption measures in government.',
                    content: 'The Philippine Senate has approved a comprehensive anti-corruption bill that introduces stricter penalties and stronger oversight mechanisms for government officials.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Philippine Star',
                    category: ['politics'],
                    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            science: [
                {
                    article_id: 'ph-sci-1',
                    title: 'Filipino Scientists Discover New Marine Species',
                    description: 'Research team identifies previously unknown coral species in Philippine waters.',
                    content: 'A team of Filipino marine biologists has discovered a new species of coral in the waters off Mindanao, highlighting the rich biodiversity of Philippine marine ecosystems.',
                    pubDate: new Date().toISOString(),
                    source_name: 'DOST',
                    category: ['science'],
                    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            sports: [
                {
                    article_id: 'ph-sports-1',
                    title: 'Philippine Basketball Team Wins Championship',
                    description: 'National team clinches Asian basketball tournament title.',
                    content: 'The Philippine national basketball team secured the championship in the Asian Basketball Cup, defeating regional rivals in a thrilling final match.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Sports5',
                    category: ['sports'],
                    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            technology: [
                {
                    article_id: 'ph-tech-1',
                    title: 'Philippine Startup Develops Revolutionary AI Tool',
                    description: 'Local tech company creates AI solution for agricultural optimization.',
                    content: 'A Philippine startup has developed an artificial intelligence platform that helps farmers optimize crop yields and reduce resource consumption, receiving international recognition.',
                    pubDate: new Date().toISOString(),
                    source_name: 'TechInAsia',
                    category: ['technology'],
                    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            crime: [
                {
                    article_id: 'ph-crime-1',
                    title: 'Police Bust Major Drug Syndicate',
                    description: 'Law enforcement agencies dismantle nationwide drug trafficking network.',
                    content: 'Philippine law enforcement agencies have successfully dismantled a major drug syndicate operating across multiple regions, resulting in numerous arrests and seizure of illegal substances.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Philippine National Police',
                    category: ['crime'],
                    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ]
        };

        // Worldwide mock data for each category
        const wwMockData = {
            top: [
                {
                    article_id: 'ww-top-1',
                    title: 'Global Markets Reach Record Highs Amid Economic Optimism',
                    description: 'Stock markets worldwide achieve unprecedented levels.',
                    content: 'International stock markets surged to record highs as positive economic indicators and corporate earnings reports boosted investor confidence across major economies.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Financial Times',
                    category: ['top', 'business'],
                    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                },
                {
                    article_id: 'ww-top-2',
                    title: 'Major International Summit Addresses Climate Change',
                    description: 'World leaders gather to discuss global environmental challenges.',
                    content: 'International leaders convened for a major summit focusing on climate change mitigation strategies and global cooperation for sustainable development.',
                    pubDate: new Date(Date.now() - 86400000).toISOString(),
                    source_name: 'BBC News',
                    category: ['top', 'environment', 'politics'],
                    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            business: [
                {
                    article_id: 'ww-biz-1',
                    title: 'Global Markets Reach All-Time High',
                    description: 'Stock markets worldwide achieve record levels amid economic optimism.',
                    content: 'Global stock markets surged to record highs as positive economic indicators and corporate earnings reports boosted investor confidence across major economies.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Financial Times',
                    category: ['business'],
                    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            entertainment: [
                {
                    article_id: 'ww-ent-1',
                    title: 'Hollywood Blockbuster Breaks Box Office Records',
                    description: 'Latest superhero film becomes highest-grossing movie of the year.',
                    content: 'The latest installment in a popular superhero franchise has broken box office records worldwide, becoming the highest-grossing film of the year within its first week of release.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Variety',
                    category: ['entertainment'],
                    image_url: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            environment: [
                {
                    article_id: 'ww-env-1',
                    title: 'International Agreement Reached on Climate Action',
                    description: 'Countries commit to accelerated carbon reduction targets.',
                    content: 'World leaders have reached a new international agreement committing to more ambitious carbon reduction targets and increased climate financing for developing nations.',
                    pubDate: new Date().toISOString(),
                    source_name: 'BBC News',
                    category: ['environment'],
                    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            food: [
                {
                    article_id: 'ww-food-1',
                    title: 'Global Food Security Initiative Launched',
                    description: 'International coalition addresses world hunger challenges.',
                    content: 'A coalition of nations and organizations has launched a comprehensive initiative to combat global hunger and improve food security through sustainable agricultural practices.',
                    pubDate: new Date().toISOString(),
                    source_name: 'UN News',
                    category: ['food'],
                    image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            health: [
                {
                    article_id: 'ww-health-1',
                    title: 'Breakthrough in Cancer Treatment Announced',
                    description: 'Medical researchers discover promising new therapy approach.',
                    content: 'International medical researchers have announced a breakthrough in cancer treatment, discovering a promising new therapy that shows significant effectiveness in clinical trials.',
                    pubDate: new Date().toISOString(),
                    source_name: 'WHO News',
                    category: ['health'],
                    image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            politics: [
                {
                    article_id: 'ww-pol-1',
                    title: 'Global Summit Addresses Geopolitical Challenges',
                    description: 'World leaders discuss international cooperation and security.',
                    content: 'World leaders gathered at an international summit to address pressing geopolitical challenges, focusing on cooperation, security, and economic stability.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Reuters',
                    category: ['politics'],
                    image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            science: [
                {
                    article_id: 'ww-sci-1',
                    title: 'Major Scientific Discovery in Space Exploration',
                    description: 'Researchers detect signs of potential life on distant planet.',
                    content: 'International space researchers have detected potential signs of biological activity on a distant exoplanet, marking a significant milestone in the search for extraterrestrial life.',
                    pubDate: new Date().toISOString(),
                    source_name: 'NASA',
                    category: ['science'],
                    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            sports: [
                {
                    article_id: 'ww-sports-1',
                    title: 'World Cup Finals Set for Historic Matchup',
                    description: 'International football tournament reaches thrilling conclusion.',
                    content: 'The FIFA World Cup final will feature an unexpected matchup between two underdog teams, promising an exciting conclusion to the international football tournament.',
                    pubDate: new Date().toISOString(),
                    source_name: 'ESPN',
                    category: ['sports'],
                    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            technology: [
                {
                    article_id: 'ww-tech-1',
                    title: 'Tech Companies Unveil Next-Generation AI Systems',
                    description: 'Major advancements announced in artificial intelligence development.',
                    content: 'Leading technology companies have unveiled their next-generation artificial intelligence systems, featuring significant improvements in capabilities and ethical safeguards.',
                    pubDate: new Date().toISOString(),
                    source_name: 'TechCrunch',
                    category: ['technology'],
                    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ],
            crime: [
                {
                    article_id: 'ww-crime-1',
                    title: 'International Operation Dismantles Cybercrime Network',
                    description: 'Global law enforcement agencies crack down on online criminal activities.',
                    content: 'An international law enforcement operation has successfully dismantled a major cybercrime network responsible for global financial fraud and data breaches.',
                    pubDate: new Date().toISOString(),
                    source_name: 'Interpol',
                    category: ['crime'],
                    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    link: '#'
                }
            ]
        };

        const dataSource = selectedCountry === 'ph' ? phMockData : wwMockData;
        return dataSource[selectedCategory] || [];
    }, [country, category]);

    const filterUnwantedSources = useCallback((articlesList) => {
        if (country === 'ph') {
            const unwantedSources = [
                'Menafn',
                'Pr Newswire Apac',
                'Ign Southeast Asia',
                'Channel Newsasia',
                'MENAFN',
                'PR Newswire APAC',
                'IGN Southeast Asia',
                'Channel NewsAsia',
                'Reuters'
            ];
            
            return articlesList.filter(article => {
                const sourceName = article.source_name || '';
                return !unwantedSources.some(unwanted => 
                    sourceName.toLowerCase().includes(unwanted.toLowerCase())
                );
            });
        }
        return articlesList;
    }, [country]);

    const filterArticlesByCategory = useCallback((articlesList, selectedCategory) => {
        if (selectedCategory === 'top') {
            return articlesList;
        }
        
        return articlesList.filter(article => {
            // Check if article has category array and includes the selected category
            if (article.category && Array.isArray(article.category)) {
                return article.category.includes(selectedCategory);
            }
            
            // Fallback for API data that might not have category array
            if (article.article_category) {
                return article.article_category.toLowerCase() === selectedCategory;
            }
            
            // For mock data that has category property
            if (article.category && typeof article.category === 'string') {
                return article.category === selectedCategory;
            }
            
            return false;
        });
    }, []);

    const saveSearchHistory = useCallback(async (query, resultsCount) => {
        if (!user || !query.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/search-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    search_query: query,
                    search_results: resultsCount
                })
            });
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }, [user]);

    const fetchNews = useCallback(async (selectedCountry = country, selectedCategory = category) => {
        try {
            setLoading(true);
            setError(null);
            console.log(`Fetching news for country: ${selectedCountry}, category: ${selectedCategory}`);
            
            let data;
            if (selectedCategory === 'top') {
                // For top news, fetch without category filter
                data = await NewsAPI.getLatestNews(selectedCountry, null);
            } else {
                // For specific categories, use category filter
                data = await NewsAPI.getNewsByCategory(selectedCategory, selectedCountry);
            }
            
            if (data.results && data.results.length > 0) {
                console.log(`Received ${data.results.length} articles for ${selectedCountry}, category: ${selectedCategory}`);
                
                // Filter unwanted sources for Philippines
                let filteredArticles = data.results;
                if (selectedCountry === 'ph') {
                    filteredArticles = filterUnwantedSources(data.results);
                    console.log(`After filtering: ${filteredArticles.length} articles`);
                }
                
                // Apply category filter to ensure accurate category matching
                const categoryFilteredArticles = filterArticlesByCategory(filteredArticles, selectedCategory);
                console.log(`After category filtering: ${categoryFilteredArticles.length} articles`);
                
                setArticles(categoryFilteredArticles);
                setFilteredArticles(categoryFilteredArticles);
                setSearchResults(null);
            } else {
                console.log('No articles found from API, using mock data');
                // Use mock data
                const mockData = getMockData(selectedCountry, selectedCategory);
                setArticles(mockData);
                setFilteredArticles(mockData);
            }
        } catch (err) {
            console.error('Error in fetchNews:', err);
            setError(`Failed to load ${selectedCategory} news. Please try again later.`);
            
            // Use mock data
            const mockData = getMockData(selectedCountry, selectedCategory);
            setArticles(mockData);
            setFilteredArticles(mockData);
        } finally {
            setLoading(false);
        }
    }, [country, category, filterUnwantedSources, filterArticlesByCategory, getMockData]);

    useEffect(() => {
        const performSearch = async (query) => {
            if (query && query.trim()) {
                try {
                    setSearchLoading(true);
                    setError(null);
                    setLastSearchQuery(query);
                    const data = await NewsAPI.searchNews(query, country);
                    
                    if (data.results && data.results.length > 0) {
                        // Filter unwanted sources for Philippines
                        let filteredResults = data.results;
                        if (country === 'ph') {
                            filteredResults = filterUnwantedSources(data.results);
                        }
                        
                        setSearchResults(filteredResults);
                        saveSearchHistory(query, filteredResults.length);
                    } else {
                        throw new Error('No search results found');
                    }
                } catch (err) {
                    console.error('Error in performSearch:', err);
                    setError('No results found. Try a different search term.');
                    setSearchResults([]);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setSearchResults(null);
                setLastSearchQuery('');
            }
        };

        if (searchQuery !== undefined) {
            performSearch(searchQuery);
        }
    }, [searchQuery, country, filterUnwantedSources, saveSearchHistory]);

    const handleCategoryChange = useCallback((selectedCategory) => {
        setCategory(selectedCategory);
        setSearchResults(null);
        fetchNews(country, selectedCategory);
    }, [country, fetchNews]);

    const handleCountryToggle = useCallback((selectedCountry) => {
        setCountry(selectedCountry);
        if (searchResults) {
            if (lastSearchQuery) {
                const performSearch = async () => {
                    try {
                        setSearchLoading(true);
                        const data = await NewsAPI.searchNews(lastSearchQuery, selectedCountry);
                        if (data.results && data.results.length > 0) {
                            let filteredResults = data.results;
                            if (selectedCountry === 'ph') {
                                filteredResults = filterUnwantedSources(data.results);
                            }
                            setSearchResults(filteredResults);
                        } else {
                            setSearchResults([]);
                        }
                    } catch (err) {
                        console.error('Error searching news:', err);
                        setSearchResults([]);
                    } finally {
                        setSearchLoading(false);
                    }
                };
                performSearch();
            }
        } else {
            fetchNews(selectedCountry, category);
        }
    }, [searchResults, lastSearchQuery, category, fetchNews, filterUnwantedSources]);

    const clearSearch = useCallback(() => {
        setSearchResults(null);
        setLastSearchQuery('');
        if (!loading) {
            fetchNews(country, category);
        }
    }, [loading, country, category, fetchNews]);

    useEffect(() => {
        if (!searchResults) {
            fetchNews();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const styles = {
        container: {
            padding: '20px 0'
        },
        welcomeMessage: {
            background: 'linear-gradient(135deg, #3498db, #2980b9)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
            flexWrap: 'wrap',
            gap: '15px'
        },
        welcomeText: {
            fontSize: '18px',
            fontWeight: '600'
        },
        userFeatures: {
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
        },
        featureLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            transition: 'background 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        filtersSection: {
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        sectionTitle: {
            margin: '30px 0 20px',
            color: '#2c3e50',
            fontSize: '28px'
        },
        newsCount: {
            fontSize: '18px',
            color: '#7f8c8d',
            fontWeight: 'normal'
        },
        newsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px',
            marginTop: '20px'
        },
        refreshSection: {
            textAlign: 'center',
            margin: '40px 0',
            padding: '30px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        refreshButton: {
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s'
        },
        clearSearchButton: {
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            marginLeft: '10px'
        },
        lastUpdated: {
            marginTop: '15px',
            color: '#7f8c8d',
            fontSize: '14px'
        },
        errorMessage: {
            backgroundColor: '#ffeaea',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            padding: '20px',
            margin: '20px 0',
            textAlign: 'center',
            color: '#d32f2f'
        },
        loadingSpinner: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
        },
        searchInfo: {
            backgroundColor: '#e3f2fd',
            border: '1px solid #bbdefb',
            borderRadius: '8px',
            padding: '15px 20px',
            margin: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px'
        },
        searchQuery: {
            fontSize: '16px',
            color: '#1976d2',
            fontWeight: '600'
        },
        searchResultsCount: {
            fontSize: '14px',
            color: '#666',
            marginLeft: '10px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
        },
        sourceFilterNote: {
            fontSize: '12px',
            color: '#7f8c8d',
            marginTop: '5px',
            fontStyle: 'italic'
        },
        categoryFilterInfo: {
            fontSize: '14px',
            color: '#3498db',
            marginTop: '10px',
            padding: '10px',
            background: '#f0f8ff',
            borderRadius: '6px',
            fontWeight: '600'
        }
    };

    return (
        <div style={styles.container}>
            {user && (
                <div style={styles.welcomeMessage}>
                    <div style={styles.welcomeText}>
                        👋 Welcome back, <strong>{user.username}</strong>!
                    </div>
                    <div style={styles.userFeatures}>
                        <Link to="/reading-history" style={styles.featureLink}>
                            📖 Reading History
                        </Link>
                        <Link to="/favorites" style={styles.featureLink}>
                          ❤️ Favorites
                        </Link>
                        <Link to="/search-history" style={styles.featureLink}>
                            🔍 Search History
                        </Link>
                    </div>
                </div>
            )}
            
            <div style={styles.filtersSection}>
                <CountryToggle currentCountry={country} onToggle={handleCountryToggle} />
                {country === 'ph' && (
                    <div style={styles.sourceFilterNote}>
                    </div>
                )}
                <CategoryFilter currentCategory={category} onCategoryChange={handleCategoryChange} />
                
                {category !== 'top' && (
                    <div style={styles.categoryFilterInfo}>
                        🔍 Showing only {category} news articles
                    </div>
                )}
            </div>

            {error && (
                <div style={styles.errorMessage}>
                    ⚠️ {error}
                </div>
            )}

            {searchResults && (
                <div style={styles.searchInfo}>
                    <div>
                        <span style={styles.searchQuery}>Search results for: "{lastSearchQuery}"</span>
                        <span style={styles.searchResultsCount}> ({searchResults.length} articles found)</span>
                    </div>
                    <div style={styles.buttonGroup}>
                        <button onClick={clearSearch} style={styles.clearSearchButton}>
                            ✕ Clear Search
                        </button>
                    </div>
                </div>
            )}

            {loading || searchLoading ? (
                <div style={styles.loadingSpinner}>
                    <div style={styles.spinner}></div>
                    <p>{searchLoading ? 'Searching news...' : 'Loading latest news...'}</p>
                </div>
            ) : (
                <>
                    <h2 style={styles.sectionTitle}>
                        {searchResults 
                            ? 'Search Results' 
                            : getCategoryTitle(category, country, (searchResults || filteredArticles).length)
                        }
                    </h2>
                    
                    {(searchResults || filteredArticles).length > 0 ? (
                        <div style={styles.newsGrid}>
                            {(searchResults || filteredArticles).map((article, index) => (
                                <NewsCard 
                                    key={article.article_id || article.title || index} 
                                    article={article} 
                                    country={country}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={styles.errorMessage}>
                            📰 No articles found. Try a different search or refresh the page.
                        </div>
                    )}

                    {!searchResults && (
                        <div style={styles.refreshSection}>
                            <button onClick={() => fetchNews()} style={styles.refreshButton}>
                                🔄 Refresh News
                            </button>
                            <p style={styles.lastUpdated}>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    )}
                </>
            )}
            
            <style>
                {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default NewsList;