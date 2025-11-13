#!/usr/bin/env node

/**
 * Safe Product Scraping & AI Enrichment Demo
 *
 * This script demonstrates a safe data extraction pipeline:
 * 1. Reads product CSV from examples/products.csv
 * 2. Loads corresponding HTML files from examples/html/
 * 3. Parses HTML to extract title, price, and description
 * 4. Calls generate_enriched_description() stub (ready for LLM integration)
 * 5. Writes enriched CSV to output/enriched_products.csv
 *
 * NOTE: This example uses LOCAL HTML files. When scraping real websites,
 * always respect robots.txt, Terms of Service, and rate limits.
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_INPUT_CSV = path.join(__dirname, '../examples/products.csv');
const DEFAULT_OUTPUT_CSV = path.join(__dirname, '../output/enriched_products.csv');
const EXAMPLES_HTML_DIR = path.join(__dirname, '../examples/html');

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse CSV content into array of objects
 * Simple CSV parser that handles basic cases
 */
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Extract text content between HTML tags using regex
 * Safely handles simple HTML structures
 */
function extractFromHTML(html, selector) {
  // Simple regex-based extraction (safer than eval-based parsers for demos)
  // Matches: <class="selector">content</...>
  const classPattern = new RegExp(`<[^>]*class="?${selector}"?[^>]*>([^<]*)<`, 'i');
  const tagPattern = new RegExp(`<${selector}[^>]*>([^<]*)<`, 'i');

  let match = classPattern.exec(html) || tagPattern.exec(html);
  return match ? match[1].trim() : null;
}

/**
 * Parse HTML content and extract product information
 */
function parseProductHTML(htmlContent) {
  try {
    const title = extractFromHTML(htmlContent, 'title') ||
                  extractFromHTML(htmlContent, 'h1');
    const price = extractFromHTML(htmlContent, 'price') ||
                  extractFromHTML(htmlContent, 'span');
    const description = extractFromHTML(htmlContent, 'description') ||
                        extractFromHTML(htmlContent, 'p');

    return {
      title: title || 'N/A',
      price: price || 'N/A',
      description: description || 'N/A'
    };
  } catch (error) {
    console.error(`Error parsing HTML: ${error.message}`);
    return { title: 'N/A', price: 'N/A', description: 'N/A' };
  }
}

/**
 * Stub function for AI enrichment
 * TODO: Replace with actual LLM integration
 *
 * In production, this would call:
 * - OpenAI API (gpt-4, gpt-3.5-turbo)
 * - Anthropic Claude API
 * - Google PaLM / Vertex AI
 * - Local LLM via Ollama or LM Studio
 *
 * Example integration:
 * ```
 * async function generateEnrichedDescription(rawDescription) {
 *   const response = await openai.chat.completions.create({
 *     model: "gpt-4",
 *     messages: [{
 *       role: "user",
 *       content: `Enhance this product description with marketing copy...`
 *     }]
 *   });
 *   return response.choices[0].message.content;
 * }
 * ```
 */
function generateEnrichedDescription(rawDescription) {
  // TODO: Call LLM here (OpenAI, Claude, Vertex AI, etc.)
  // For now, return original with a marker
  return `${rawDescription}\n\n[ENRICHED PLACEHOLDER - TODO: Integrate with LLM API]`;
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);
  // Quote if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Write enriched products to CSV file
 */
function writeEnrichedCSV(enrichedProducts, outputPath) {
  const headers = ['title', 'price', 'enriched_description'];
  const csvLines = [headers.join(',')];

  enrichedProducts.forEach(product => {
    const row = [
      escapeCSVValue(product.title),
      escapeCSVValue(product.price),
      escapeCSVValue(product.enriched_description)
    ];
    csvLines.push(row.join(','));
  });

  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
}

// ============================================================================
// Main Pipeline
// ============================================================================

function main() {
  // Parse command line arguments
  const inputCSV = process.argv[2] || DEFAULT_INPUT_CSV;
  const outputCSV = process.argv[3] || DEFAULT_OUTPUT_CSV;

  console.log('🚀 Product Scraping & Enrichment Pipeline');
  console.log('==========================================\n');
  console.log(`📂 Input CSV:  ${inputCSV}`);
  console.log(`📂 Output CSV: ${outputCSV}\n`);

  try {
    // 1. Read input CSV
    if (!fs.existsSync(inputCSV)) {
      throw new Error(`Input CSV not found: ${inputCSV}`);
    }

    const csvContent = fs.readFileSync(inputCSV, 'utf8');
    const products = parseCSV(csvContent);
    console.log(`📋 Loaded ${products.length} products from CSV\n`);

    if (products.length === 0) {
      throw new Error('No products found in CSV');
    }

    // 2. Process each product
    const enrichedProducts = [];

    products.forEach((product, index) => {
      const htmlFile = product.local_html_filename;
      const htmlPath = path.join(EXAMPLES_HTML_DIR, htmlFile);

      console.log(`[${index + 1}/${products.length}] Processing: ${product.name}`);

      // Load HTML file
      if (!fs.existsSync(htmlPath)) {
        console.error(`  ⚠️  HTML file not found: ${htmlPath}`);
        enrichedProducts.push({
          title: 'N/A',
          price: 'N/A',
          enriched_description: 'ERROR: HTML file not found'
        });
        return;
      }

      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // 3. Parse HTML
      const parsed = parseProductHTML(htmlContent);
      console.log(`  ✓ Extracted: "${parsed.title}" - ${parsed.price}`);

      // 4. Generate enriched description
      const enrichedDescription = generateEnrichedDescription(parsed.description);

      enrichedProducts.push({
        title: parsed.title,
        price: parsed.price,
        enriched_description: enrichedDescription
      });
    });

    console.log();

    // 5. Write output CSV
    if (!fs.existsSync(path.dirname(outputCSV))) {
      fs.mkdirSync(path.dirname(outputCSV), { recursive: true });
    }

    writeEnrichedCSV(enrichedProducts, outputCSV);
    console.log(`✅ Successfully wrote enriched products to: ${outputCSV}`);
    console.log(`📊 Processed ${enrichedProducts.length} products\n`);

    // Display preview
    console.log('Preview of first enriched product:');
    console.log('─'.repeat(60));
    if (enrichedProducts[0]) {
      console.log(`Title:       ${enrichedProducts[0].title}`);
      console.log(`Price:       ${enrichedProducts[0].price}`);
      console.log(`Description: ${enrichedProducts[0].enriched_description.substring(0, 100)}...`);
    }
    console.log('─'.repeat(60));

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the pipeline
main();
