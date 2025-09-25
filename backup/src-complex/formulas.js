/**
 * @fileoverview Core calculation formulas for Samsara ROI Calculator
 * Pure functions with JSDoc type definitions for all financial calculations
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
 * @typedef {Object} CalculationOutputs
 * @property {number} baselineFuelCost
 * @property {number} fuelSavingsAnnual
 * @property {number} accidentSavingsAnnual
 * @property {number} insuranceSavingsAnnual
 * @property {number} totalSavingsAnnual
 * @property {number} capexHardware
 * @property {number} opexSubscriptionAnnual
 * @property {number} oneOff
 * @property {number} maintenanceAnnual
 * @property {Object} timeline
 * @property {number[]} timeline.months
 * @property {number[]} timeline.savingsMonthly
 * @property {number[]} timeline.costsMonthly
 * @property {number[]} timeline.netMonthly
 * @property {number[]} timeline.cumNetMonthly
 * @property {number} paybackMonths
 * @property {number} roiSimplePct
 */

/**
 * Calculate baseline fuel cost (annual)
 * @param {CalculatorInputs} inputs
 * @returns {number}
 */
export function calculateBaselineFuelCost(inputs) {
    const { vehicleCount, annualKmPerVehicle, fuelConsumptionLPer100km, fuelPricePerLitre } = inputs;
    
    const baselineLitres = vehicleCount * annualKmPerVehicle * (fuelConsumptionLPer100km / 100);
    return baselineLitres * fuelPricePerLitre;
}

/**
 * Calculate annual fuel savings at steady state
 * @param {CalculatorInputs} inputs
 * @param {number} baselineFuelCost
 * @returns {number}
 */
export function calculateFuelSavings(inputs, baselineFuelCost) {
    const { fuelSavingsPct, adoptionPct } = inputs;
    return baselineFuelCost * (fuelSavingsPct / 100) * (adoptionPct / 100);
}

/**
 * Calculate annual accident savings
 * @param {CalculatorInputs} inputs
 * @returns {number}
 */
export function calculateAccidentSavings(inputs) {
    const { baselineAccidentsPerYear, accidentReductionPct, adoptionPct, avgAccidentCost } = inputs;
    
    const accidentsAvoided = baselineAccidentsPerYear * (accidentReductionPct / 100) * (adoptionPct / 100);
    return accidentsAvoided * avgAccidentCost;
}

/**
 * Calculate annual insurance savings
 * @param {CalculatorInputs} inputs
 * @returns {number}
 */
export function calculateInsuranceSavings(inputs) {
    const { annualInsurancePremium, insuranceReductionPct, adoptionPct } = inputs;
    return annualInsurancePremium * (insuranceReductionPct / 100) * (adoptionPct / 100);
}

/**
 * Calculate total annual savings at steady state
 * @param {number} fuelSavings
 * @param {number} accidentSavings
 * @param {number} insuranceSavings
 * @returns {number}
 */
export function calculateTotalSavings(fuelSavings, accidentSavings, insuranceSavings) {
    return fuelSavings + accidentSavings + insuranceSavings;
}

/**
 * Calculate program costs
 * @param {CalculatorInputs} inputs
 * @returns {Object}
 */
export function calculateProgramCosts(inputs) {
    const { 
        vehicleCount, 
        hardwareCostPerVehicle, 
        subscriptionPerVehiclePerMonth,
        implementationOneOff,
        trainingOneOff,
        maintenancePerVehiclePerYear
    } = inputs;
    
    const capexHardware = vehicleCount * hardwareCostPerVehicle;
    const opexSubscriptionAnnual = vehicleCount * subscriptionPerVehiclePerMonth * 12;
    const oneOff = implementationOneOff + trainingOneOff;
    const maintenanceAnnual = vehicleCount * maintenancePerVehiclePerYear;
    
    return {
        capexHardware,
        opexSubscriptionAnnual,
        oneOff,
        maintenanceAnnual
    };
}

/**
 * Calculate monthly cash flow timeline
 * @param {CalculatorInputs} inputs
 * @param {Object} savings
 * @param {Object} costs
 * @returns {Object}
 */
export function calculateTimeline(inputs, savings, costs) {
    const { 
        timeHorizonYears, 
        utilisationRampMonths,
        resaleRecoveryPctHardware,
        startMonth
    } = inputs;
    
    const totalMonths = timeHorizonYears * 12;
    const months = [];
    const savingsMonthly = [];
    const costsMonthly = [];
    const netMonthly = [];
    const cumNetMonthly = [];
    
    // Parse start month
    const [startYear, startMonthNum] = startMonth.split('-').map(Number);
    const startDate = new Date(startYear, startMonthNum - 1);
    
    let cumulativeNet = 0;
    
    for (let i = 0; i < totalMonths; i++) {
        const currentDate = new Date(startDate.getFullYear(), startDate.getMonth() + i);
        months.push(i + 1);
        
        // Calculate ramp factor
        let rampFactor = 1;
        if (i < utilisationRampMonths) {
            rampFactor = (i + 1) / utilisationRampMonths;
        }
        
        // Monthly savings (ramped)
        const monthlySavings = (savings.totalSavingsAnnual / 12) * rampFactor;
        savingsMonthly.push(monthlySavings);
        
        // Monthly costs
        let monthlyCosts = costs.opexSubscriptionAnnual / 12 + costs.maintenanceAnnual / 12;
        
        // Add one-off costs at month 0
        if (i === 0) {
            monthlyCosts += costs.capexHardware + costs.oneOff;
        }
        
        // Add resale recovery at final month
        if (i === totalMonths - 1 && resaleRecoveryPctHardware > 0) {
            monthlyCosts -= costs.capexHardware * (resaleRecoveryPctHardware / 100);
        }
        
        costsMonthly.push(monthlyCosts);
        
        // Net monthly cash flow
        const netFlow = monthlySavings - monthlyCosts;
        netMonthly.push(netFlow);
        
        // Cumulative net cash flow
        cumulativeNet += netFlow;
        cumNetMonthly.push(cumulativeNet);
    }
    
    return {
        months,
        savingsMonthly,
        costsMonthly,
        netMonthly,
        cumNetMonthly
    };
}

/**
 * Calculate payback period in months
 * @param {number[]} cumNetMonthly
 * @returns {number}
 */
export function calculatePayback(cumNetMonthly) {
    for (let i = 0; i < cumNetMonthly.length; i++) {
        if (cumNetMonthly[i] >= 0) {
            return i + 1;
        }
    }
    return cumNetMonthly.length; // No payback within horizon
}

/**
 * Calculate simple ROI percentage
 * @param {number} totalSavings
 * @param {number} totalCosts
 * @returns {number}
 */
export function calculateSimpleROI(totalSavings, totalCosts) {
    if (totalCosts === 0) return 0;
    return ((totalSavings - totalCosts) / totalCosts) * 100;
}

/**
}

/**
}

/**
}

/**
}

/**
}

/**
 * Main calculation function that orchestrates all calculations
 * @param {CalculatorInputs} inputs
 * @returns {CalculationOutputs}
 */
export function calculateROI(inputs) {
    // Calculate baseline and savings
    const baselineFuelCost = calculateBaselineFuelCost(inputs);
    const fuelSavingsAnnual = calculateFuelSavings(inputs, baselineFuelCost);
    const accidentSavingsAnnual = calculateAccidentSavings(inputs);
    const insuranceSavingsAnnual = calculateInsuranceSavings(inputs);
    const totalSavingsAnnual = calculateTotalSavings(
        fuelSavingsAnnual, 
        accidentSavingsAnnual, 
        insuranceSavingsAnnual
    );
    
    // Calculate costs
    const costs = calculateProgramCosts(inputs);
    
    // Calculate timeline
    const timeline = calculateTimeline(inputs, { totalSavingsAnnual }, costs);
    
    // Calculate financial metrics
    const paybackMonths = calculatePayback(timeline.cumNetMonthly);
    const totalCosts = costs.capexHardware + costs.oneOff + 
                      (costs.opexSubscriptionAnnual + costs.maintenanceAnnual) * inputs.timeHorizonYears;
    const totalSavings = totalSavingsAnnual * inputs.timeHorizonYears;
    const roiSimplePct = calculateSimpleROI(totalSavings, totalCosts);
    // NPV calculation removed
    // IRR calculation removed
    // IRR annual calculation removed
    
    return {
        baselineFuelCost,
        fuelSavingsAnnual,
        accidentSavingsAnnual,
        insuranceSavingsAnnual,
        totalSavingsAnnual,
        ...costs,
        timeline,
        paybackMonths,
        roiSimplePct,
        // npv removed,
        // irrMonthly removed,
        // irrAnnual removed
    };
}

/**
 * Apply scenario multipliers to inputs
 * @param {CalculatorInputs} inputs
 * @param {string} scenario - 'conservative', 'base', or 'aggressive'
 * @returns {CalculatorInputs}
 */
export function applyScenario(inputs, scenario) {
    const modifiedInputs = { ...inputs };
    
    switch (scenario) {
        case 'conservative':
            modifiedInputs.fuelSavingsPct *= 0.75;
            modifiedInputs.accidentReductionPct *= 0.75;
            modifiedInputs.insuranceReductionPct *= 0.75;
            break;
        case 'aggressive':
            modifiedInputs.fuelSavingsPct *= 1.25;
            modifiedInputs.accidentReductionPct *= 1.25;
            modifiedInputs.insuranceReductionPct *= 1.25;
            break;
        case 'base':
        default:
            // No changes
            break;
    }
    
    return modifiedInputs;
}
