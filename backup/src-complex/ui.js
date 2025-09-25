/**
 * @fileoverview UI components and event handling for Samsara ROI Calculator
 * Manages DOM interactions, chart rendering, and real-time updates
 */

'use strict';

import { formatCurrency, formatNumber, formatPercentage, currencyConfig } from './state.js';
import { calculateROI, applyScenario } from './formulas.js';
import { validateInputs, getValidationSummary } from './validate.js';

/**
 * UI state management
 */
class UIController {
    constructor() {
        this.currentInputs = {};
        this.currentResults = null;
        this.currentScenario = 'base';
        this.isCalculating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeTooltips();
    }
    
    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // Input elements
        this.inputElements = {};
        const inputIds = [
            'vehicleCount', 'annualKmPerVehicle', 'fuelConsumptionLPer100km', 'fuelPricePerLitre',
            'baselineAccidentsPerYear', 'avgAccidentCost', 'annualInsurancePremium',
            'fuelSavingsPct', 'accidentReductionPct', 'insuranceReductionPct', 'adoptionPct',
            'hardwareCostPerVehicle', 'subscriptionPerVehiclePerMonth', 'implementationOneOff', 'trainingOneOff',
            'timeHorizonYears', 'discountRatePct', 'currency', 'startMonth',
            'utilisationRampMonths', 'resaleRecoveryPctHardware', 'maintenancePerVehiclePerYear'
        ];
        
        inputIds.forEach(id => {
            this.inputElements[id] = document.getElementById(id);
        });
        
        // KPI elements
        this.kpiElements = {
            payback: document.getElementById('paybackValue'),
            roi: document.getElementById('roiValue'),
            annualSavings: document.getElementById('annualSavingsValue'),
            annualSavingsUnit: document.getElementById('annualSavingsUnit'),
        };
        
        // Chart elements
        this.chartElements = {
            sparkline: document.getElementById('sparklineCanvas'),
            cashFlow: document.getElementById('cashFlowChart'),
            savings: document.getElementById('savingsChart')
        };
        
        // Button elements
        this.buttonElements = {
            exportCSV: document.getElementById('exportCSV'),
            exportPDF: document.getElementById('exportPDF'),
            copyShareLink: document.getElementById('copyShareLink'),
            exampleButtons: document.querySelectorAll('.example-btn'),
            scenarioButtons: document.querySelectorAll('.scenario-btn')
        };
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Input change events
        Object.values(this.inputElements).forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.handleInputChange());
                element.addEventListener('blur', () => this.handleInputBlur(element));
            }
        });
        
        // Example buttons
        this.buttonElements.exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleExampleClick(e));
        });
        
        // Scenario buttons
        this.buttonElements.scenarioButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleScenarioClick(e));
        });
        
        // Export buttons
        this.buttonElements.exportCSV.addEventListener('click', () => this.handleExportCSV());
        this.buttonElements.exportPDF.addEventListener('click', () => this.handleExportPDF());
        this.buttonElements.copyShareLink.addEventListener('click', () => this.handleCopyShareLink());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            const tooltipText = tooltip.getAttribute('data-tooltip');
            if (tooltipText) {
                tooltip.addEventListener('mouseenter', (e) => this.showTooltip(e, tooltipText));
                tooltip.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }
    
    /**
     * Handle input changes
     */
    handleInputChange() {
        if (this.isCalculating) return;
        
        this.updateInputsFromDOM();
        this.debounceCalculation();
    }
    
    /**
     * Handle input blur for validation feedback
     */
    handleInputBlur(element) {
        this.showFieldValidation(element);
    }
    
    /**
     * Handle example button clicks
     */
    handleExampleClick(event) {
        const exampleType = event.target.getAttribute('data-example');
        this.loadExampleData(exampleType);
    }
    
    /**
     * Handle scenario button clicks
     */
    handleScenarioClick(event) {
        const scenario = event.target.getAttribute('data-scenario');
        this.setScenario(scenario);
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.handleExportCSV();
                    break;
                case 'p':
                    event.preventDefault();
                    this.handleExportPDF();
                    break;
                case 'l':
                    event.preventDefault();
                    this.handleCopyShareLink();
                    break;
            }
        }
    }
    
    /**
     * Update inputs from DOM elements
     */
    updateInputsFromDOM() {
        const inputs = {};
        
        Object.entries(this.inputElements).forEach(([key, element]) => {
            if (element) {
                if (element.type === 'number') {
                    inputs[key] = parseFloat(element.value) || 0;
                } else {
                    inputs[key] = element.value;
                }
            }
        });
        
        this.currentInputs = inputs;
    }
    
    /**
     * Update DOM elements from inputs
     */
    updateDOMFromInputs(inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
            const element = this.inputElements[key];
            if (element) {
                element.value = value;
            }
        });
    }
    
    /**
     * Debounced calculation to prevent excessive recalculations
     */
    debounceCalculation() {
        clearTimeout(this.calculationTimeout);
        this.calculationTimeout = setTimeout(() => {
            this.performCalculation();
        }, 100);
    }
    
    /**
     * Perform the main calculation
     */
    performCalculation() {
        if (this.isCalculating) return;
        
        this.isCalculating = true;
        
        try {
            // Validate inputs
            const validation = validateInputs(this.currentInputs);
            
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                this.isCalculating = false;
                return;
            }
            
            // Clear previous errors
            this.clearValidationErrors();
            
            // Apply scenario
            const scenarioInputs = applyScenario(validation.coercedInputs, this.currentScenario);
            
            // Calculate results
            const results = calculateROI(scenarioInputs);
            this.currentResults = results;
            
            // Update UI
            this.updateKPI(results);
            this.updateCharts(results);
            this.updateCurrencyDisplay(scenarioInputs.currency);
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showCalculationError(error);
        } finally {
            this.isCalculating = false;
        }
    }
    
    /**
     * Update KPI display
     */
    updateKPI(results) {
        const currency = this.currentInputs.currency || 'EUR';
        
        // Payback period
        this.kpiElements.payback.textContent = results.paybackMonths || '-';
        
        // ROI
        this.kpiElements.roi.textContent = results.roiSimplePct ? 
            formatNumber(results.roiSimplePct, 1) : '-';
        
        
        // Annual savings
        this.kpiElements.annualSavings.textContent = results.totalSavingsAnnual ? 
            formatCurrency(results.totalSavingsAnnual, currency, 0) : '-';
        
    }
    
    /**
     * Update currency display
     */
    updateCurrencyDisplay(currency) {
        const config = currencyConfig[currency];
        if (config) {
            this.kpiElements.annualSavingsUnit.textContent = config.symbol;
        }
    }
    
    /**
     * Update charts
     */
    updateCharts(results) {
        this.drawSparkline(results.timeline.cumNetMonthly);
        this.drawCashFlowChart(results.timeline);
        this.drawSavingsChart(results);
    }
    
    /**
     * Draw sparkline chart
     */
    drawSparkline(cumNetMonthly) {
        const canvas = this.chartElements.sparkline;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (cumNetMonthly.length === 0) return;
        
        const max = Math.max(...cumNetMonthly);
        const min = Math.min(...cumNetMonthly);
        const range = max - min || 1;
        
        ctx.strokeStyle = max >= 0 ? '#059669' : '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        cumNetMonthly.forEach((value, index) => {
            const x = (index / (cumNetMonthly.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Add zero line
        if (min < 0 && max > 0) {
            const zeroY = height - ((0 - min) / range) * height;
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, zeroY);
            ctx.lineTo(width, zeroY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    /**
     * Draw cash flow chart
     */
    drawCashFlowChart(timeline) {
        const canvas = this.chartElements.cashFlow;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        if (timeline.netMonthly.length === 0) return;
        
        const max = Math.max(...timeline.netMonthly);
        const min = Math.min(...timeline.netMonthly);
        const range = max - min || 1;
        
        // Draw bars
        const barWidth = width / timeline.netMonthly.length;
        
        timeline.netMonthly.forEach((value, index) => {
            const x = index * barWidth;
            const barHeight = Math.abs(value) / range * height;
            const y = value >= 0 ? height - barHeight : height;
            
            ctx.fillStyle = value >= 0 ? '#059669' : '#dc2626';
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
        
        // Add zero line
        if (min < 0 && max > 0) {
            const zeroY = height - ((0 - min) / range) * height;
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, zeroY);
            ctx.lineTo(width, zeroY);
            ctx.stroke();
        }
    }
    
    /**
     * Draw savings breakdown chart
     */
    drawSavingsChart(results) {
        const canvas = this.chartElements.savings;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        const savings = [
            { label: 'Fuel', value: results.fuelSavingsAnnual, color: '#3b82f6' },
            { label: 'Accidents', value: results.accidentSavingsAnnual, color: '#ef4444' },
            { label: 'Insurance', value: results.insuranceSavingsAnnual, color: '#10b981' }
        ];
        
        const total = savings.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        let currentAngle = 0;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        savings.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Add label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
            
            ctx.fillStyle = '#1e293b';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, labelX, labelY);
            
            currentAngle += sliceAngle;
        });
    }
    
    /**
     * Load example data
     */
    loadExampleData(exampleType) {
        // This will be called from the main app with example data
        console.log('Loading example data:', exampleType);
    }
    
    /**
     * Set scenario
     */
    setScenario(scenario) {
        this.currentScenario = scenario;
        
        // Update button states
        this.buttonElements.scenarioButtons.forEach(button => {
            button.classList.toggle('active', button.getAttribute('data-scenario') === scenario);
        });
        
        // Recalculate with new scenario
        this.performCalculation();
    }
    
    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        Object.entries(errors).forEach(([field, error]) => {
            const element = this.inputElements[field];
            if (element) {
                element.style.borderColor = '#dc2626';
                this.showFieldError(element, error);
            }
        });
    }
    
    /**
     * Clear validation errors
     */
    clearValidationErrors() {
        Object.values(this.inputElements).forEach(element => {
            if (element) {
                element.style.borderColor = '';
                this.hideFieldError(element);
            }
        });
    }
    
    /**
     * Show field-specific error
     */
    showFieldError(element, message) {
        let errorElement = element.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.color = '#dc2626';
            errorElement.style.fontSize = '0.75rem';
            errorElement.style.marginTop = '0.25rem';
            element.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }
    
    /**
     * Hide field-specific error
     */
    hideFieldError(element) {
        const errorElement = element.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }
    
    /**
     * Show field validation on blur
     */
    showFieldValidation(element) {
        const fieldName = element.id;
        const value = element.type === 'number' ? parseFloat(element.value) : element.value;
        
        // Simple validation for individual fields
        if (element.required && (!value || value === '')) {
            this.showFieldError(element, 'This field is required');
            element.style.borderColor = '#dc2626';
        } else {
            this.hideFieldError(element);
            element.style.borderColor = '';
        }
    }
    
    /**
     * Show calculation error
     */
    showCalculationError(error) {
        console.error('Calculation failed:', error);
        // Could show a toast notification here
    }
    
    /**
     * Show tooltip
     */
    showTooltip(event, text) {
        // Simple tooltip implementation
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #1e293b;
            color: white;
            padding: 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            z-index: 1000;
            max-width: 200px;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + 'px';
        
        this.currentTooltip = tooltip;
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
    
    /**
     * Export handlers (to be implemented in export.js)
     */
    handleExportCSV() {
        console.log('Export CSV requested');
    }
    
    handleExportPDF() {
        console.log('Export PDF requested');
    }
    
    handleCopyShareLink() {
        console.log('Copy share link requested');
    }
}

// Export the UI controller class
export { UIController };
