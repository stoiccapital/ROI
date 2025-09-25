/**
 * Simple ROI calculation formulas
 */

'use strict';

/**
 * Calculate ROI metrics
 * @param {Object} inputs - All input parameters
 * @returns {Object} - Results with payback, roi, and annual savings
 */
export function calculateROI(inputs) {
    // Basic calculations
    const baselineFuelCost = inputs.vehicleCount * inputs.annualKmPerVehicle * 
                            (inputs.fuelConsumptionLPer100km / 100) * inputs.fuelPricePerLitre;
    
    const fuelSavings = baselineFuelCost * (inputs.fuelSavingsPct / 100) * (inputs.adoptionPct / 100);
    
    const accidentSavings = inputs.baselineAccidentsPerYear * (inputs.accidentReductionPct / 100) * 
                           (inputs.adoptionPct / 100) * inputs.avgAccidentCost;
    
    const insuranceSavings = inputs.annualInsurancePremium * (inputs.insuranceReductionPct / 100) * 
                            (inputs.adoptionPct / 100);
    
    const totalSavingsAnnual = fuelSavings + accidentSavings + insuranceSavings;
    
    // Cost calculations
    const hardwareCosts = inputs.vehicleCount * inputs.hardwareCostPerVehicle;
    const subscriptionAnnual = inputs.vehicleCount * inputs.subscriptionPerVehiclePerMonth * 12;
    const oneOffCosts = inputs.implementationOneOff + inputs.trainingOneOff;
    
    // Simple payback calculation
    const monthlySavings = totalSavingsAnnual / 12;
    const monthlyCosts = subscriptionAnnual / 12;
    const netMonthlySavings = monthlySavings - monthlyCosts;
    const initialCosts = hardwareCosts + oneOffCosts;
    const paybackMonths = Math.ceil(initialCosts / netMonthlySavings);
    
    // Simple ROI calculation
    const totalCosts = hardwareCosts + oneOffCosts + (subscriptionAnnual * inputs.timeHorizonYears);
    const totalSavings = totalSavingsAnnual * inputs.timeHorizonYears;
    const roiSimplePct = ((totalSavings - totalCosts) / totalCosts) * 100;
    
    return {
        paybackMonths,
        roiSimplePct,
        totalSavingsAnnual
    };
}

/**
 * Apply scenario adjustments
 */
export function applyScenario(inputs, scenario) {
    const adjusted = { ...inputs };
    
    switch (scenario) {
        case 'conservative':
            adjusted.fuelSavingsPct *= 0.75;
            adjusted.accidentReductionPct *= 0.75;
            adjusted.insuranceReductionPct *= 0.75;
            break;
        case 'aggressive':
            adjusted.fuelSavingsPct *= 1.25;
            adjusted.accidentReductionPct *= 1.25;
            adjusted.insuranceReductionPct *= 1.25;
            break;
        default: // base case
            break;
    }
    
    return adjusted;
}
