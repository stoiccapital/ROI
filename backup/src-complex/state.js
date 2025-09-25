/**
 * @fileoverview State management for Samsara ROI Calculator
 * Handles localStorage persistence, URL state sync, and default values
 */

'use strict';

/**
 * @typedef {Object} CalculatorInputs
 * @property {number} vehicleCount
 * @property {number} annualKmPerVehicle
 * @property {number} fuelConsumptionLPer100km
 * @property {number} fuelPricePerLitre
 * @property {number} baselineAccidentsPerYear
 * @property {number} avgAccidentCost
 * @property {number} annualInsurancePremium
 * @property {number} fuelSavingsPct
 * @property {number} accidentReductionPct
 * @property {number} insuranceReductionPct
 * @property {number} adoptionPct
 * @property {number} hardwareCostPerVehicle
 * @property {number} subscriptionPerVehiclePerMonth
 * @property {number} implementationOneOff
 * @property {number} trainingOneOff
 * @property {number} timeHorizonYears
 * @property {number} discountRatePct
 * @property {string} currency
 * @property {string} startMonth
 * @property {number} utilisationRampMonths
 * @property {number} resaleRecoveryPctHardware
 * @property {number} maintenancePerVehiclePerYear
 */

/**
 * Default input values for the calculator
 * @type {CalculatorInputs}
 */
export const defaultInputs = {
    vehicleCount: 50,
    annualKmPerVehicle: 45000,
    fuelConsumptionLPer100km: 10.5,
    fuelPricePerLitre: 1.90,
    baselineAccidentsPerYear: 12,
    avgAccidentCost: 6500,
    annualInsurancePremium: 120000,
    fuelSavingsPct: 6,
    accidentReductionPct: 30,
    insuranceReductionPct: 8,
    adoptionPct: 90,
    hardwareCostPerVehicle: 350,
    subscriptionPerVehiclePerMonth: 35,
    implementationOneOff: 2500,
    trainingOneOff: 1500,
    timeHorizonYears: 3,
    discountRatePct: 8,
    currency: 'EUR',
    startMonth: getCurrentMonth(),
    utilisationRampMonths: 2,
    resaleRecoveryPctHardware: 0,
    maintenancePerVehiclePerYear: 0
};

/**
 * Example data sets for quick testing
 * @type {Object.<string, CalculatorInputs>}
 */
export const exampleData = {
    courier: {
        ...defaultInputs,
        vehicleCount: 50,
        annualKmPerVehicle: 45000,
        fuelConsumptionLPer100km: 10.5,
        baselineAccidentsPerYear: 12,
        avgAccidentCost: 6500,
        annualInsurancePremium: 120000
    },
    bus: {
        ...defaultInputs,
        vehicleCount: 120,
        annualKmPerVehicle: 80000,
        fuelConsumptionLPer100km: 35.0,
        baselineAccidentsPerYear: 8,
        avgAccidentCost: 15000,
        annualInsurancePremium: 300000,
        fuelSavingsPct: 8,
        accidentReductionPct: 25,
        insuranceReductionPct: 12
    },
    taxi: {
        ...defaultInputs,
        vehicleCount: 30,
        annualKmPerVehicle: 120000,
        fuelConsumptionLPer100km: 8.5,
        baselineAccidentsPerYear: 18,
        avgAccidentCost: 8000,
        annualInsurancePremium: 180000,
        fuelSavingsPct: 10,
        accidentReductionPct: 40,
        insuranceReductionPct: 15
    }
};

/**
 * Get current month in YYYY-MM format
 * @returns {string}
 */
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Storage key for localStorage
 */
const STORAGE_KEY = 'samsara-roi-calculator-inputs';

/**
 * Load inputs from localStorage
 * @returns {CalculatorInputs}
 */
export function loadInputsFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge with defaults to handle new fields
            return { ...defaultInputs, ...parsed };
        }
    } catch (error) {
        console.warn('Failed to load inputs from localStorage:', error);
    }
    return { ...defaultInputs };
}

/**
 * Save inputs to localStorage
 * @param {CalculatorInputs} inputs
 */
export function saveInputsToStorage(inputs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch (error) {
        console.warn('Failed to save inputs to localStorage:', error);
    }
}

/**
 * Parse inputs from URL search parameters
 * @param {URLSearchParams} searchParams
 * @returns {CalculatorInputs}
 */
export function parseInputsFromURL(searchParams) {
    const inputs = { ...defaultInputs };
    
    for (const [key, value] of searchParams.entries()) {
        if (key in inputs) {
            const inputValue = inputs[key];
            
            if (typeof inputValue === 'number') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    inputs[key] = numValue;
                }
            } else if (typeof inputValue === 'string') {
                inputs[key] = value;
            }
        }
    }
    
    return inputs;
}

/**
 * Serialize inputs to URL search parameters
 * @param {CalculatorInputs} inputs
 * @returns {URLSearchParams}
 */
export function serializeInputsToURL(inputs) {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(inputs)) {
        if (value !== defaultInputs[key]) {
            params.set(key, String(value));
        }
    }
    
    return params;
}

/**
 * Update URL with current inputs
 * @param {CalculatorInputs} inputs
 */
export function updateURL(inputs) {
    try {
        const params = serializeInputsToURL(inputs);
        const newURL = params.toString() 
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;
        
        window.history.replaceState(null, '', newURL);
    } catch (error) {
        console.warn('Failed to update URL:', error);
    }
}

/**
 * Load inputs from URL or localStorage
 * @returns {CalculatorInputs}
 */
export function loadInitialInputs() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.toString()) {
        return parseInputsFromURL(urlParams);
    }
    
    return loadInputsFromStorage();
}

/**
 * Currency configuration
 * @type {Object.<string, {symbol: string, code: string}>}
 */
export const currencyConfig = {
    EUR: { symbol: '€', code: 'EUR' },
    USD: { symbol: '$', code: 'USD' },
    GBP: { symbol: '£', code: 'GBP' }
};

/**
 * Format number with currency
 * @param {number} value
 * @param {string} currency
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatCurrency(value, currency, decimals = 0) {
    const config = currencyConfig[currency];
    if (!config) return String(value);
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format number with thousand separators
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}
