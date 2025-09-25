/**
 * Simplified Samsara ROI Calculator
 * Only essential calculations and UI
 */

// Default values
const defaults = {
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
    subscriptionPerVehiclePerMonth: 35,
    implementationOneOff: 2500,
    trainingOneOff: 1500,
    timeHorizonYears: 3,
    currency: 'EUR'
};

// Calculate results
function calculate(inputs = {}) {
    // Merge with defaults
    const data = { ...defaults, ...inputs };
    
    // Baseline fuel cost
    const baselineLitres = data.vehicleCount * data.annualKmPerVehicle * (data.fuelConsumptionLPer100km / 100);
    const baselineFuelCost = baselineLitres * data.fuelPricePerLitre;
    
    // Annual savings
    const fuelSavings = baselineFuelCost * (data.fuelSavingsPct / 100) * (data.adoptionPct / 100);
    const accidentSavings = data.baselineAccidentsPerYear * (data.accidentReductionPct / 100) * (data.adoptionPct / 100) * data.avgAccidentCost;
    const insuranceSavings = data.annualInsurancePremium * (data.insuranceReductionPct / 100) * (data.adoptionPct / 100);
    const totalSavingsAnnual = fuelSavings + accidentSavings + insuranceSavings;
    
    // Costs
    const subscriptionAnnual = data.vehicleCount * data.subscriptionPerVehiclePerMonth * 12;
    const oneOffCosts = data.implementationOneOff + data.trainingOneOff;
    
    // Simple metrics
    const totalCosts = oneOffCosts + (subscriptionAnnual * data.timeHorizonYears);
    const totalSavings = totalSavingsAnnual * data.timeHorizonYears;
    const roi = ((totalSavings - totalCosts) / totalCosts) * 100;
    
    // Payback calculation
    const monthlySavings = totalSavingsAnnual / 12;
    const monthlyCosts = subscriptionAnnual / 12;
    const netMonthly = monthlySavings - monthlyCosts;
    const paybackMonths = netMonthly > 0 ? Math.ceil(oneOffCosts / netMonthly) : null;
    
    return {
        totalSavingsAnnual,
        subscriptionAnnual,
        roiSimplePct: roi,
        paybackMonths
    };
}

// Format currency
function formatCurrency(value, currency = 'EUR') {
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
    return symbol + Math.round(value).toLocaleString();
}

// Get inputs from form
function getInputs() {
    const inputs = {};
    const fields = [
        'vehicleCount', 'annualKmPerVehicle', 'fuelConsumptionLPer100km', 'fuelPricePerLitre',
        'baselineAccidentsPerYear', 'avgAccidentCost', 'annualInsurancePremium',
        'fuelSavingsPct', 'accidentReductionPct', 'insuranceReductionPct', 'adoptionPct',
        'subscriptionPerVehiclePerMonth', 'implementationOneOff', 'trainingOneOff',
        'timeHorizonYears'
    ];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            const value = parseFloat(element.value);
            inputs[field] = isNaN(value) ? defaults[field] : value;
        }
    });
    
    const currencyElement = document.getElementById('currency');
    if (currencyElement) {
        inputs.currency = currencyElement.value || 'EUR';
    }
    
    return inputs;
}

// Update results display
function updateResults() {
    const inputs = getInputs();
    const results = calculate(inputs);
    
    // Check for unrealistic accident reduction values
    const warningElement = document.getElementById('accidentReductionWarning');
    if (warningElement) {
        if (inputs.accidentReductionPct > 80) {
            warningElement.style.display = 'block';
        } else {
            warningElement.style.display = 'none';
        }
    }
    
    // Update KPI values
    const paybackElement = document.getElementById('paybackValue');
    const roiElement = document.getElementById('roiValue');
    const savingsElement = document.getElementById('annualSavingsValue');
    const costElement = document.getElementById('annualCostValue');
    
    if (paybackElement) {
        if (results.paybackMonths === null) {
            paybackElement.textContent = 'Never';
        } else {
            paybackElement.textContent = results.paybackMonths || '-';
        }
    }
    if (roiElement) {
        if (results.roiSimplePct && results.roiSimplePct >= 0) {
            roiElement.textContent = Math.round(results.roiSimplePct) + '%';
        } else if (results.roiSimplePct < 0) {
            roiElement.textContent = 'No ROI';
        } else {
            roiElement.textContent = '-';
        }
    }
    if (savingsElement) savingsElement.textContent = formatCurrency(results.totalSavingsAnnual, inputs.currency);
    if (costElement) costElement.textContent = formatCurrency(results.subscriptionAnnual, inputs.currency);
    
    // Update currency symbols
    const currencyElements = document.querySelectorAll('[id$="Unit"]');
    const symbol = inputs.currency === 'USD' ? '$' : inputs.currency === 'GBP' ? '£' : '€';
    currencyElements.forEach(el => el.textContent = symbol);
}

// Load example data
function loadExample(type) {
    const examples = {
        courier: { 
            vehicleCount: 100, 
            fuelConsumptionLPer100km: 10, 
            annualKmPerVehicle: 100000,
            baselineAccidentsPerYear: 50,
            avgAccidentCost: 5000,
            annualInsurancePremium: 400000,
            fuelSavingsPct: 6, 
            accidentReductionPct: 30 
        },
        bus: { 
            vehicleCount: 100, 
            fuelConsumptionLPer100km: 30, 
            annualKmPerVehicle: 50000,
            baselineAccidentsPerYear: 100,
            avgAccidentCost: 5000,
            annualInsurancePremium: 400000,
            accidentReductionPct: 25 
        },
        taxi: { 
            vehicleCount: 100, 
            fuelConsumptionLPer100km: 6, 
            annualKmPerVehicle: 120000,
            baselineAccidentsPerYear: 50,
            avgAccidentCost: 5000,
            annualInsurancePremium: 400000,
            accidentReductionPct: 40 
        },
        freight: { 
            vehicleCount: 100, 
            fuelConsumptionLPer100km: 30, 
            annualKmPerVehicle: 100000,
            baselineAccidentsPerYear: 50,
            avgAccidentCost: 5000,
            annualInsurancePremium: 400000,
            fuelSavingsPct: 6, 
            accidentReductionPct: 30 
        }
    };
    
    const example = examples[type];
    if (example) {
        Object.entries(example).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) element.value = value;
        });
        updateResults();
    }
}

// Initialize when DOM is ready
function init() {
    // Set default values
    Object.entries(defaults).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && element.type !== 'month') {
            element.value = value;
        }
    });
    
    // Set current month
    const monthElement = document.getElementById('startMonth');
    if (monthElement) {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        monthElement.value = currentMonth;
    }
    
    // Add event listeners
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateResults);
        input.addEventListener('change', updateResults);
    });
    
    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const example = e.target.getAttribute('data-example');
            loadExample(example);
        });
    });
    
    // Initial calculation
    updateResults();
    
    console.log('✅ Simple calculator initialized');
}

// Export for global access
window.SamsaraCalculator = { init, calculate, updateResults, loadExample };

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
