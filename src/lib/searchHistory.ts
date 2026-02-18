const SEARCH_HISTORY_KEY = 'youtube_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const history = getSearchHistory();
    
    // Remove if already exists (to move to top)
    const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    // Add to beginning
    const newHistory = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

/**
 * Remove a specific item from search history
 */
export function removeFromSearchHistory(query: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getSearchHistory();
    const filtered = history.filter(item => item !== query);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove from search history:', error);
  }
}
