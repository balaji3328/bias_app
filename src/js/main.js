import 'bootstrap/dist/js/bootstrap.bundle';
import { BiasCalculator } from './calculator';
import { StorageManager } from './storage';
import { ChartManager } from './chartManager';

// Initialize storage and chart managers
const storage = new StorageManager();
const chartManager = new ChartManager('chartContainer');

// DOM Elements
const biasForm = document.getElementById('biasForm');
const resultsContainer = document.getElementById('resultsContainer');
const historyContainer = document.getElementById('historyContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

/**
 * Update checklist based on bias - FIXED SELECTOR
 */
function updateChecklistByBias(bias) {
  // Find the checklist card body - more specific selector
  const checklistCards = document.querySelectorAll('.card');
  let checklistCard = null;
  
  // Find the card with "Pre-Trade Checklist" header
  checklistCards.forEach(card => {
    const header = card.querySelector('.card-header');
    if (header && header.textContent.includes('Pre-Trade Checklist')) {
      checklistCard = card;
    }
  });
  
  if (!checklistCard) {
    console.error('Checklist card not found');
    return;
  }
  
  const checklistBody = checklistCard.querySelector('.card-body');
  
  if (!checklistBody) {
    console.error('Checklist card body not found');
    return;
  }
  
  let checklistHTML = '';
  
  if (bias.includes('BULLISH')) {
    // BUY Checklist
    checklistHTML = `
      <div class="alert alert-success mb-3">
        <strong>🟢 BUY SETUP CHECKLIST</strong>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check1">
        <label class="form-check-label" for="check1">
          <strong>Asian's Low 2H FVG Identified:</strong> Locate unmitigated 2H FVG formed at Asian session low
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check2">
        <label class="form-check-label" for="check2">
          <strong>London Tap Confirmation:</strong> Price should tap the 2H FVG during London session
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check3">
        <label class="form-check-label" for="check3">
          <strong>Shift Confirmation Received:</strong> After tap, look for bullish market structure shift (BOS/CHoCH)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check4">
        <label class="form-check-label" for="check4">
          <strong>Inner Block Located:</strong> Inside 2H FVG, identify unmitigated lower timeframe order block (15m/5m)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check5">
        <label class="form-check-label" for="check5">
          <strong>Good Displacement Present:</strong> Strong bullish candle with minimal wicks after tap
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check6">
        <label class="form-check-label" for="check6">
          Risk-reward ratio acceptable (min 1:2)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check7">
        <label class="form-check-label" for="check7">
          Stop loss below FVG/Order Block
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check8">
        <label class="form-check-label" for="check8">
          Economic calendar checked for news conflicts
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check9">
        <label class="form-check-label" for="check9">
          Position size calculated (max 1-2% risk)
        </label>
      </div>
    `;
  } else if (bias.includes('BEARISH')) {
    // SELL Checklist
    checklistHTML = `
      <div class="alert alert-danger mb-3">
        <strong>🔴 SELL SETUP CHECKLIST</strong>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check1">
        <label class="form-check-label" for="check1">
          <strong>Asian's High 2H FVG Identified:</strong> Locate unmitigated 2H FVG formed at Asian session high
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check2">
        <label class="form-check-label" for="check2">
          <strong>London Tap Confirmation:</strong> Price should tap the 2H FVG during London session
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check3">
        <label class="form-check-label" for="check3">
          <strong>Shift Confirmation Received:</strong> After tap, look for bearish market structure shift (BOS/CHoCH)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check4">
        <label class="form-check-label" for="check4">
          <strong>Inner Block Located:</strong> Inside 2H FVG, identify unmitigated lower timeframe order block (15m/5m)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check5">
        <label class="form-check-label" for="check5">
          <strong>Good Displacement Present:</strong> Strong bearish candle with minimal wicks after tap
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check6">
        <label class="form-check-label" for="check6">
          Risk-reward ratio acceptable (min 1:2)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check7">
        <label class="form-check-label" for="check7">
          Stop loss above FVG/Order Block
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check8">
        <label class="form-check-label" for="check8">
          Economic calendar checked for news conflicts
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check9">
        <label class="form-check-label" for="check9">
          Position size calculated (max 1-2% risk)
        </label>
      </div>
    `;
  } else {
    // NEUTRAL - Default Checklist
    checklistHTML = `
      <div class="alert alert-warning mb-3">
        <strong>⚠️ NEUTRAL - GENERAL CHECKLIST</strong>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check1">
        <label class="form-check-label" for="check1">
          Bias direction confirmed
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check2">
        <label class="form-check-label" for="check2">
          Risk-reward ratio acceptable (min 1:2)
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check3">
        <label class="form-check-label" for="check3">
          Stop loss level identified
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check4">
        <label class="form-check-label" for="check4">
          Entry point matches order block/FVG
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check5">
        <label class="form-check-label" for="check5">
          Market structure aligns with bias
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check6">
        <label class="form-check-label" for="check6">
          Economic calendar checked
        </label>
      </div>
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="check7">
        <label class="form-check-label" for="check7">
          Position size calculated
        </label>
      </div>
    `;
  }
  
  // Add reset button
  checklistHTML += `
    <button class="btn btn-sm btn-outline-secondary mt-3 w-100" id="resetChecklistBtn">
      <i class="bi bi-arrow-clockwise"></i> Reset Checklist
    </button>
  `;
  
  // Update the checklist
  checklistBody.innerHTML = checklistHTML;
  
  // Re-attach event listeners
  const newCheckboxes = checklistBody.querySelectorAll('.form-check-input');
  newCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveChecklistState);
  });
  
  // Re-attach reset button listener
  const newResetBtn = document.getElementById('resetChecklistBtn');
  if (newResetBtn) {
    newResetBtn.addEventListener('click', handleResetChecklist);
  }
  
  // Load saved state
  loadChecklistState();
  
  console.log('✅ Checklist updated to:', bias);
}

/**
 * Initialize the application
 */
function init() {
  // Load history
  renderHistory();
  
  // Load checklist state
  loadChecklistState();
  
  // Event listeners
  biasForm.addEventListener('submit', handleFormSubmit);
  clearHistoryBtn.addEventListener('click', handleClearHistory);
  
  const resetChecklistBtn = document.getElementById('resetChecklistBtn');
  if (resetChecklistBtn) {
    resetChecklistBtn.addEventListener('click', handleResetChecklist);
  }
  
  // Checklist auto-save
  const checkboxes = document.querySelectorAll('.form-check-input');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', saveChecklistState);
  });
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
  e.preventDefault();
  
  // Get form data with OHLC
  const formData = {
    dbpdOpen: document.getElementById('dbpdOpen').value,
    dbpdHigh: document.getElementById('dbpdHigh').value,
    dbpdLow: document.getElementById('dbpdLow').value,
    dbpdClose: document.getElementById('dbpdClose').value,
    pdOpen: document.getElementById('pdOpen').value,
    pdHigh: document.getElementById('pdHigh').value,
    pdLow: document.getElementById('pdLow').value,
    pdClose: document.getElementById('pdClose').value,
    symbol: document.getElementById('symbol').value || 'N/A'
  };

  // Validate inputs
  if (!validateInputs(formData)) {
    return;
  }

  // Calculate bias FORECAST
  const calculator = new BiasCalculator(formData);
  const analysis = calculator.calculateBias();
  
  // Display results
  displayResults(analysis, formData);
  
  // ✅ UPDATE CHECKLIST BASED ON BIAS - with delay to ensure DOM is ready
  setTimeout(() => {
    updateChecklistByBias(analysis.bias);
  }, 100);
  
  // Save to history
  storage.saveAnalysis(formData, analysis);
  renderHistory();
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Validate form inputs
 */
function validateInputs(data) {
  // Validate D-2
  const dbpdH = parseFloat(data.dbpdHigh);
  const dbpdL = parseFloat(data.dbpdLow);
  const dbpdO = parseFloat(data.dbpdOpen);
  const dbpdC = parseFloat(data.dbpdClose);
  
  // Check if values are valid numbers
  if (isNaN(dbpdH) || isNaN(dbpdL) || isNaN(dbpdO) || isNaN(dbpdC)) {
    alert('❌ Day Before Previous: All fields must contain valid numbers');
    return false;
  }
  
  if (dbpdH <= dbpdL) {
    alert('❌ Day Before Previous: High must be greater than Low\n\nHigh: ' + data.dbpdHigh + '\nLow: ' + data.dbpdLow);
    return false;
  }
  
  if (dbpdO < dbpdL || dbpdO > dbpdH) {
    alert('❌ Day Before Previous: Open must be within High and Low range\n\nOpen: ' + data.dbpdOpen + '\nRange: ' + data.dbpdLow + ' - ' + data.dbpdHigh);
    return false;
  }
  
  if (dbpdC < dbpdL || dbpdC > dbpdH) {
    alert('❌ Day Before Previous: Close must be within High and Low range\n\nClose: ' + data.dbpdClose + '\nRange: ' + data.dbpdLow + ' - ' + data.dbpdHigh);
    return false;
  }
  
  // Validate D-1
  const pdH = parseFloat(data.pdHigh);
  const pdL = parseFloat(data.pdLow);
  const pdO = parseFloat(data.pdOpen);
  const pdC = parseFloat(data.pdClose);
  
  // Check if values are valid numbers
  if (isNaN(pdH) || isNaN(pdL) || isNaN(pdO) || isNaN(pdC)) {
    alert('❌ Previous Day: All fields must contain valid numbers');
    return false;
  }
  
  if (pdH <= pdL) {
    alert('❌ Previous Day: High must be greater than Low\n\nHigh: ' + data.pdHigh + '\nLow: ' + data.pdLow);
    return false;
  }
  
  if (pdO < pdL || pdO > pdH) {
    alert('❌ Previous Day: Open must be within High and Low range\n\nOpen: ' + data.pdOpen + '\nRange: ' + data.pdLow + ' - ' + data.pdHigh);
    return false;
  }
  
  if (pdC < pdL || pdC > pdH) {
    alert('❌ Previous Day: Close must be within High and Low range\n\nClose: ' + data.pdClose + '\nRange: ' + data.pdLow + ' - ' + data.pdHigh);
    return false;
  }
  
  return true;
}

/**
 * Display analysis results
 */
function displayResults(analysis, data) {
  const biasClass = analysis.bias.includes('BULLISH') ? 'bullish' : 
                   analysis.bias.includes('BEARISH') ? 'bearish' : 'neutral';
  
  const badgeClass = analysis.bias.includes('BULLISH') ? 'bg-success' : 
                    analysis.bias.includes('BEARISH') ? 'bg-danger' : 'bg-warning text-dark';
  
  const icon = analysis.bias.includes('BULLISH') ? '📈' : 
              analysis.bias.includes('BEARISH') ? '📉' : '↔️';

  let html = `
    <!-- Candlestick Chart Visualization -->
    <div class="card mb-3 shadow-sm">
      <div class="card-header bg-dark text-white">
        <h6 class="mb-0"><i class="bi bi-bar-chart-line"></i> Price Action Visualization</h6>
      </div>
      <div class="card-body p-2">
        <div id="chartContainer" style="width: 100%; height: 400px;"></div>
        <div class="mt-2 px-2">
          <small class="text-muted">
            <strong>Legend:</strong> 
            <span class="badge bg-info">🔵 D-2</span> = 2 Days Ago | 
            <span class="badge bg-info">🔵 D-1</span> = Yesterday | 
            <span class="badge ${badgeClass}">📍 TODAY</span> = Forecast Candle
          </small>
          <br>
          <small class="text-muted mt-1 d-block">
            <strong>Lines:</strong> 
            <span style="color: #26a69a;">━━</span> PD High | 
            <span style="color: #ef5350;">━━</span> PD Low | 
            <span style="color: #4CAF50;">┄┄</span> Buy Zone | 
            <span style="color: #F44336;">┄┄</span> Sell Zone
          </small>
        </div>
      </div>
    </div>

    <div class="bias-card ${biasClass} p-4 rounded-3 mb-3 fade-in">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">${icon} ${analysis.bias}</h3>
        <span class="badge ${badgeClass} badge-custom">${analysis.direction}</span>
      </div>
      
      <div class="progress mb-3" style="height: 25px;">
        <div class="progress-bar ${badgeClass}" role="progressbar" 
             style="width: ${analysis.strength}%;" 
             aria-valuenow="${analysis.strength}" aria-valuemin="0" aria-valuemax="100">
          Confidence: ${analysis.strength.toFixed(0)}%
        </div>
      </div>

      ${analysis.scenario.type ? `
        <div class="alert alert-primary mb-3">
          <h6 class="fw-bold mb-2">📋 Forecast Scenario</h6>
          <p class="mb-0">${analysis.scenario.type}</p>
        </div>
      ` : ''}

      <div class="mb-3">
        <h6 class="fw-bold">🔍 Analysis Details:</h6>
        <ul class="list-unstyled mb-0">
          ${analysis.reasoning.map(reason => `<li class="mb-1">• ${reason}</li>`).join('')}
        </ul>
      </div>

      <hr>
      <div class="alert alert-info mb-3">
        <strong>💡 Trading Plan:</strong> ${analysis.recommendation}
      </div>
    </div>

    <!-- Bullish Setup Card -->
    ${Object.keys(analysis.bullishSetup).length > 0 ? `
      <div class="card mb-3 border-success">
        <div class="card-header bg-success text-white">
          <h6 class="mb-0">🟢 BULLISH SETUP (BUY)</h6>
        </div>
        <div class="card-body">
          <div class="row mb-2">
            <div class="col-6"><strong>Sweep Level:</strong></div>
            <div class="col-6">${analysis.bullishSetup.sweepLevel}</div>
          </div>
          <div class="row mb-2">
            <div class="col-6"><strong>Entry Zone:</strong></div>
            <div class="col-6">${analysis.bullishSetup.entryZone}</div>
          </div>
          <div class="row mb-3">
            <div class="col-6"><strong>Stop Loss:</strong></div>
            <div class="col-6 text-danger">${analysis.bullishSetup.invalidation}</div>
          </div>
          <div>
            <strong>🎯 Targets:</strong>
            <ol class="mb-0 mt-2">
              ${analysis.bullishSetup.targets.map(t => 
                `<li><strong>${t.level}</strong> <small class="text-muted">(${t.label})</small></li>`
              ).join('')}
            </ol>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Bearish Setup Card -->
    ${Object.keys(analysis.bearishSetup).length > 0 ? `
      <div class="card mb-3 border-danger">
        <div class="card-header bg-danger text-white">
          <h6 class="mb-0">🔴 BEARISH SETUP (SELL)</h6>
        </div>
        <div class="card-body">
          <div class="row mb-2">
            <div class="col-6"><strong>Sweep Level:</strong></div>
            <div class="col-6">${analysis.bearishSetup.sweepLevel}</div>
          </div>
          <div class="row mb-2">
            <div class="col-6"><strong>Entry Zone:</strong></div>
            <div class="col-6">${analysis.bearishSetup.entryZone}</div>
          </div>
          <div class="row mb-3">
            <div class="col-6"><strong>Stop Loss:</strong></div>
            <div class="col-6 text-danger">${analysis.bearishSetup.invalidation}</div>
          </div>
          <div>
            <strong>🎯 Targets:</strong>
            <ol class="mb-0 mt-2">
              ${analysis.bearishSetup.targets.map(t => 
                `<li><strong>${t.level}</strong> <small class="text-muted">(${t.label})</small></li>`
              ).join('')}
            </ol>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Price Levels Summary -->
    <div class="card">
      <div class="card-body">
        <h6 class="card-title fw-bold mb-3">📊 OHLC Data Reference</h6>
        <div class="table-responsive">
          <table class="table table-sm table-bordered mb-3">
            <thead class="table-light">
              <tr>
                <th>Period</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Candle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>D-2</strong></td>
                <td>${data.dbpdOpen}</td>
                <td class="text-success fw-bold">${data.dbpdHigh}</td>
                <td class="text-danger fw-bold">${data.dbpdLow}</td>
                <td>${data.dbpdClose}</td>
                <td><span class="badge ${analysis.candleAnalysis.dbpd.isBullish ? 'bg-success' : analysis.candleAnalysis.dbpd.isBearish ? 'bg-danger' : 'bg-secondary'}">${analysis.candleAnalysis.dbpd.type}</span></td>
              </tr>
              <tr>
                <td><strong>D-1</strong></td>
                <td>${data.pdOpen}</td>
                <td class="text-success fw-bold">${data.pdHigh}</td>
                <td class="text-danger fw-bold">${data.pdLow}</td>
                <td>${data.pdClose}</td>
                <td><span class="badge ${analysis.candleAnalysis.pd.isBullish ? 'bg-success' : analysis.candleAnalysis.pd.isBearish ? 'bg-danger' : 'bg-secondary'}">${analysis.candleAnalysis.pd.type}</span></td>
              </tr>
            </tbody>
          </table>
          
          <div class="row">
            <div class="col-6">
              <small class="text-muted">
                <strong>D-2 Body:</strong> ${analysis.candleAnalysis.dbpd.bodyPercent}% of range<br>
                <strong>D-1 Body:</strong> ${analysis.candleAnalysis.pd.bodyPercent}% of range
              </small>
            </div>
            <div class="col-6">
              <small class="text-muted">
                <strong>D-2 Midpoint:</strong> ${analysis.keyLevels.dbpdMid.toFixed(5)}<br>
                <strong>D-1 Midpoint:</strong> ${analysis.keyLevels.pdMid.toFixed(5)}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set HTML first
  resultsContainer.innerHTML = html;

  // Use requestAnimationFrame for better DOM rendering timing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const chartContainer = document.getElementById('chartContainer');
      
      if (!chartContainer) {
        console.error('Chart container not found in DOM after rendering');
        return;
      }

      try {
        chartManager.renderChart(data, analysis);
        chartManager.addPriceLines(data, analysis);
      } catch (error) {
        console.error('Error rendering chart:', error);
        chartContainer.innerHTML = `
          <div class="alert alert-warning m-3">
            <strong>⚠️ Chart Rendering Error</strong>
            <p class="mb-1 small">${error.message}</p>
            <small class="text-muted">All analysis data is available below. Try refreshing the page if the chart doesn't load.</small>
          </div>
        `;
      }
    });
  });
}

/**
 * Render history
 */
function renderHistory() {
  const history = storage.getHistory();
  
  if (history.length === 0) {
    historyContainer.innerHTML = '<p class="text-muted text-center">No analysis history yet</p>';
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-hover history-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Symbol</th>
            <th>Bias</th>
            <th>Direction</th>
            <th>Strength</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
  `;

  history.forEach(entry => {
    const date = new Date(entry.timestamp);
    const timeStr = date.toLocaleString();
    const badgeClass = entry.analysis.bias.includes('BULLISH') ? 'bg-success' : 
                      entry.analysis.bias.includes('BEARISH') ? 'bg-danger' : 'bg-warning';

    html += `
      <tr>
        <td><small>${timeStr}</small></td>
        <td><strong>${entry.symbol}</strong></td>
        <td><span class="badge ${badgeClass}">${entry.analysis.bias}</span></td>
        <td>${entry.analysis.direction}</td>
        <td>
          <div class="progress" style="height: 20px; width: 80px;">
            <div class="progress-bar ${badgeClass}" style="width: ${entry.analysis.strength}%">
              ${entry.analysis.strength.toFixed(0)}%
            </div>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteHistoryEntry(${entry.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  historyContainer.innerHTML = html;
}

/**
 * Delete history entry
 */
window.deleteHistoryEntry = function(id) {
  if (confirm('Delete this entry?')) {
    storage.deleteEntry(id);
    renderHistory();
  }
};

/**
 * Clear all history
 */
function handleClearHistory() {
  if (confirm('Clear all analysis history?')) {
    storage.clearHistory();
    renderHistory();
  }
}

/**
 * Reset checklist
 */
function handleResetChecklist() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
  });
  saveChecklistState();
}

/**
 * Save checklist state
 */
function saveChecklistState() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  const state = {};
  
  checkboxes.forEach(checkbox => {
    state[checkbox.id] = checkbox.checked;
  });
  
  storage.saveChecklistState(state);
}

/**
 * Load checklist state
 */
function loadChecklistState() {
  const state = storage.getChecklistState();
  
  Object.keys(state).forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = state[id];
    }
  });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
