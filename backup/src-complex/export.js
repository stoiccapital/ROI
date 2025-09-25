/**
 * @fileoverview Export functionality for Samsara ROI Calculator
 * Handles CSV export, PDF generation, and share link creation
 */

'use strict';

import { formatCurrency, formatNumber, formatPercentage, currencyConfig } from './state.js';

/**
 * Export controller class
 */
export class ExportController {
    constructor(uiController) {
        this.uiController = uiController;
    }
    
    /**
     * Export data to CSV format
     * @param {Object} results - Calculation results
     * @param {Object} inputs - Input parameters
     */
    exportToCSV(results, inputs) {
        if (!results || !results.timeline) {
            console.error('No results to export');
            return;
        }
        
        const { timeline } = results;
        const currency = inputs.currency || 'EUR';
        const config = currencyConfig[currency];
        
        // CSV headers
        const headers = [
            'Month',
            'Savings Monthly',
            'Costs Monthly', 
            'Net Monthly',
            'Cumulative Net'
        ];
        
        // CSV rows
        const rows = timeline.months.map((month, index) => [
            month,
            formatNumber(timeline.savingsMonthly[index], 2),
            formatNumber(timeline.costsMonthly[index], 2),
            formatNumber(timeline.netMonthly[index], 2),
            formatNumber(timeline.cumNetMonthly[index], 2)
        ]);
        
        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        // Create and download file
        this.downloadFile(csvContent, 'samsara-roi-analysis.csv', 'text/csv');
    }
    
    /**
     * Export to PDF using browser print functionality
     * @param {Object} results - Calculation results
     * @param {Object} inputs - Input parameters
     */
    exportToPDF(results, inputs) {
        // Create a temporary print-friendly version
        const printWindow = window.open('', '_blank');
        const currency = inputs.currency || 'EUR';
        const config = currencyConfig[currency];
        
        const printContent = this.generatePrintContent(results, inputs);
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    }
    
    /**
     * Generate print-friendly HTML content
     * @param {Object} results - Calculation results
     * @param {Object} inputs - Input parameters
     * @returns {string}
     */
    generatePrintContent(results, inputs) {
        const currency = inputs.currency || 'EUR';
        const config = currencyConfig[currency];
        const symbol = config ? config.symbol : '€';
        
        // Convert charts to data URLs
        const sparklineDataURL = this.canvasToDataURL('sparklineCanvas');
        const cashFlowDataURL = this.canvasToDataURL('cashFlowChart');
        const savingsDataURL = this.canvasToDataURL('savingsChart');
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Samsara ROI Calculator - Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .kpi-item {
            text-align: center;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
        }
        .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .kpi-label {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .chart-container {
            text-align: center;
            margin: 20px 0;
        }
        .chart-container img {
            max-width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        .input-summary {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .input-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .input-label {
            font-weight: 500;
        }
        .input-value {
            color: #64748b;
        }
        .disclaimer {
            margin-top: 40px;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .kpi-grid { grid-template-columns: repeat(5, 1fr); }
            .input-summary { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Samsara ROI Calculator</h1>
        <p>Telematics & Dashcams Analysis Report</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="kpi-grid">
        <div class="kpi-item">
            <div class="kpi-value">${results.paybackMonths || '-'}</div>
            <div class="kpi-label">Payback Period (months)</div>
        </div>
        <div class="kpi-item">
            <div class="kpi-value">${results.roiSimplePct ? formatNumber(results.roiSimplePct, 1) + '%' : '-'}</div>
            <div class="kpi-label">ROI</div>
        </div>
        <div class="kpi-item">
            <div class="kpi-value">${results.npv ? formatCurrency(results.npv, currency, 0) : '-'}</div>
