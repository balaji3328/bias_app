/**
 * Trading Bias Forecaster with Candle Analysis
 * Predicts current day's bias based on previous two days' OHLC data
 */

export class BiasCalculator {
    constructor(data) {
      // D-2 (Day Before Previous Day)
      this.dbpdHigh = parseFloat(data.dbpdHigh);
      this.dbpdLow = parseFloat(data.dbpdLow);
      this.dbpdOpen = parseFloat(data.dbpdOpen);
      this.dbpdClose = parseFloat(data.dbpdClose);
      
      // D-1 (Previous Day)
      this.pdHigh = parseFloat(data.pdHigh);
      this.pdLow = parseFloat(data.pdLow);
      this.pdOpen = parseFloat(data.pdOpen);
      this.pdClose = parseFloat(data.pdClose);
      
      this.symbol = data.symbol || 'N/A';
      
      // Calculate candle properties
      this.dbpdCandle = this.analyzeCandleType(this.dbpdOpen, this.dbpdClose, this.dbpdHigh, this.dbpdLow);
      this.pdCandle = this.analyzeCandleType(this.pdOpen, this.pdClose, this.pdHigh, this.pdLow);
      
      // Calculate ranges and midpoints
      this.pdMidpoint = (this.pdHigh + this.pdLow) / 2;
      this.pdRange = this.pdHigh - this.pdLow;
      this.dbpdMidpoint = (this.dbpdHigh + this.dbpdLow) / 2;
      this.dbpdRange = this.dbpdHigh - this.dbpdLow;
    }
  
    /**
     * Analyze candle type and characteristics
     */
    analyzeCandleType(open, close, high, low) {
      const body = Math.abs(close - open);
      const range = high - low;
      const bodyPercent = (body / range) * 100;
      
      const upperWick = high - Math.max(open, close);
      const lowerWick = Math.min(open, close) - low;
      
      const isBullish = close > open;
      const isBearish = close < open;
      const isDoji = bodyPercent < 10;
      
      let type = 'NEUTRAL';
      let strength = 0;
      
      if (isDoji) {
        type = 'DOJI';
        strength = 0;
      } else if (isBullish) {
        if (bodyPercent > 70) {
          type = 'STRONG BULLISH';
          strength = 3;
        } else if (bodyPercent > 50) {
          type = 'BULLISH';
          strength = 2;
        } else {
          type = 'WEAK BULLISH';
          strength = 1;
        }
      } else if (isBearish) {
        if (bodyPercent > 70) {
          type = 'STRONG BEARISH';
          strength = -3;
        } else if (bodyPercent > 50) {
          type = 'BEARISH';
          strength = -2;
        } else {
          type = 'WEAK BEARISH';
          strength = -1;
        }
      }
      
      // Check for rejection candles
      const hasUpperWickRejection = upperWick > body * 2;
      const hasLowerWickRejection = lowerWick > body * 2;
      
      return {
        type,
        isBullish,
        isBearish,
        isDoji,
        strength,
        body,
        bodyPercent: bodyPercent.toFixed(1),
        upperWick,
        lowerWick,
        hasUpperWickRejection,
        hasLowerWickRejection,
        open,
        close,
        high,
        low
      };
    }
  
    /**
     * Main calculation method
     */
    calculateBias() {
      const analysis = {
        bias: 'NEUTRAL',
        direction: 'No Clear Direction',
        strength: 0,
        reasoning: [],
        candleAnalysis: {
          dbpd: this.dbpdCandle,
          pd: this.pdCandle
        },
        scenario: {},
        recommendation: '',
        bullishSetup: {},
        bearishSetup: {},
        keyLevels: {},
        confluence: 0
      };
  
      // Analyze candle patterns
      this.analyzeCandlePatterns(analysis);
      
      // Analyze price structure
      this.analyzePriceStructure(analysis);
      
      // Analyze liquidity and sweeps
      this.analyzeLiquiditySweeps(analysis);
      
      // Determine forecast bias
      this.determineForecastBias(analysis);
      
      // Generate trading scenarios
      this.generateTradingScenarios(analysis);
  
      return analysis;
    }
  
    /**
     * Analyze candle patterns and momentum
     */
    analyzeCandlePatterns(analysis) {
      // Add candle info to reasoning
      analysis.reasoning.push(`📊 D-2 Candle: ${this.dbpdCandle.type} (Body: ${this.dbpdCandle.bodyPercent}%)`);
      analysis.reasoning.push(`📊 D-1 Candle: ${this.pdCandle.type} (Body: ${this.pdCandle.bodyPercent}%)`);
      
      // Two consecutive bullish candles
      if (this.dbpdCandle.isBullish && this.pdCandle.isBullish) {
        analysis.confluence += 2;
        analysis.reasoning.push(`✅ Two consecutive BULLISH candles - Strong upward momentum`);
      }
      
      // Two consecutive bearish candles
      if (this.dbpdCandle.isBearish && this.pdCandle.isBearish) {
        analysis.confluence -= 2;
        analysis.reasoning.push(`✅ Two consecutive BEARISH candles - Strong downward momentum`);
      }
      
      // Reversal pattern: Bullish after bearish
      if (this.dbpdCandle.isBearish && this.pdCandle.isBullish) {
        analysis.confluence += 1;
        analysis.reasoning.push(`🔄 REVERSAL: Bearish to Bullish candle - Potential trend change UP`);
        analysis.scenario.reversalUp = true;
      }
      
      // Reversal pattern: Bearish after bullish
      if (this.dbpdCandle.isBullish && this.pdCandle.isBearish) {
        analysis.confluence -= 1;
        analysis.reasoning.push(`🔄 REVERSAL: Bullish to Bearish candle - Potential trend change DOWN`);
        analysis.scenario.reversalDown = true;
      }
      
      // Check for rejection wicks
      if (this.pdCandle.hasUpperWickRejection) {
        analysis.confluence -= 1;
        analysis.reasoning.push(`🕯️ Previous day has UPPER WICK REJECTION - Sellers active at highs`);
        analysis.scenario.upperRejection = true;
      }
      
      if (this.pdCandle.hasLowerWickRejection) {
        analysis.confluence += 1;
        analysis.reasoning.push(`🕯️ Previous day has LOWER WICK REJECTION - Buyers active at lows`);
        analysis.scenario.lowerRejection = true;
      }
      
      // Doji analysis (indecision)
      if (this.pdCandle.isDoji) {
        analysis.reasoning.push(`⚠️ Previous day DOJI candle - Market indecision, expect breakout`);
        analysis.scenario.indecision = true;
      }
      
      // Strong candle momentum
      if (this.pdCandle.strength >= 2) {
        analysis.reasoning.push(`💪 Strong bullish momentum - Expect continuation or pullback to buy`);
      } else if (this.pdCandle.strength <= -2) {
        analysis.reasoning.push(`💪 Strong bearish momentum - Expect continuation or pullback to sell`);
      }
    }
  
    /**
     * Analyze price structure and breakouts
     */
    analyzePriceStructure(analysis) {
      // Previous day broke above D-2 high
      if (this.pdHigh > this.dbpdHigh) {
        analysis.scenario.breakoutHigh = true;
        analysis.confluence += 1;
        analysis.reasoning.push(`📈 PD HIGH (${this.pdHigh}) broke D-2 HIGH (${this.dbpdHigh})`);
        
        // Check if close also above
        if (this.pdClose > this.dbpdHigh) {
          analysis.confluence += 1;
          analysis.reasoning.push(`✅ PD CLOSED above D-2 high - Strong bullish structure`);
        } else {
          analysis.reasoning.push(`⚠️ PD swept high but closed inside - Potential fake breakout`);
          analysis.scenario.fakeBreakoutHigh = true;
        }
      }
      
      // Previous day broke below D-2 low
      if (this.pdLow < this.dbpdLow) {
        analysis.scenario.breakoutLow = true;
        analysis.confluence -= 1;
        analysis.reasoning.push(`📉 PD LOW (${this.pdLow}) broke D-2 LOW (${this.dbpdLow})`);
        
        // Check if close also below
        if (this.pdClose < this.dbpdLow) {
          analysis.confluence -= 1;
          analysis.reasoning.push(`✅ PD CLOSED below D-2 low - Strong bearish structure`);
        } else {
          analysis.reasoning.push(`⚠️ PD swept low but closed inside - Potential fake breakout`);
          analysis.scenario.fakeBreakoutLow = true;
        }
      }
      
      // Inside bar pattern
      if (this.pdHigh <= this.dbpdHigh && this.pdLow >= this.dbpdLow) {
        analysis.scenario.insideBar = true;
        analysis.reasoning.push(`📦 INSIDE BAR pattern - Consolidation, expect explosive move`);
      }
      
      // Outside bar pattern (engulfing)
      if (this.pdHigh > this.dbpdHigh && this.pdLow < this.dbpdLow) {
        analysis.scenario.outsideBar = true;
        analysis.reasoning.push(`💥 OUTSIDE BAR pattern - High volatility range`);
        
        // Determine direction based on close
        if (this.pdClose > this.pdOpen) {
          analysis.reasoning.push(`✅ Outside bar closed BULLISH - Buyers won the battle`);
          analysis.confluence += 2;
        } else {
          analysis.reasoning.push(`✅ Outside bar closed BEARISH - Sellers won the battle`);
          analysis.confluence -= 2;
        }
      }
      
      // Higher highs and higher lows (uptrend)
      if (this.pdHigh > this.dbpdHigh && this.pdLow > this.dbpdLow) {
        analysis.scenario.uptrend = true;
        analysis.reasoning.push(`📈 HIGHER HIGHS & HIGHER LOWS - Clear uptrend structure`);
        analysis.confluence += 2;
      }
      
      // Lower highs and lower lows (downtrend)
      if (this.pdHigh < this.dbpdHigh && this.pdLow < this.dbpdLow) {
        analysis.scenario.downtrend = true;
        analysis.reasoning.push(`📉 LOWER HIGHS & LOWER LOWS - Clear downtrend structure`);
        analysis.confluence -= 2;
      }
    }
  
    /**
     * Analyze liquidity sweeps and potential setups
     */
    analyzeLiquiditySweeps(analysis) {
      analysis.keyLevels = {
        pdHigh: this.pdHigh,
        pdLow: this.pdLow,
        pdOpen: this.pdOpen,
        pdClose: this.pdClose,
        pdMid: this.pdMidpoint,
        dbpdHigh: this.dbpdHigh,
        dbpdLow: this.dbpdLow,
        dbpdOpen: this.dbpdOpen,
        dbpdClose: this.dbpdClose,
        dbpdMid: this.dbpdMidpoint
      };
      
      // Identify where close is relative to range
      const pdClosePosition = ((this.pdClose - this.pdLow) / this.pdRange) * 100;
      
      if (pdClosePosition > 75) {
        analysis.reasoning.push(`📊 PD closed in upper 25% of range - Bullish close position`);
        analysis.confluence += 1;
      } else if (pdClosePosition < 25) {
        analysis.reasoning.push(`📊 PD closed in lower 25% of range - Bearish close position`);
        analysis.confluence -= 1;
      } else {
        analysis.reasoning.push(`📊 PD closed in middle of range - Neutral position`);
      }
    }
  
    /**
     * Determine forecast bias for current day
     */
    determineForecastBias(analysis) {
      // === SCENARIO 1: FAKE BREAKOUT HIGH (BEARISH REVERSAL) ===
      if (analysis.scenario.fakeBreakoutHigh) {
        analysis.bias = 'BEARISH REVERSAL';
        analysis.direction = 'LOOK FOR SELL';
        analysis.strength = 85;
        analysis.reasoning.unshift(`🎯 FORECAST: Swept D-2 high but closed inside = SELL THE HIGH (liquidity grab)`);
        
        analysis.bearishSetup = {
          sweepLevel: this.pdHigh,
          entryZone: `${this.pdHigh} - ${(this.pdHigh * 1.0005).toFixed(5)}`,
          invalidation: (this.pdHigh + this.pdRange * 0.3).toFixed(5),
          targets: [
            { level: this.pdClose.toFixed(5), label: 'PD Close' },
            { level: this.pdLow.toFixed(5), label: 'PD Low' },
            { level: this.dbpdLow.toFixed(5), label: 'D-2 Low' }
          ]
        };
        return;
      }
      
      // === SCENARIO 2: FAKE BREAKOUT LOW (BULLISH REVERSAL) ===
      if (analysis.scenario.fakeBreakoutLow) {
        analysis.bias = 'BULLISH REVERSAL';
        analysis.direction = 'LOOK FOR BUY';
        analysis.strength = 85;
        analysis.reasoning.unshift(`🎯 FORECAST: Swept D-2 low but closed inside = BUY THE DIP (liquidity grab)`);
        
        analysis.bullishSetup = {
          sweepLevel: this.pdLow,
          entryZone: `${(this.pdLow * 0.9995).toFixed(5)} - ${this.pdLow}`,
          invalidation: (this.pdLow - this.pdRange * 0.3).toFixed(5),
          targets: [
            { level: this.pdClose.toFixed(5), label: 'PD Close' },
            { level: this.pdHigh.toFixed(5), label: 'PD High' },
            { level: this.dbpdHigh.toFixed(5), label: 'D-2 High' }
          ]
        };
        return;
      }
      
      // === SCENARIO 3: STRONG UPTREND CONTINUATION ===
      if (analysis.scenario.uptrend && this.pdCandle.isBullish) {
        analysis.bias = 'BULLISH CONTINUATION';
        analysis.direction = 'BUY PULLBACKS';
        analysis.strength = Math.min(75 + (analysis.confluence * 3), 95);
        analysis.reasoning.unshift(`🎯 FORECAST: Strong uptrend + bullish close = BUY dips to PD low`);
        
        analysis.bullishSetup = {
          sweepLevel: this.pdLow,
          entryZone: `${(this.pdLow - this.pdRange * 0.2).toFixed(5)} - ${this.pdLow}`,
          invalidation: this.dbpdLow.toFixed(5),
          targets: [
            { level: this.pdHigh.toFixed(5), label: 'Equal PD High' },
            { level: (this.pdHigh + this.pdRange * 0.5).toFixed(5), label: 'Extension 1' },
            { level: (this.pdHigh + this.pdRange).toFixed(5), label: 'Extension 2' }
          ]
        };
        return;
      }
      
      // === SCENARIO 4: STRONG DOWNTREND CONTINUATION ===
      if (analysis.scenario.downtrend && this.pdCandle.isBearish) {
        analysis.bias = 'BEARISH CONTINUATION';
        analysis.direction = 'SELL RALLIES';
        analysis.strength = Math.min(75 + (Math.abs(analysis.confluence) * 3), 95);
        analysis.reasoning.unshift(`🎯 FORECAST: Strong downtrend + bearish close = SELL rallies to PD high`);
        
        analysis.bearishSetup = {
          sweepLevel: this.pdHigh,
          entryZone: `${this.pdHigh} - ${(this.pdHigh + this.pdRange * 0.2).toFixed(5)}`,
          invalidation: this.dbpdHigh.toFixed(5),
          targets: [
            { level: this.pdLow.toFixed(5), label: 'Equal PD Low' },
            { level: (this.pdLow - this.pdRange * 0.5).toFixed(5), label: 'Extension 1' },
            { level: (this.pdLow - this.pdRange).toFixed(5), label: 'Extension 2' }
          ]
        };
        return;
      }
      
      // === SCENARIO 5: INSIDE BAR BREAKOUT (BOTH WAYS) ===
      if (analysis.scenario.insideBar) {
        analysis.reasoning.unshift(`🎯 FORECAST: Inside bar = Trade breakout direction`);
        
        // Bias based on candle close
        if (this.pdCandle.isBullish) {
          analysis.bias = 'BULLISH BREAKOUT';
          analysis.direction = 'BUY ABOVE PD HIGH';
          analysis.strength = 70;
        } else if (this.pdCandle.isBearish) {
          analysis.bias = 'BEARISH BREAKOUT';
          analysis.direction = 'SELL BELOW PD LOW';
          analysis.strength = 70;
        } else {
          analysis.bias = 'NEUTRAL - WAIT';
          analysis.direction = 'TRADE BREAKOUT';
          analysis.strength = 50;
        }
        
        // Setup both directions
        analysis.bullishSetup = {
          sweepLevel: this.pdHigh,
          entryZone: `${this.pdHigh} - ${(this.pdHigh * 1.001).toFixed(5)}`,
          invalidation: this.pdLow.toFixed(5),
          targets: [
            { level: this.dbpdHigh.toFixed(5), label: 'D-2 High' },
            { level: (this.dbpdHigh + this.pdRange).toFixed(5), label: 'Measured Move' }
          ]
        };
        
        analysis.bearishSetup = {
          sweepLevel: this.pdLow,
          entryZone: `${(this.pdLow * 0.999).toFixed(5)} - ${this.pdLow}`,
          invalidation: this.pdHigh.toFixed(5),
          targets: [
            { level: this.dbpdLow.toFixed(5), label: 'D-2 Low' },
            { level: (this.dbpdLow - this.pdRange).toFixed(5), label: 'Measured Move' }
          ]
        };
        return;
      }
      
      // === GENERAL BIAS BASED ON CONFLUENCE ===
      if (analysis.confluence >= 3) {
        analysis.bias = 'BULLISH';
        analysis.direction = 'LOOK FOR BUY SETUPS';
        analysis.strength = Math.min(60 + (analysis.confluence * 5), 95);
        
        analysis.bullishSetup = {
          sweepLevel: this.pdLow,
          entryZone: `${(this.pdLow - this.pdRange * 0.15).toFixed(5)} - ${this.pdLow}`,
          invalidation: this.dbpdLow.toFixed(5),
          targets: [
            { level: this.pdHigh.toFixed(5), label: 'PD High' },
            { level: (this.pdHigh + this.pdRange * 0.618).toFixed(5), label: '1.618 Extension' }
          ]
        };
      } else if (analysis.confluence <= -3) {
        analysis.bias = 'BEARISH';
        analysis.direction = 'LOOK FOR SELL SETUPS';
        analysis.strength = Math.min(60 + (Math.abs(analysis.confluence) * 5), 95);
        
        analysis.bearishSetup = {
          sweepLevel: this.pdHigh,
          entryZone: `${this.pdHigh} - ${(this.pdHigh + this.pdRange * 0.15).toFixed(5)}`,
          invalidation: this.dbpdHigh.toFixed(5),
          targets: [
            { level: this.pdLow.toFixed(5), label: 'PD Low' },
            { level: (this.pdLow - this.pdRange * 0.618).toFixed(5), label: '1.618 Extension' }
          ]
        };
      } else {
        analysis.bias = 'NEUTRAL';
        analysis.direction = 'WAIT FOR CLEAR SIGNAL';
        analysis.strength = 50;
        analysis.reasoning.unshift(`⚠️ Mixed signals - No clear bias. Wait for price action confirmation.`);
      }
    }
  
    /**
     * Generate trading scenarios and recommendations
     */
    generateTradingScenarios(analysis) {
      if (analysis.bias.includes('BULLISH')) {
        analysis.recommendation = `Watch for price to sweep or approach ${analysis.bullishSetup.sweepLevel}, then look for bullish confirmation (rejection wick, bullish engulfing, etc.) for BUY entry.`;
      } else if (analysis.bias.includes('BEARISH')) {
        analysis.recommendation = `Watch for price to sweep or approach ${analysis.bearishSetup.sweepLevel}, then look for bearish confirmation (rejection wick, bearish engulfing, etc.) for SELL entry.`;
      } else {
        analysis.recommendation = `No clear bias. Wait for price to break and close above ${this.pdHigh} (bullish) or below ${this.pdLow} (bearish) before entering trades.`;
      }
    }
  }
  