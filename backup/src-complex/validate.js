/**
 * @fileoverview Input validation for Samsara ROI Calculator
 * Provides validation, coercion, and error handling for all inputs
 */

'use strict';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {Object.<string, string>} errors
 * @property {Object} coercedInputs
 */

/**
 * Input validation schema with min/max values and error messages
 * @type {Object}
 */
const validationSchema = {
    vehicleCount: {
        min: 1,
        max: 10000,
        type: 'integer',
        error: 'Number of vehicles must be between 1 and 10,000'
    },
    annualKmPerVehicle: {
        min: 1000,
        max: 200000,
        type: 'number',
        error: 'Annual kilometers per vehicle must be between 1,000 and 200,000'
    },
    fuelConsumptionLPer100km: {
        min: 5,
        max: 50,
        type: 'number',
        error: 'Fuel consumption must be between 5 and 50 L/100km'
    },
    fuelPricePerLitre: {
        min: 0.5,
        max: 5,
        type: 'number',
        error: 'Fuel price must be between €0.50 and €5.00 per litre'
    },
    baselineAccidentsPerYear: {
        min: 0,
        max: 1000,
        type: 'number',
        error: 'Baseline accidents must be between 0 and 1,000 per year'
    },
    avgAccidentCost: {
        min: 100,
        max: 100000,
        type: 'number',
        error: 'Average accident cost must be between €100 and €100,000'
    },
    annualInsurancePremium: {
        min: 1000,
        max: 10000000,
        type: 'number',
        error: 'Annual insurance premium must be between €1,000 and €10,000,000'
    },
    fuelSavingsPct: {
        min: 0,
        max: 50,
        type: 'number',
        error: 'Fuel savings percentage must be between 0% and 50%'
    },
    accidentReductionPct: {
        min: 0,
        max: 100,
        type: 'number',
        error: 'Accident reduction percentage must be between 0% and 100%'
    },
    insuranceReductionPct: {
        min: 0,
        max: 50,
        type: 'number',
        error: 'Insurance reduction percentage must be between 0% and 50%'
    },
    adoptionPct: {
        min: 0,
        max: 100,
        type: 'number',
        error: 'Adoption percentage must be between 0% and 100%'
    },
    hardwareCostPerVehicle: {
        min: 0,
        max: 5000,
        type: 'number',
        error: 'Hardware cost per vehicle must be between €0 and €5,000'
    },
    subscriptionPerVehiclePerMonth: {
        min: 0,
        max: 200,
        type: 'number',
        error: 'Subscription cost must be between €0 and €200 per vehicle per month'
    },
    implementationOneOff: {
        min: 0,
        max: 50000,
        type: 'number',
        error: 'Implementation cost must be between €0 and €50,000'
    },
    trainingOneOff: {
        min: 0,
        max: 50000,
        type: 'number',
        error: 'Training cost must be between €0 and €50,000'
    },
    timeHorizonYears: {
        min: 1,
        max: 10,
        type: 'integer',
        error: 'Time horizon must be between 1 and 10 years'
    },
    discountRatePct: {
        min: 0,
        max: 20,
        type: 'number',
        error: 'Discount rate must be between 0% and 20%'
    },
    currency: {
        type: 'string',
        allowedValues: ['EUR', 'USD', 'GBP'],
        error: 'Currency must be EUR, USD, or GBP'
    },
    startMonth: {
        type: 'date',
        error: 'Start month must be a valid date in YYYY-MM format'
    },
    utilisationRampMonths: {
        min: 0,
        max: 24,
        type: 'integer',
        error: 'Utilisation ramp must be between 0 and 24 months'
    },
    resaleRecoveryPctHardware: {
        min: 0,
        max: 100,
        type: 'number',
        error: 'Hardware resale recovery must be between 0% and 100%'
    },
    maintenancePerVehiclePerYear: {
        min: 0,
        max: 1000,
        type: 'number',
        error: 'Maintenance cost must be between €0 and €1,000 per vehicle per year'
    }
};

/**
 * Coerce a value to the appropriate type
 * @param {*} value
 * @param {string} type
 * @returns {*}
 */
function coerceValue(value, type) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    switch (type) {
        case 'integer':
            const intValue = parseInt(value, 10);
            return isNaN(intValue) ? null : intValue;
        case 'number':
            const numValue = parseFloat(value);
            return isNaN(numValue) ? null : numValue;
        case 'string':
            return String(value);
        case 'date':
            // Validate YYYY-MM format
            if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
                const [year, month] = value.split('-').map(Number);
                const date = new Date(year, month - 1);
                if (date.getFullYear() === year && date.getMonth() === month - 1) {
                    return value;
                }
            }
            return null;
        default:
            return value;
    }
}

/**
 * Validate a single input value
 * @param {string} fieldName
 * @param {*} value
 * @param {Object} schema
 * @returns {string|null} Error message or null if valid
 */
function validateField(fieldName, value, schema) {
    // Check if value is required and present
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    
    // Type validation
    if (schema.type === 'integer' && !Number.isInteger(value)) {
        return `${fieldName} must be a whole number`;
    }
    
    if (schema.type === 'number' && typeof value !== 'number') {
        return `${fieldName} must be a number`;
    }
    
    if (schema.type === 'string' && typeof value !== 'string') {
        return `${fieldName} must be text`;
    }
    
    // Range validation
    if (typeof value === 'number') {
        if (schema.min !== undefined && value < schema.min) {
            return `${fieldName} must be at least ${schema.min}`;
        }
        
        if (schema.max !== undefined && value > schema.max) {
            return `${fieldName} must be at most ${schema.max}`;
        }
    }
    
    // Allowed values validation
    if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        return `${fieldName} must be one of: ${schema.allowedValues.join(', ')}`;
    }
    
    return null;
}

/**
 * Validate and coerce all inputs
 * @param {Object} rawInputs
 * @returns {ValidationResult}
 */
export function validateInputs(rawInputs) {
    const errors = {};
    const coercedInputs = {};
    let isValid = true;
    
    for (const [fieldName, schema] of Object.entries(validationSchema)) {
        const rawValue = rawInputs[fieldName];
        const coercedValue = coerceValue(rawValue, schema.type);
        coercedInputs[fieldName] = coercedValue;
        
        const error = validateField(fieldName, coercedValue, schema);
        if (error) {
            errors[fieldName] = error;
            isValid = false;
        }
    }
    
    // Additional cross-field validation
    const crossFieldErrors = validateCrossFields(coercedInputs);
    Object.assign(errors, crossFieldErrors);
    if (Object.keys(crossFieldErrors).length > 0) {
        isValid = false;
    }
    
    return {
        isValid,
        errors,
        coercedInputs
    };
}

/**
 * Validate cross-field dependencies
 * @param {Object} inputs
 * @returns {Object.<string, string>}
 */
function validateCrossFields(inputs) {
    const errors = {};
    
    // Check that utilisation ramp doesn't exceed time horizon
    if (inputs.utilisationRampMonths > inputs.timeHorizonYears * 12) {
        errors.utilisationRampMonths = 'Utilisation ramp cannot exceed the time horizon';
    }
    
    // Check that start month is not in the past (warning, not error)
    if (inputs.startMonth) {
        const [year, month] = inputs.startMonth.split('-').map(Number);
        const startDate = new Date(year, month - 1);
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth());
        
        if (startDate < currentMonth) {
            // This is a warning, not an error - just log it
            console.warn('Start month is in the past. Savings will be calculated from the specified month.');
        }
    }
    
    return errors;
}

/**
 * Get user-friendly field names for error messages
 * @param {string} fieldName
 * @returns {string}
 */
export function getFieldDisplayName(fieldName) {
    const displayNames = {
        vehicleCount: 'Number of Vehicles',
        annualKmPerVehicle: 'Annual KM per Vehicle',
        fuelConsumptionLPer100km: 'Fuel Consumption',
        fuelPricePerLitre: 'Fuel Price per Litre',
        baselineAccidentsPerYear: 'Baseline Accidents per Year',
        avgAccidentCost: 'Average Accident Cost',
        annualInsurancePremium: 'Annual Insurance Premium',
        fuelSavingsPct: 'Fuel Savings %',
        accidentReductionPct: 'Accident Reduction %',
        insuranceReductionPct: 'Insurance Reduction %',
        adoptionPct: 'Adoption Rate %',
        hardwareCostPerVehicle: 'Hardware Cost per Vehicle',
        subscriptionPerVehiclePerMonth: 'Subscription per Vehicle per Month',
        implementationOneOff: 'Implementation Cost',
        trainingOneOff: 'Training Cost',
        timeHorizonYears: 'Time Horizon',
        discountRatePct: 'Discount Rate %',
        currency: 'Currency',
        startMonth: 'Start Month',
        utilisationRampMonths: 'Utilisation Ramp',
        resaleRecoveryPctHardware: 'Hardware Resale Recovery %',
        maintenancePerVehiclePerYear: 'Maintenance per Vehicle per Year'
    };
    
    return displayNames[fieldName] || fieldName;
}

/**
 * Format validation errors for display
 * @param {Object.<string, string>} errors
 * @returns {string[]}
 */
export function formatValidationErrors(errors) {
    return Object.entries(errors).map(([field, error]) => {
        const displayName = getFieldDisplayName(field);
        return `${displayName}: ${error}`;
    });
}

/**
 * Check if inputs are valid for calculation
 * @param {Object} inputs
 * @returns {boolean}
 */
export function canCalculate(inputs) {
    const validation = validateInputs(inputs);
    return validation.isValid;
}

/**
 * Get validation summary for UI display
 * @param {Object} inputs
 * @returns {Object}
 */
export function getValidationSummary(inputs) {
    const validation = validateInputs(inputs);
    
    return {
        isValid: validation.isValid,
        errorCount: Object.keys(validation.errors).length,
        errors: validation.errors,
        hasWarnings: false, // Could be extended for warnings
        summary: validation.isValid 
            ? 'All inputs are valid' 
            : `${Object.keys(validation.errors).length} input(s) need attention`
    };
}
