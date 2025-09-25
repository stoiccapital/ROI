/**
 * @fileoverview Main application entry point for Samsara ROI Calculator
 * Orchestrates all modules and handles application lifecycle
 */

'use strict';

import { 
    loadInitialInputs, 
    saveInputsToStorage, 
    updateURL, 
    exampleData,
    defaultInputs 
} from './state.js';
import { UIController } from './ui.js';
import { ExportController } from './export.js';
import { validateInputs } from './validate.js';
import { calculateROI, applyScenario } from './formulas.js';

/**
 * Main application class
 */
class SamsaraROICalculator {
    constructor() {
        this.uiController = null;
        this.exportController = null;
        this.currentInputs = {};
        this.currentResults = null;
        this.isInitialized = false;
        
        this.waitForDOM();
    }
    
    /**
     * Wait for DOM to be ready before initializing
     */
    waitForDOM() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 100);
        }
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Samsara ROI Calculator...');
            
            this.currentInputs = loadInitialInputs();
            this.uiController = new UIController();
            this.exportController = new ExportController(this.uiController);
            
            this.setupEventHandlers();
            this.uiController.updateDOMFromInputs(this.currentInputs);
            this.performCalculation();
            
            this.isInitialized = true;
            console.log('✅ Samsara ROI Calculator initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
        }
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        this.uiController.handleInputChange = () => this.handleInputChange();
        this.uiController.handleExampleClick = (e) => this.handleExampleClick(e);
        this.uiController.handleExportCSV = () => this.handleExportCSV();
        this.uiController.handleExportPDF = () => this.handleExportPDF();
        this.uiController.handleCopyShareLink = () => this.handleCopyShareLink();
        
        Object.values(this.uiController.inputElements).forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.handleInputChange());
                element.addEventListener('change', () => this.handleInputChange());
            }
        });
        
        this.uiController.buttonElements.exampleButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleExampleClick(e));
        });
        
        this.uiController.buttonElements.scenarioButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleScenarioClick(e));
        });
        
        this.uiController.buttonElements.exportCSV.addEventListener('click', () => this.handleExportCSV());
        this.uiController.buttonElements.exportPDF.addEventListener('click', () => this.handleExportPDF());
        this.uiController.buttonElements.copyShareLink.addEventListener('click', () => this.handleCopyShareLink());
    }
    
    /**
     * Handle input changes
     */
    handleInputChange() {
        if (!this.isInitialized) return;
        
        this.uiController.updateInputsFromDOM();
        this.currentInputs = this.uiController.currentInputs;
        
        saveInputsToStorage(this.currentInputs);
        updateURL(this.currentInputs);
        
        clearTimeout(this.calculationTimeout);
        this.calculationTimeout = setTimeout(() => {
            this.performCalculation();
        }, 100);
    }
    
    /**
     * Handle example button clicks
     */
    handleExampleClick(event) {
        const exampleType = event.target.getAttribute('data-example');
        const exampleInputs = exampleData[exampleType];
        
        if (exampleInputs) {
            this.loadExampleData(exampleInputs);
        }
    }
    
    /**
     * Handle scenario button clicks
     */
    handleScenarioClick(event) {
        const scenario = event.target.getAttribute('data-scenario');
        this.uiController.setScenario(scenario);
        this.performCalculation();
    }
    
    /**
     * Load example data
     */
    loadExampleData(exampleInputs) {
        this.currentInputs = { ...exampleInputs };
        this.uiController.updateDOMFromInputs(this.currentInputs);
        saveInputsToStorage(this.currentInputs);
        updateURL(this.currentInputs);
        this.performCalculation();
    }
    
    /**
     * Perform calculation
     */
    performCalculation() {
        if (!this.isInitialized) return;
        
        try {
            const validation = validateInputs(this.currentInputs);
            
            if (!validation.isValid) {
                this.uiController.showValidationErrors(validation.errors);
                this.currentResults = null;
                return;
            }
            
            this.uiController.clearValidationErrors();
            
            const scenarioInputs = applyScenario(validation.coercedInputs, this.uiController.currentScenario);
            const results = calculateROI(scenarioInputs);
            this.currentResults = results;
            
            this.uiController.currentResults = results;
            this.uiController.updateKPI(results);
            this.uiController.updateCharts(results);
            this.uiController.updateCurrencyDisplay(scenarioInputs.currency);
            
        } catch (error) {
            console.error('Calculation error:', error);
        }
    }
    
    /**
     * Handle CSV export
     */
    handleExportCSV() {
        if (!this.currentResults) return;
        this.exportController.exportToCSV(this.currentResults, this.currentInputs);
    }
    
    /**
     * Handle PDF export
     */
    handleExportPDF() {
        if (!this.currentResults) return;
        this.exportController.exportToPDF(this.currentResults, this.currentInputs);
    }
    
    /**
     * Handle copy share link
     */
    async handleCopyShareLink() {
        try {
            await this.exportController.copyShareLink(this.currentInputs);
        } catch (error) {
            console.error('Failed to copy share link:', error);
        }
    }
}

// Initialize the application
console.log('🚀 Starting Samsara ROI Calculator...');
const app = new SamsaraROICalculator();

// Export for debugging
window.SamsaraROICalculator = app;
