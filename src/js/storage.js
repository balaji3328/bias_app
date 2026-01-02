/**
 * Local Storage Manager for Analysis History
 */

export class StorageManager {
    constructor() {
      this.storageKey = 'tradingBiasHistory';
      this.maxHistoryItems = 20;
    }
  
    /**
     * Save analysis to history
     */
    saveAnalysis(data, analysis) {
      const history = this.getHistory();
      
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        symbol: data.symbol || 'N/A',
        data: data,
        analysis: analysis
      };
  
      history.unshift(entry);
  
      // Keep only last maxHistoryItems
      if (history.length > this.maxHistoryItems) {
        history.pop();
      }
  
      localStorage.setItem(this.storageKey, JSON.stringify(history));
      return entry;
    }
  
    /**
     * Get all history
     */
    getHistory() {
      try {
        const history = localStorage.getItem(this.storageKey);
        return history ? JSON.parse(history) : [];
      } catch (error) {
        console.error('Error reading history:', error);
        return [];
      }
    }
  
    /**
     * Clear all history
     */
    clearHistory() {
      localStorage.removeItem(this.storageKey);
    }
  
    /**
     * Delete specific entry
     */
    deleteEntry(id) {
      const history = this.getHistory();
      const filtered = history.filter(entry => entry.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }
  
    /**
     * Save checklist state
     */
    saveChecklistState(checklistState) {
      localStorage.setItem('tradingChecklist', JSON.stringify(checklistState));
    }
  
    /**
     * Get checklist state
     */
    getChecklistState() {
      try {
        const state = localStorage.getItem('tradingChecklist');
        return state ? JSON.parse(state) : {};
      } catch (error) {
        return {};
      }
    }
  }
  