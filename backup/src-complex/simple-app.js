/**
 * Simple ROI Calculator App
 */

'use strict';

import { defaultInputs, exampleData, formatCurrency, formatNumber } from './simple-state.js';
import { calculateROI, applyScenario } from './simple-formulas.js';

class SimpleROICalculator {
    constructor() {
        this.currentInputs = { ...defaultInputs };
        this.currentScenario = 'base';
        this.init();
    }
    
    init() {
        console.log('🚀 Simple ROI Calculator starting...');
        
        // Load inputs from URL if present
        this.loadFromURL();
        
        // Set up DOM elements
        this.setupInputs();
        this.setupButtons();
        
        // Calculate initial results
        this.calculate();
        
        console.log('✅ Calculator ready!');
    }
    
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        for (const [key, value] of params.entries()) {
            if (key in this.currentInputs) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    this.currentInputs[key] = numValue;
                } else {
                    this.currentInputs[key] = value;
                }
            }
        }
    }
    
    setupInputs() {
        // Get all input elements and set their values
        Object.keys(this.currentInputs).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = this.currentInputs[key];
                element.addEventListener('input', () => this.handleInputChange(key, element.value));
            }
        });
    }
    
    setupButtons() {
        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const example = e.target.getAttribute('data-example');
                this.loadExample(example);
            });
        });
        
        // Scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.target.getAttribute('data-scenario');
                this.setScenario(scenario);
            });
        });
    }
    
    handleInputChange(key, value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            this.currentInputs[key] = numValue;
        } else {
            this.currentInputs[key] = value;
        }
        
        // Debounce calculation
        clearTimeout(this.calculateTimeout);
        this.calculateTimeout = setTimeout(() => this.calculate(), 100);
    }
    
    loadExample(exampleType) {
        if (exampleData[exampleType]) {
            this.currentInputs = { ...exampleData[exampleType] };
            this.setupInputs(); // Update form values
            this.calculate();
        }
    }
    
    setScenario(scenario) {
        this.currentScenario = scenario;
        
        // Update button states
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-scenario') === scenario);
        });
        
        this.calculate();
    }
    
    calculate() {
        try {
            // Apply scenario adjustments
            const adjustedInputs = applyScenario(this.currentInputs, this.currentScenario);
            
            // Calculate results
            const results = calculateROI(adjustedInputs);
            
            // Update display
            this.updateDisplay(results);
            
            console.log('Calculation results:', results);
            
        } catch (error) {
            console.error('Calculation error:', error);
        }
    }
    
    updateDisplay(results) {
        // Update KPI values
        const paybackEl = document.getElementById('paybackValue');
        const roiEl = document.getElementById('roiValue');
        const savingsEl = document.getElementById('annualSavingsValue');
        
        if (paybackEl) paybackEl.textContent = results.paybackMonths || '-';
        if (roiEl) roiEl.textContent = results.roiSimplePct ? formatNumber(results.roiSimplePct, 1) : '-';
        if (savingsEl) savingsEl.textContent = results.totalSavingsAnnual ? 
            formatCurrency(results.totalSavingsAnnual, this.currentInputs.currency) : '-';
        
        // Update currency units
        const savingsUnitEl = document.getElementById('annualSavingsUnit');
        if (savingsUnitEl) {
            const symbols = { EUR: '€', USD: '$', GBP: '£' };
            savingsUnitEl.textContent = symbols[this.currentInputs.currency] || '€';
        }
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SimpleROICalculator());
} else {
    new SimpleROICalculator();
}
