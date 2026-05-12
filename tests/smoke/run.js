'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BACKEND_URL = process.env.OCR_BACKEND_URL || 'http://localhost:8081';
const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'facturas');
const TIMEOUT_MS = 10000;

// ---------------------------------------------------------------------------
// Auth: support explicit token OR auto-generate from JWT_SECRET env var
// Set OCR_AUTH_TOKEN=<jwt>        → uses it directly
// Set OCR_JWT_SECRET=<secret>     → auto-generates smoke HS256 token
// Neither set                     → sends no Authorization header (public endpoint)
// ---------------------------------------------------------------------------
function buildAuthHeaders() {
  if (process.env.OCR_AUTH_TOKEN) {
    return { Authorization: `Bearer ${process.env.OCR_AUTH_TOKEN}` };
  }
  const secret =
    process.env.OCR_JWT_SECRET ||
    process.env.JWT_SECRET ||
    // fallback: known dev secret from container env
    'facturaia-jwt-secret-2025-production';

  // Minimal HS256 JWT (no external lib)
  function b64url(s) {
    return Buffer.from(s)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      sub: 'smoke-test',
      rnc: '131234567',
      empresa_id: 'smoke-test',
      iat: now,
      exp: now + 3600,
    })
  );
  const sig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return { Authorization: `Bearer ${header}.${payload}.${sig}` };
}

// ---------------------------------------------------------------------------
// HTTP fetch with timeout (uses native fetch from Node 18+)
// ---------------------------------------------------------------------------
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Run one fixture, returns { name, coherenceOk, coherenceFails, assertsOk, assertFails, raw }
// ---------------------------------------------------------------------------
async function runFixture(fixtureDir) {
  const name = path.basename(fixtureDir);

  // --- Read files ---
  const dataPath = path.join(fixtureDir, 'extracted_data.json');
  const assertPath = path.join(fixtureDir, 'assert.json');

  if (!fs.existsSync(dataPath)) {
    return { name, error: `Missing extracted_data.json in ${fixtureDir}` };
  }
  if (!fs.existsSync(assertPath)) {
    return { name, error: `Missing assert.json in ${fixtureDir}` };
  }

  let extractedData, assertSpec;
  try {
    extractedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    return { name, error: `JSON parse error in extracted_data.json: ${e.message}` };
  }
  try {
    assertSpec = JSON.parse(fs.readFileSync(assertPath, 'utf8'));
  } catch (e) {
    return { name, error: `JSON parse error in assert.json: ${e.message}` };
  }

  // --- POST to backend ---
  const url = `${BACKEND_URL}/api/v1/invoices/validate`;
  let responseBody;
  let httpStatus;

  const authHeaders = buildAuthHeaders();

  try {
    const res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(extractedData),
      },
      TIMEOUT_MS
    );
    httpStatus = res.status;
    const text = await res.text();
    try {
      responseBody = JSON.parse(text);
    } catch (e) {
      return {
        name,
        error: `HTTP ${httpStatus} — JSON parse error in response: ${text.slice(0, 200)}`,
      };
    }
    if (httpStatus !== 200) {
      return {
        name,
        error: `HTTP ${httpStatus} — ${JSON.stringify(responseBody).slice(0, 200)}`,
      };
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      return { name, error: `Timeout after ${TIMEOUT_MS}ms calling ${url}` };
    }
    if (e.code === 'ECONNREFUSED' || e.cause?.code === 'ECONNREFUSED') {
      return { name, error: `Backend not reachable at ${BACKEND_URL}` };
    }
    return { name, error: `Network error: ${e.message}` };
  }

  const { valid, needs_review, errors = [], warnings = [] } = responseBody;
  const errorCodes = errors.map((e) => e.code || e.field || '');
  const warningCodes = warnings.map((w) => w.code || w.field || '');

  // --- Universal coherence asserts ---
  const coherenceFails = [];

  if (valid === true && errors.length > 0) {
    coherenceFails.push(`contradiction-valid-with-errors: valid=true but errors=[${errorCodes.join(',')}]`);
  }
  if (needs_review === false && warnings.length > 0) {
    coherenceFails.push(`contradiction-no-review-with-warnings: needs_review=false but warnings=[${warningCodes.join(',')}]`);
  }
  if (valid === false && errors.length === 0) {
    coherenceFails.push('contradiction-invalid-without-errors: valid=false but errors=[]');
  }
  if (needs_review === true && warnings.length === 0 && errors.length === 0) {
    coherenceFails.push('contradiction-review-without-issues: needs_review=true but warnings=[] and errors=[]');
  }

  // --- Custom asserts from assert.json ---
  const assertFails = [];

  if (valid !== assertSpec.expected_valid) {
    assertFails.push(
      `expected_valid mismatch: expected=${assertSpec.expected_valid} actual=${valid}`
    );
  }
  if (needs_review !== assertSpec.expected_needs_review) {
    assertFails.push(
      `expected_needs_review mismatch: expected=${assertSpec.expected_needs_review} actual=${needs_review}`
    );
  }

  const warnShouldContain = assertSpec.warnings_codes_should_contain || [];
  for (const code of warnShouldContain) {
    if (!warningCodes.includes(code)) {
      assertFails.push(
        `warnings_codes_should_contain "${code}" — NOT found in warnings=[${warningCodes.join(',')}]`
      );
    }
  }

  const errorsShouldNotContain = assertSpec.errors_codes_should_NOT_contain || [];
  for (const code of errorsShouldNotContain) {
    if (errorCodes.includes(code)) {
      assertFails.push(
        `errors_codes_should_NOT_contain "${code}" — BUT found in errors=[${errorCodes.join(',')}]`
      );
    }
  }

  const warnShouldNotContain = assertSpec.warnings_codes_should_NOT_contain || [];
  for (const code of warnShouldNotContain) {
    if (warningCodes.includes(code)) {
      assertFails.push(
        `warnings_codes_should_NOT_contain "${code}" — BUT found in warnings=[${warningCodes.join(',')}]`
      );
    }
  }

  return {
    name,
    coherenceFails,
    assertFails,
    coherenceOk: coherenceFails.length === 0,
    assertsOk: assertFails.length === 0,
    raw: responseBody,
  };
}

// ---------------------------------------------------------------------------
// Table rendering (no external deps)
// ---------------------------------------------------------------------------
function padEnd(str, len) {
  const s = String(str);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function renderTable(results) {
  const COL_FIXTURE = 30;
  const COL_COHER   = 9;
  const COL_ASSERTS = 9;
  const COL_TOTAL   = 7;

  const hr = `+${'-'.repeat(COL_FIXTURE + 2)}+${'-'.repeat(COL_COHER + 2)}+${'-'.repeat(COL_ASSERTS + 2)}+${'-'.repeat(COL_TOTAL + 2)}+`;

  console.log(hr);
  console.log(
    `| ${padEnd('Fixture', COL_FIXTURE)} | ${padEnd('Coherenc', COL_COHER)} | ${padEnd('Asserts', COL_ASSERTS)} | ${padEnd('Total', COL_TOTAL)} |`
  );
  console.log(hr);

  let passed = 0;
  const details = [];

  for (const r of results) {
    if (r.error) {
      const line = `| ${padEnd(r.name, COL_FIXTURE)} | ${padEnd('ERROR', COL_COHER)} | ${padEnd('ERROR', COL_ASSERTS)} | ${padEnd('x', COL_TOTAL)} |`;
      console.log(line);
      details.push(`  [${r.name}] ERROR: ${r.error}`);
      continue;
    }

    const cStr = r.coherenceOk ? 'PASS' : `FAIL(${r.coherenceFails.length})`;
    const aStr = r.assertsOk   ? 'PASS' : `FAIL(${r.assertFails.length})`;
    const allOk = r.coherenceOk && r.assertsOk;
    const tStr = allOk ? 'OK' : 'FAIL';

    console.log(
      `| ${padEnd(r.name, COL_FIXTURE)} | ${padEnd(cStr, COL_COHER)} | ${padEnd(aStr, COL_ASSERTS)} | ${padEnd(tStr, COL_TOTAL)} |`
    );

    if (allOk) {
      passed++;
    } else {
      const failLines = [...r.coherenceFails, ...r.assertFails].map((f) => `    - ${f}`);
      details.push(`  [${r.name}]:`);
      details.push(...failLines);
      if (r.raw) {
        details.push(`    backend response: valid=${r.raw.valid} needs_review=${r.raw.needs_review} errors=[${(r.raw.errors||[]).map(e=>e.code||e.field).join(',')}] warnings=[${(r.raw.warnings||[]).map(w=>w.code||w.field).join(',')}]`);
      }
    }
  }

  console.log(hr);
  console.log(`Total: ${passed}/${results.length} PASS — exit ${passed === results.length ? 0 : 1}`);

  if (details.length > 0) {
    console.log('\nFAIL details:');
    for (const line of details) {
      console.log(line);
    }
  }

  return passed === results.length ? 0 : 1;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // List fixture dirs alphabetically
  let fixtureDirs;
  try {
    fixtureDirs = fs
      .readdirSync(FIXTURES_DIR)
      .filter((f) => fs.statSync(path.join(FIXTURES_DIR, f)).isDirectory())
      .sort()
      .map((f) => path.join(FIXTURES_DIR, f));
  } catch (e) {
    console.error(`Cannot read fixtures dir ${FIXTURES_DIR}: ${e.message}`);
    process.exit(1);
  }

  if (fixtureDirs.length === 0) {
    console.log('No fixtures found in', FIXTURES_DIR);
    process.exit(0);
  }

  // Run sequentially to avoid hammering backend (easy to parallelise later)
  const results = [];
  for (const dir of fixtureDirs) {
    const result = await runFixture(dir);
    results.push(result);
  }

  const exitCode = renderTable(results);
  process.exit(exitCode);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
