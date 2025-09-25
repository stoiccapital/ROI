# Samsara ROI Calculator - Simplified

A lean, single-page ROI calculator that quantifies savings from Samsara telematics and AI dashcams.

## 🚀 Quick Start

1. Open `index.html` in a modern web browser
2. Adjust the input parameters
3. View real-time results: **Payback Period**, **ROI %**, and **Annual Savings**

## ✨ Features

- **Ultra-lightweight**: Single 200-line JavaScript file
- **Real-time calculations**: Updates as you type
- **Essential metrics**: Payback, ROI, and Annual Savings only
- **Three example scenarios**: Courier, Bus, and Taxi fleets
- **Multi-currency support**: EUR, USD, GBP
- **No dependencies**: Pure vanilla HTML, CSS, and JavaScript

## 🔧 Structure

```
Business.case/
├── index.html              # Main calculator page
├── assets/styles.css       # Styling (unchanged)
├── src/simple-calc.js      # Single calculator file (~200 lines)
└── backup/                 # Complex version backup
```

## 📊 What It Calculates

### Savings
- **Fuel Savings**: Based on consumption reduction %
- **Accident Savings**: Based on accident reduction %  
- **Insurance Savings**: Based on premium reduction %

### Costs
- **Hardware**: One-time equipment cost per vehicle
- **Subscription**: Monthly software cost per vehicle
- **Implementation**: One-time setup costs
- **Training**: One-time training costs

### Key Metrics
- **Payback Period**: Time to recover initial investment (months)
- **ROI**: Return on investment over time horizon (%)
- **Annual Savings**: Total yearly savings amount

## 🧮 Example Results

**Default Fleet (50 vehicles):**
- Payback Period: **8 months**
- ROI: **92%** (over 3 years)
- Annual Savings: **€53,939**

## 💡 What Was Removed

Eliminated from the complex version:
- ❌ NPV and IRR calculations
- ❌ Complex timeline modeling
- ❌ Advanced scenarios and toggles
- ❌ Chart rendering
- ❌ Export functionality
- ❌ Input validation system
- ❌ State management
- ❌ Multiple modules and files

## 🎯 Perfect For

- Quick ROI estimates
- Sales demonstrations  
- Initial business case development
- Teams who want simplicity over complexity

## 📝 Disclaimer

Results are estimates based on user inputs and typical industry ranges. Actual outcomes vary.
