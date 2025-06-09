/**
 * @file EXPORT MANAGER MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Export management module for The Great Calculator.
 * Handles exporting calculator data to various formats including CSV, PDF, JSON, and TXT.
 * Provides comprehensive export options, metadata inclusion, and file download functionality.
 *
 * Features:
 * - Multi-format export support (CSV, PDF, JSON, TXT)
 * - Client-side PDF generation using jsPDF (Vercel-compatible)
 * - Configurable export options and metadata
 * - Automatic file download functionality
 * - Custom formula export capabilities
 * - Timestamp and formatting options
 * - Error handling and validation
 * - Export statistics and monitoring
 *
 * @requires Web APIs: Blob, URL, DOM manipulation
 * @requires jsPDF: Client-side PDF generation library
 */

// ------------ IMPORTS

/**
 * Dynamic import for jsPDF to support code splitting and lazy loading
 * This ensures the PDF library is only loaded when needed, reducing initial bundle size
 */
let jsPDFModule = null;

/**
 * Lazy load jsPDF library
 * @returns {Promise<any>} jsPDF constructor
 */
async function loadJsPDF() {
    if (!jsPDFModule) {
        try {
            // Check if we're in a test environment
            if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
                throw new Error('PDF generation not available in test environment');
            }

            // Dynamic import for better code splitting
            const module = await import('jspdf');
            // Handle different export patterns
            jsPDFModule = module.default?.default || module.default || module.jsPDF || module;

            // Verify we got a constructor
            if (typeof jsPDFModule !== 'function') {
                throw new Error('Invalid jsPDF module loaded');
            }
        } catch (error) {
            console.error('Failed to load jsPDF:', error);
            throw new Error('PDF generation library could not be loaded. Please try again.');
        }
    }
    return jsPDFModule;
}

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} ExportOptions
 * @property {boolean} [includeTimestamp=true] - Whether to include timestamps
 * @property {boolean} [includeMetadata=true] - Whether to include metadata
 * @property {string} [dateFormat='YYYY-MM-DD HH:mm:ss'] - Date format string
 * @property {string} [csvDelimiter=','] - CSV delimiter character
 * @property {string} [pdfPageSize='A4'] - PDF page size
 * @property {string} [pdfOrientation='portrait'] - PDF orientation
 */

/**
 * @typedef {Object} CalculationEntry
 * @property {string} expression - Mathematical expression
 * @property {string} result - Calculation result
 * @property {string} [timestamp] - When calculation was performed
 * @property {number} [index] - Position in history
 */

/**
 * @typedef {Object} ParsedCalculation
 * @property {string} expression - The mathematical expression
 * @property {string} result - The calculation result
 */

/**
 * @typedef {Object} ExportMetadata
 * @property {string} exportDate - When export was generated
 * @property {number} totalCalculations - Number of calculations exported
 * @property {number} [totalFormulas] - Number of formulas exported
 * @property {string} format - Export format used
 * @property {string} [version] - Application version
 * @property {string} [type] - Type of export (history, formulas)
 */

/**
 * @typedef {Object} FormulaEntry
 * @property {string} name - Formula name
 * @property {string} formula - Formula expression
 * @property {string} description - Formula description
 * @property {string} created - Creation date
 * @property {number} useCount - Number of times used
 */

/**
 * @typedef {Object} ExportStatistics
 * @property {string[]} supportedFormats - List of supported export formats
 * @property {ExportOptions} defaultOptions - Default export options
 */

// ------------ EXPORT MANAGER CLASS

/**
 * Export Manager Class
 *
 * Provides comprehensive export functionality for calculator data
 * with support for multiple formats and configurable options.
 *
 * @class ExportManager
 * @example
 * const exportManager = new ExportManager();
 *
 * // Export calculation history to CSV
 * await exportManager.exportHistory(historyArray, 'csv', {
 *   includeTimestamp: true,
 *   includeMetadata: true
 * });
 *
 * // Export custom formulas to JSON
 * await exportManager.exportFormulas(formulasArray, 'json');
 */
class ExportManager {
    /**
     * Create export manager instance
     *
     * Initializes the export manager with supported formats and default options.
     *
     * @constructor
     * @example
     * const exportManager = new ExportManager();
     */
    constructor() {
        /** @type {string[]} List of supported export formats */
        this.supportedFormats = ['csv', 'pdf', 'json', 'txt'];

        /** @type {ExportOptions} Default export configuration options */
        this.defaultOptions = {
            includeTimestamp: true,
            includeMetadata: true,
            dateFormat: 'YYYY-MM-DD HH:mm:ss',
            csvDelimiter: ',',
            pdfPageSize: 'A4',
            pdfOrientation: 'portrait'
        };
    }

    // ------------ MAIN EXPORT METHODS

    /**
     * Export calculation history to specified format
     *
     * Main export method that delegates to format-specific exporters
     * with comprehensive error handling and validation.
     *
     * @async
     * @method exportHistory
     * @param {string[]} history - Array of calculation history strings
     * @param {string} [format='csv'] - Export format: 'csv', 'pdf', 'json', 'txt'
     * @param {ExportOptions} [options={}] - Export configuration options
     * @returns {Promise<void>} Resolves when export is complete
     *
     * @throws {Error} When format is unsupported or history is empty
     *
     * @example
     * const history = ['2 + 2 = 4', '10 * 5 = 50', '100 / 4 = 25'];
     *
     * // Export to CSV with default options
     * await exportManager.exportHistory(history, 'csv');
     *
     * // Export to PDF with custom options
     * await exportManager.exportHistory(history, 'pdf', {
     *   includeMetadata: true,
     *   pdfPageSize: 'Letter'
     * });
     */
    async exportHistory(history, format = 'csv', options = {}) {
        /** @type {ExportOptions} */
        const exportOptions = { ...this.defaultOptions, ...options };

        if (!this.supportedFormats.includes(format)) {
            throw new Error(`Unsupported export format: ${format}`);
        }

        if (!history || history.length === 0) {
            throw new Error('No history data to export');
        }

        try {
            switch (format) {
                case 'csv':
                    return await this.exportToCSV(history, exportOptions);
                case 'pdf':
                    return await this.exportToPDF(history, exportOptions);
                case 'json':
                    return await this.exportToJSON(history, exportOptions);
                case 'txt':
                    return await this.exportToTXT(history, exportOptions);
                default:
                    throw new Error(`Export format ${format} not implemented`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error(`Export failed: ${error.message}`);
        }
    }

    // ------------ FORMAT-SPECIFIC EXPORT METHODS

    /**
     * Export to CSV format
     *
     * Generates a CSV file with calculation history including optional
     * metadata headers and timestamps.
     *
     * @async
     * @method exportToCSV
     * @param {string[]} history - Array of calculation history strings
     * @param {ExportOptions} options - Export configuration options
     * @returns {Promise<void>} Resolves when CSV export is complete
     *
     * @example
     * const history = ['2 + 2 = 4', '10 * 5 = 50'];
     * const options = { includeTimestamp: true, csvDelimiter: ';' };
     * await exportManager.exportToCSV(history, options);
     */
    async exportToCSV(history, options) {
        const { includeTimestamp, includeMetadata, csvDelimiter } = options;

        /** @type {string} */
        let csvContent = '';

        // Add metadata header
        if (includeMetadata) {
            csvContent += `# Calculator History Export\n`;
            csvContent += `# Generated: ${this.getCurrentTimestamp()}\n`;
            csvContent += `# Total Calculations: ${history.length}\n`;
            csvContent += `#\n`;
        }

        // Add CSV headers
        /** @type {string[]} */
        const headers = ['Index', 'Calculation', 'Result'];
        if (includeTimestamp) {
            headers.push('Timestamp');
        }
        csvContent += `${headers.join(csvDelimiter)  }\n`;

        // Add data rows
        history.forEach((calculation, index) => {
            /** @type {ParsedCalculation} */
            const parts = this.parseCalculation(calculation);
            /** @type {string[]} */
            const row = [
                (index + 1).toString(),
                `"${parts.expression}"`,
                `"${parts.result}"`
            ];

            if (includeTimestamp) {
                row.push(`"${this.getCurrentTimestamp()}"`);
            }

            csvContent += `${row.join(csvDelimiter)  }\n`;
        });

        // Download CSV file
        this.downloadFile(csvContent, 'calculator-history.csv', 'text/csv');
    }

    /**
     * Export to PDF format
     *
     * Generates a professional PDF document using jsPDF library with proper
     * formatting, styling, and metadata. Works entirely client-side and is
     * compatible with Vercel's serverless environment.
     *
     * @async
     * @method exportToPDF
     * @param {string[]} history - Array of calculation history strings
     * @param {ExportOptions} options - Export configuration options
     * @returns {Promise<void>} Resolves when PDF export is complete
     *
     * @throws {Error} When PDF generation fails or jsPDF cannot be loaded
     *
     * @example
     * const history = ['2 + 2 = 4', '10 * 5 = 50'];
     * await exportManager.exportToPDF(history, {
     *   includeMetadata: true,
     *   pdfPageSize: 'A4',
     *   pdfOrientation: 'portrait'
     * });
     */
    async exportToPDF(history, options) {
        try {
            // Load jsPDF library dynamically
            const jsPDF = await loadJsPDF();

            const { includeMetadata, pdfPageSize, pdfOrientation } = options;

            // Create new PDF document
            /** @type {any} */
            const doc = new jsPDF({
                orientation: pdfOrientation || 'portrait',
                unit: 'mm',
                format: pdfPageSize || 'a4'
            });

            // Set document properties
            doc.setProperties({
                title: 'Calculator History Report',
                subject: 'Calculation History Export',
                author: 'The Great Calculator',
                creator: 'The Great Calculator v2.0.0',
                producer: 'jsPDF'
            });

            // Generate PDF content
            await this.generatePDFContent(doc, history, options);

            // Generate filename with timestamp
            /** @type {string} */
            const timestamp = this.getCurrentTimestamp().replace(/[\s:]/g, '-');
            /** @type {string} */
            const filename = `calculator-history-${timestamp}.pdf`;

            // Save the PDF
            doc.save(filename);

            console.log(`✅ PDF exported successfully: ${filename}`);
        } catch (error) {
            console.error('❌ PDF export failed:', error);
            throw new Error(`PDF export failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF content using jsPDF
     *
     * Creates a professionally formatted PDF document with proper typography,
     * spacing, and layout. Includes headers, metadata, calculation history,
     * and footer with pagination support.
     *
     * @async
     * @method generatePDFContent
     * @param {any} doc - jsPDF document instance
     * @param {string[]} history - Array of calculation history strings
     * @param {ExportOptions} options - Export configuration options
     * @returns {Promise<void>} Resolves when PDF content is generated
     *
     * @example
     * const doc = new jsPDF();
     * await exportManager.generatePDFContent(doc, history, options);
     */
    async generatePDFContent(doc, history, options) {
        const { includeMetadata } = options;

        // PDF styling constants
        const colors = {
            primary: '#007AFF',
            text: '#333333',
            secondary: '#666666',
            light: '#F2F2F7'
        };

        const fonts = {
            title: 16,
            heading: 14,
            body: 10,
            small: 8
        };

        const margins = {
            top: 20,
            left: 20,
            right: 20,
            bottom: 20
        };

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margins.left - margins.right;

        let currentY = margins.top;

        // Helper function to check if we need a new page
        const checkPageBreak = (requiredHeight) => {
            if (currentY + requiredHeight > pageHeight - margins.bottom) {
                doc.addPage();
                currentY = margins.top;
                this.addPageHeader(doc, pageWidth, margins, colors, fonts);
                currentY += 25; // Space after header
            }
        };

        // Add main header
        this.addMainHeader(doc, pageWidth, margins, colors, fonts);
        currentY += 35;

        // Add metadata section if requested
        if (includeMetadata) {
            checkPageBreak(30);
            currentY = this.addMetadataSection(doc, history, currentY, margins, colors, fonts, contentWidth);
            currentY += 10;
        }

        // Add calculations header
        checkPageBreak(15);
        doc.setFontSize(fonts.heading);
        doc.setTextColor(colors.text);
        doc.text('Calculation History', margins.left, currentY);
        currentY += 10;

        // Add table headers
        checkPageBreak(10);
        this.addTableHeaders(doc, currentY, margins, colors, fonts, contentWidth);
        currentY += 8;

        // Add calculations
        history.forEach((calculation, index) => {
            checkPageBreak(8);
            currentY = this.addCalculationRow(doc, calculation, index, currentY, margins, colors, fonts, contentWidth);
        });

        // Add footer to all pages
        this.addFooterToAllPages(doc, pageWidth, pageHeight, margins, colors, fonts);
    }

    /**
     * Add main header to PDF
     * @method addMainHeader
     * @param {any} doc - jsPDF document instance
     * @param {number} pageWidth - Page width
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     */
    addMainHeader(doc, pageWidth, margins, colors, fonts) {
        // Title
        doc.setFontSize(fonts.title);
        doc.setTextColor(colors.primary);
        doc.text('Calculator History Report', pageWidth / 2, margins.top + 5, { align: 'center' });

        // Subtitle with timestamp
        doc.setFontSize(fonts.body);
        doc.setTextColor(colors.secondary);
        doc.text(`Generated on ${this.getCurrentTimestamp()}`, pageWidth / 2, margins.top + 15, { align: 'center' });

        // Decorative line
        doc.setDrawColor(colors.primary);
        doc.setLineWidth(0.5);
        doc.line(margins.left, margins.top + 20, pageWidth - margins.right, margins.top + 20);
    }

    /**
     * Add page header for subsequent pages
     * @method addPageHeader
     * @param {any} doc - jsPDF document instance
     * @param {number} pageWidth - Page width
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     */
    addPageHeader(doc, pageWidth, margins, colors, fonts) {
        doc.setFontSize(fonts.body);
        doc.setTextColor(colors.secondary);
        doc.text('Calculator History Report', pageWidth / 2, margins.top + 5, { align: 'center' });

        doc.setDrawColor(colors.primary);
        doc.setLineWidth(0.3);
        doc.line(margins.left, margins.top + 10, pageWidth - margins.right, margins.top + 10);
    }

    /**
     * Add metadata section to PDF
     * @method addMetadataSection
     * @param {any} doc - jsPDF document instance
     * @param {string[]} history - Calculation history
     * @param {number} currentY - Current Y position
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     * @param {number} contentWidth - Content width
     * @returns {number} New Y position
     */
    addMetadataSection(doc, history, currentY, margins, colors, fonts, contentWidth) {
        // Metadata box background
        doc.setFillColor(colors.light);
        doc.rect(margins.left, currentY - 5, contentWidth, 25, 'F');

        // Metadata title
        doc.setFontSize(fonts.heading);
        doc.setTextColor(colors.text);
        doc.text('Report Summary', margins.left + 5, currentY + 5);

        // Metadata content
        doc.setFontSize(fonts.body);
        doc.setTextColor(colors.secondary);
        doc.text(`Total Calculations: ${history.length}`, margins.left + 5, currentY + 12);
        doc.text(`Export Date: ${this.getCurrentTimestamp()}`, margins.left + 5, currentY + 18);
        doc.text('Format: PDF Report', margins.left + 5, currentY + 24);

        return currentY + 30;
    }

    /**
     * Add table headers to PDF
     * @method addTableHeaders
     * @param {any} doc - jsPDF document instance
     * @param {number} currentY - Current Y position
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     * @param {number} contentWidth - Content width
     */
    addTableHeaders(doc, currentY, margins, colors, fonts, contentWidth) {
        // Header background
        doc.setFillColor(colors.primary);
        doc.rect(margins.left, currentY - 3, contentWidth, 8, 'F');

        // Header text
        doc.setFontSize(fonts.body);
        doc.setTextColor(255, 255, 255); // White text
        doc.text('#', margins.left + 2, currentY + 2);
        doc.text('Expression', margins.left + 15, currentY + 2);
        doc.text('Result', margins.left + contentWidth - 30, currentY + 2);
    }

    /**
     * Add calculation row to PDF
     * @method addCalculationRow
     * @param {any} doc - jsPDF document instance
     * @param {string} calculation - Calculation string
     * @param {number} index - Row index
     * @param {number} currentY - Current Y position
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     * @param {number} contentWidth - Content width
     * @returns {number} New Y position
     */
    addCalculationRow(doc, calculation, index, currentY, margins, colors, fonts, contentWidth) {
        /** @type {ParsedCalculation} */
        const parts = this.parseCalculation(calculation);

        // Alternating row background
        if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margins.left, currentY - 2, contentWidth, 6, 'F');
        }

        // Row content
        doc.setFontSize(fonts.body);
        doc.setTextColor(colors.text);
        doc.text((index + 1).toString(), margins.left + 2, currentY + 2);

        // Truncate long expressions if needed
        const maxExpressionWidth = contentWidth - 60;
        let expression = parts.expression;
        if (doc.getTextWidth(expression) > maxExpressionWidth) {
            while (doc.getTextWidth(`${expression  }...`) > maxExpressionWidth && expression.length > 10) {
                expression = expression.slice(0, -1);
            }
            expression += '...';
        }
        doc.text(expression, margins.left + 15, currentY + 2);

        // Result (right-aligned)
        doc.setTextColor(colors.primary);
        doc.text(parts.result, margins.left + contentWidth - 30, currentY + 2);

        return currentY + 6;
    }

    /**
     * Add footer to all pages
     * @method addFooterToAllPages
     * @param {any} doc - jsPDF document instance
     * @param {number} pageWidth - Page width
     * @param {number} pageHeight - Page height
     * @param {Object} margins - Margin configuration
     * @param {Object} colors - Color configuration
     * @param {Object} fonts - Font size configuration
     */
    addFooterToAllPages(doc, pageWidth, pageHeight, margins, colors, fonts) {
        const totalPages = doc.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            // Footer line
            doc.setDrawColor(colors.secondary);
            doc.setLineWidth(0.3);
            doc.line(margins.left, pageHeight - margins.bottom + 5, pageWidth - margins.right, pageHeight - margins.bottom + 5);

            // Footer text
            doc.setFontSize(fonts.small);
            doc.setTextColor(colors.secondary);
            doc.text('Generated by The Great Calculator', margins.left, pageHeight - margins.bottom + 10);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - margins.right, pageHeight - margins.bottom + 10, { align: 'right' });
        }
    }

    /**
     * Export to JSON format
     *
     * Generates a structured JSON file with calculation history and
     * optional metadata in a machine-readable format.
     *
     * @async
     * @method exportToJSON
     * @param {string[]} history - Array of calculation history strings
     * @param {ExportOptions} options - Export configuration options
     * @returns {Promise<void>} Resolves when JSON export is complete
     *
     * @example
     * const history = ['2 + 2 = 4', '10 * 5 = 50'];
     * await exportManager.exportToJSON(history, { includeMetadata: true });
     */
    async exportToJSON(history, options) {
        const { includeTimestamp, includeMetadata } = options;

        /** @type {Object} */
        const exportData = {
            metadata: includeMetadata ? {
                exportDate: this.getCurrentTimestamp(),
                totalCalculations: history.length,
                format: 'json',
                version: '2.0.0'
            } : undefined,
            calculations: history.map((calculation, index) => {
                /** @type {ParsedCalculation} */
                const parts = this.parseCalculation(calculation);
                /** @type {CalculationEntry} */
                const item = {
                    index: index + 1,
                    expression: parts.expression,
                    result: parts.result
                };

                if (includeTimestamp) {
                    item.timestamp = this.getCurrentTimestamp();
                }

                return item;
            })
        };

        /** @type {string} */
        const jsonContent = JSON.stringify(exportData, null, 2);
        this.downloadFile(jsonContent, 'calculator-history.json', 'application/json');
    }

    /**
     * Export to plain text format
     *
     * Generates a simple, human-readable text file with calculation
     * history and optional metadata headers.
     *
     * @async
     * @method exportToTXT
     * @param {string[]} history - Array of calculation history strings
     * @param {ExportOptions} options - Export configuration options
     * @returns {Promise<void>} Resolves when TXT export is complete
     *
     * @example
     * const history = ['2 + 2 = 4', '10 * 5 = 50'];
     * await exportManager.exportToTXT(history, { includeMetadata: true });
     */
    async exportToTXT(history, options) {
        const { _includeTimestamp, includeMetadata } = options;

        /** @type {string} */
        let content = '';

        if (includeMetadata) {
            content += 'Calculator History Export\n';
            content += '========================\n\n';
            content += `Generated: ${this.getCurrentTimestamp()}\n`;
            content += `Total Calculations: ${history.length}\n\n`;
        }

        history.forEach((calculation, index) => {
            /** @type {ParsedCalculation} */
            const parts = this.parseCalculation(calculation);
            content += `${index + 1}. ${parts.expression} = ${parts.result}\n`;
        });

        if (includeMetadata) {
            content += '\n---\n';
            content += 'Generated by The Great Calculator\n';
        }

        this.downloadFile(content, 'calculator-history.txt', 'text/plain');
    }

    // ------------ UTILITY METHODS

    /**
     * Parse calculation string into expression and result
     *
     * Splits a calculation string (e.g., "2 + 2 = 4") into separate
     * expression and result components for structured export.
     *
     * @method parseCalculation
     * @param {string} calculation - Calculation string to parse
     * @returns {ParsedCalculation} Object with expression and result
     *
     * @example
     * const parsed = exportManager.parseCalculation('2 + 2 = 4');
     * console.log(parsed.expression); // "2 + 2"
     * console.log(parsed.result); // "4"
     */
    parseCalculation(calculation) {
        /** @type {string[]} */
        const parts = calculation.split(' = ');
        return {
            expression: parts[0] || calculation,
            result: parts[1] || 'N/A'
        };
    }

    /**
     * Get current timestamp in specified format
     *
     * Generates a formatted timestamp string for use in export metadata.
     * Uses simple date formatting - consider using date-fns in production.
     *
     * @method getCurrentTimestamp
     * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - Date format (currently ignored)
     * @returns {string} Formatted timestamp string
     *
     * @example
     * const timestamp = exportManager.getCurrentTimestamp();
     * console.log(timestamp); // "2024-01-15 14:30:25"
     */
    getCurrentTimestamp(_format = 'YYYY-MM-DD HH:mm:ss') {
        /** @type {Date} */
        const now = new Date();

        // Simple date formatting (in production, consider using a library like date-fns)
        /** @type {number} */
        const year = now.getFullYear();
        /** @type {string} */
        const month = String(now.getMonth() + 1).padStart(2, '0');
        /** @type {string} */
        const day = String(now.getDate()).padStart(2, '0');
        /** @type {string} */
        const hours = String(now.getHours()).padStart(2, '0');
        /** @type {string} */
        const minutes = String(now.getMinutes()).padStart(2, '0');
        /** @type {string} */
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * Download file with specified content
     *
     * Creates a downloadable file using the Blob API and triggers
     * an automatic download in the user's browser.
     *
     * @method downloadFile
     * @param {string} content - File content to download
     * @param {string} filename - Name for the downloaded file
     * @param {string} mimeType - MIME type for the file
     * @returns {void}
     *
     * @example
     * exportManager.downloadFile('Hello, World!', 'test.txt', 'text/plain');
     */
    downloadFile(content, filename, mimeType) {
        /** @type {Blob} */
        const blob = new Blob([content], { type: mimeType });
        /** @type {string} */
        const url = URL.createObjectURL(blob);

        /** @type {HTMLAnchorElement} */
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    // ------------ FORMULA EXPORT METHODS

    /**
     * Export custom formulas
     *
     * Exports user-defined formulas to specified format with metadata
     * including usage statistics and creation dates.
     *
     * @async
     * @method exportFormulas
     * @param {FormulaEntry[]} formulas - Array of formula objects
     * @param {string} [format='json'] - Export format: 'json' or 'csv'
     * @param {ExportOptions} [options={}] - Export configuration options
     * @returns {Promise<void>} Resolves when formula export is complete
     *
     * @throws {Error} When no formulas provided or format unsupported
     *
     * @example
     * const formulas = [
     *   {
     *     name: 'Quadratic',
     *     formula: 'a*x^2 + b*x + c',
     *     description: 'Quadratic equation',
     *     created: '2024-01-01',
     *     useCount: 5
     *   }
     * ];
     * await exportManager.exportFormulas(formulas, 'json');
     */
    async exportFormulas(formulas, format = 'json', _options = {}) {
        if (!formulas || formulas.length === 0) {
            throw new Error('No formulas to export');
        }

        /** @type {Object} */
        const exportData = {
            metadata: {
                exportDate: this.getCurrentTimestamp(),
                totalFormulas: formulas.length,
                format,
                type: 'formulas'
            },
            formulas: formulas.map(formula => ({
                name: formula.name,
                formula: formula.formula,
                description: formula.description,
                created: formula.created,
                useCount: formula.useCount
            }))
        };

        if (format === 'json') {
            /** @type {string} */
            const content = JSON.stringify(exportData, null, 2);
            this.downloadFile(content, 'calculator-formulas.json', 'application/json');
        } else if (format === 'csv') {
            /** @type {string} */
            let csvContent = 'Name,Formula,Description,Created,Use Count\n';
            formulas.forEach(formula => {
                csvContent += `"${formula.name}","${formula.formula}","${formula.description}","${formula.created}",${formula.useCount}\n`;
            });
            this.downloadFile(csvContent, 'calculator-formulas.csv', 'text/csv');
        }
    }

    // ------------ STATISTICS METHODS

    /**
     * Get export statistics
     *
     * Returns information about supported export formats and
     * default configuration options for the export manager.
     *
     * @method getStatistics
     * @returns {ExportStatistics} Export manager statistics
     *
     * @example
     * const stats = exportManager.getStatistics();
     * console.log('Supported formats:', stats.supportedFormats);
     * console.log('Default options:', stats.defaultOptions);
     */
    getStatistics() {
        return {
            supportedFormats: this.supportedFormats,
            defaultOptions: this.defaultOptions
        };
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default ExportManager
 */
export default ExportManager;
