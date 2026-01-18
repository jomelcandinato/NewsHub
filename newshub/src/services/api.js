import axios from 'axios';

const API_KEY = process.env.REACT_APP_NEWS_API_KEY || 'pub_0755496150ae44728c2f6498fa4172b5'; 
const BASE_URL = 'https://newsdata.io/api/1';

class NewsAPI {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      params: {
        apikey: API_KEY,
      },
    });
  }

  // Helper function to filter unwanted sources for Philippines
  filterSourcesForPhilippines(articles) {
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
    
    return articles.filter(article => {
      const sourceName = article.source_name || '';
      return !unwantedSources.some(unwanted => 
        sourceName.toLowerCase().includes(unwanted.toLowerCase())
      );
    });
  }

  async getLatestNews(country = 'ph', category = null) {
    try {
      console.log(`Fetching news for country: ${country}, category: ${category}`);
      
      let params = {
        language: 'en',
      };

      // Set country parameter
      if (country === 'ph') {
        params.country = 'ph';
      } else {
        // For worldwide, use multiple countries
        params.country = 'us,gb,au,in,ca';
      }

      // Only add category if it's not null and not 'top'
      if (category && category !== 'top') {
        params.category = category;
      }

      console.log('API params:', params);
      
      const response = await this.api.get('/news', { params });
      console.log('API response status:', response.status);
      console.log('Total articles received:', response.data.results?.length || 0);
      
      let results = response.data.results || [];
      
      // Filter unwanted sources if country is Philippines
      if (country === 'ph') {
        const beforeFilter = results.length;
        results = this.filterSourcesForPhilippines(results);
        const afterFilter = results.length;
        console.log(`Filtered ${beforeFilter - afterFilter} unwanted sources for Philippines`);
      }
      
      return { ...response.data, results };
    } catch (error) {
      console.error('Error fetching news:', error);
      console.log('Returning empty results due to API error');
      
      // Return empty results - mock data will be handled in NewsList
      return { results: [] };
    }
  }

  async searchNews(query, country = 'ph') {
    try {
      const params = {
        q: query,
        language: 'en',
      };

      // Set country parameter
      if (country === 'ph') {
        params.country = 'ph';
      } else {
        params.country = 'us,gb,au,in,ca';
      }

      console.log('Searching news with params:', params);
      
      const response = await this.api.get('/news', { params });
      
      let results = response.data.results || [];
      
      // Filter unwanted sources if country is Philippines
      if (country === 'ph') {
        results = this.filterSourcesForPhilippines(results);
      }
      
      return { ...response.data, results };
    } catch (error) {
      console.error('Error searching news:', error);
      
      // Return empty results
      return { results: [] };
    }
  }

  async getNewsByCategory(category, country = 'ph') {
    try {
      let params = {
        language: 'en',
      };

      // Set country parameter
      if (country === 'ph') {
        params.country = 'ph';
      } else {
        params.country = 'us,gb,au,in,ca';
      }

      // Category is required for all calls now, except 'top'
      if (category && category !== 'top') {
        params.category = category;
      }

      console.log('Fetching category news with params:', params);
      
      const response = await this.api.get('/news', { params });
      
      let results = response.data.results || [];
      
      // Filter unwanted sources if country is Philippines
      if (country === 'ph') {
        results = this.filterSourcesForPhilippines(results);
      }
      
      return { ...response.data, results };
    } catch (error) {
      console.error('Error fetching category news:', error);
      
      // Return empty results - mock data will be handled in NewsList
      return { results: [] };
    }
  }
}

// Create instance and export to fix ESLint warning
const newsAPI = new NewsAPI();
export default newsAPI;