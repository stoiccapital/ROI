/**
 * Simple state management
 */

'use strict';

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
    currency: 'EUR'
};

export const exampleData = {
    courier: { ...defaultInputs },
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

export function formatCurrency(value, currency = 'EUR') {
    const symbols = { EUR: '€', USD: '$', GBP: '£' };
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

export function formatNumber(value, decimals = 1) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}
