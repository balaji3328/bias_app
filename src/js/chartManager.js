import { createChart } from 'lightweight-charts';

export class ChartManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.chart = null;
    this.candleSeries = null;
    this.resizeObserver = null;
  }

  /* =========================
     INITIALIZE CHART
  ========================== */
  initChart() {
    this.container = document.getElementById(this.containerId);

    if (!this.container) {
      throw new Error(`Chart container #${this.containerId} not found`);
    }

    // Cleanup previous chart
    this.destroy();

    const width = this.container.clientWidth || 600;
    const height = 400;

    this.chart = createChart(this.container, {
      width,
      height,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#e1e4e8' },
        horzLines: { color: '#e1e4e8' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#D1D4DC',
      },
      rightPriceScale: {
        borderColor: '#D1D4DC',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      crosshair: {
        mode: 1,
      },
    });

    // ✅ Candlestick series (v4 correct API)
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    this.setupResizeObserver();
  }                                                                                                                                                                                                                                                                                                                                                     

  /* =========================
     RESPONSIVE RESIZE
  ========================== */
  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(entries => {
        const { width } = entries[0].contentRect;
        if (width > 0 && this.chart) {
          this.chart.applyOptions({ width });
        }
      });
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', () => {
        if (this.chart && this.container) {
          this.chart.applyOptions({
            width: this.container.clientWidth,
          });
        }
      });
    }
  }

  /* =========================
     RENDER CHART
  ========================== */
  renderChart(data, analysis) {
    this.initChart();

    const now = Math.floor(Date.now() / 1000);
    const day = 86400;

    const candles = [
      {
        time: now - 2 * day,
        open: +data.dbpdOpen,
        high: +data.dbpdHigh,
        low: +data.dbpdLow,
        close: +data.dbpdClose,
      },
      {
        time: now - day,
        open: +data.pdOpen,
        high: +data.pdHigh,
        low: +data.pdLow,
        close: +data.pdClose,
      },
      {
        time: now,
        ...this.generateForecastCandle(data, analysis),
      },
    ];

    this.candleSeries.setData(candles);
    this.addMarkers(analysis, now);
    this.addPriceLines(data, analysis);

    this.chart.timeScale().fitContent();
  }

  /* =========================
     FORECAST CANDLE LOGIC
  ========================== */
  generateForecastCandle(data, analysis) {
    const pdHigh = +data.pdHigh;
    const pdLow = +data.pdLow;
    const pdClose = +data.pdClose;
    const range = pdHigh - pdLow;

    let candle = {
      open: pdClose,
      high: pdHigh,
      low: pdLow,
      close: pdClose,
    };

    if (analysis.bias?.includes('BULLISH')) {
      candle.low = pdLow - range * 0.05;
      candle.high = pdHigh + range * 0.5;
      candle.close = candle.high * 0.98;
    }

    if (analysis.bias?.includes('BEARISH')) {
      candle.high = pdHigh + range * 0.05;
      candle.low = pdLow - range * 0.5;
      candle.close = candle.low * 1.02;
    }

    return candle;
  }

  /* =========================
     MARKERS
  ========================== */
  addMarkers(analysis, todayTime) {
    const bias = analysis.bias || 'NEUTRAL';

    this.candleSeries.setMarkers([
      {
        time: todayTime,
        position: 'aboveBar',
        color:
          bias === 'BULLISH'
            ? '#26a69a'
            : bias === 'BEARISH'
            ? '#ef5350'
            : '#FFA726',
        shape: 'arrowDown',
        text: bias,
      },
    ]);
  }

  /* =========================
     PRICE LINES
  ========================== */
  addPriceLines(data, analysis) {
    this.candleSeries.createPriceLine({
      price: +data.pdHigh,
      color: '#26a69a',
      lineWidth: 2,
      title: 'PDH',
    });

    this.candleSeries.createPriceLine({
      price: +data.pdLow,
      color: '#ef5350',
      lineWidth: 2,
      title: 'PDL',
    });

    if (analysis.bullishSetup?.sweepLevel) {
      this.candleSeries.createPriceLine({
        price: +analysis.bullishSetup.sweepLevel,
        color: '#4CAF50',
        lineStyle: 2,
        title: 'Buy Zone',
      });
    }

    if (analysis.bearishSetup?.sweepLevel) {
      this.candleSeries.createPriceLine({
        price: +analysis.bearishSetup.sweepLevel,
        color: '#F44336',
        lineStyle: 2,
        title: 'Sell Zone',
      });
    }
  }

  /* =========================
     CLEANUP
  ========================== */
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }

    this.candleSeries = null;
  }
}
