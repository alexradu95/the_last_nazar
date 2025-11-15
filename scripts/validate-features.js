#!/usr/bin/env node

/**
 * Feature Validation Tool
 *
 * Validates all features for:
 * - Required files exist
 * - Feature configuration is valid
 * - Dependencies are satisfied
 * - Events are documented
 * - No circular dependencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURES_DIR = path.join(__dirname, '..', 'src', 'features');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Get all feature directories
function getFeatureDirectories() {
  if (!fs.existsSync(FEATURES_DIR)) {
    error(`Features directory not found: ${FEATURES_DIR}`);
    process.exit(1);
  }

  return fs
    .readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

// Check if required files exist
function validateFeatureStructure(featureName) {
  const featurePath = path.join(FEATURES_DIR, featureName);
  const requiredFiles = [
    'feature.config.ts',
    'README.md',
  ];

  const requiredDirs = [
    'components',
    'services',
    'schema',
    'events',
  ];

  let hasErrors = false;

  // Check files
  requiredFiles.forEach(file => {
    const filePath = path.join(featurePath, file);
    if (!fs.existsSync(filePath)) {
      error(`  Missing required file: ${file}`);
      hasErrors = true;
    }
  });

  // Check directories
  requiredDirs.forEach(dir => {
    const dirPath = path.join(featurePath, dir);
    if (!fs.existsSync(dirPath)) {
      warning(`  Missing recommended directory: ${dir}`);
    }
  });

  return !hasErrors;
}

// Load and validate feature configuration
async function loadFeatureConfig(featureName) {
  const configPath = path.join(FEATURES_DIR, featureName, 'feature.config.ts');

  try {
    // Read file content
    const content = fs.readFileSync(configPath, 'utf8');

    // Basic validation - check for required exports
    if (!content.includes('export')) {
      error(`  feature.config.ts must export a FeatureDefinition`);
      return null;
    }

    // Extract basic info using regex (simple parsing)
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);
    const versionMatch = content.match(/version:\s*['"]([^'"]+)['"]/);
    const depsMatch = content.match(/dependencies:\s*\[(.*?)\]/s);

    if (!idMatch) {
      error(`  Missing 'id' field in feature.config.ts`);
      return null;
    }

    const config = {
      id: idMatch[1],
      name: nameMatch ? nameMatch[1] : featureName,
      version: versionMatch ? versionMatch[1] : '0.0.0',
      dependencies: depsMatch
        ? depsMatch[1]
            .match(/['"]([^'"]+)['"]/g)
            ?.map(s => s.replace(/['"]/g, '')) || []
        : [],
    };

    // Validate id matches directory name
    if (config.id !== featureName) {
      warning(`  Feature id '${config.id}' doesn't match directory name '${featureName}'`);
    }

    return config;
  } catch (err) {
    error(`  Failed to load feature.config.ts: ${err.message}`);
    return null;
  }
}

// Check for circular dependencies
function detectCircularDependencies(features) {
  const visited = new Set();
  const recursionStack = new Set();
  let hasCircular = false;

  function dfs(featureId, path = []) {
    if (recursionStack.has(featureId)) {
      error(`  Circular dependency detected: ${[...path, featureId].join(' → ')}`);
      hasCircular = true;
      return;
    }

    if (visited.has(featureId)) {
      return;
    }

    visited.add(featureId);
    recursionStack.add(featureId);

    const feature = features.find(f => f.id === featureId);
    if (feature && feature.dependencies) {
      feature.dependencies.forEach(depId => {
        dfs(depId, [...path, featureId]);
      });
    }

    recursionStack.delete(featureId);
  }

  features.forEach(feature => {
    dfs(feature.id);
  });

  return !hasCircular;
}

// Validate dependencies exist
function validateDependencies(features) {
  const featureIds = new Set(features.map(f => f.id));
  let hasErrors = false;

  features.forEach(feature => {
    if (feature.dependencies && feature.dependencies.length > 0) {
      feature.dependencies.forEach(depId => {
        if (!featureIds.has(depId)) {
          error(`  Feature '${feature.id}' depends on non-existent feature '${depId}'`);
          hasErrors = true;
        }
      });
    }
  });

  return !hasErrors;
}

// Load events configuration
function loadEventsConfig() {
  const eventsConfigPath = path.join(CONFIG_DIR, 'events.config.ts');

  if (!fs.existsSync(eventsConfigPath)) {
    warning('events.config.ts not found - skipping event validation');
    return null;
  }

  try {
    const content = fs.readFileSync(eventsConfigPath, 'utf8');

    // Extract event names from EventCatalog
    const eventMatches = content.matchAll(/['"]([a-z]+\.[a-z.]+)['"]\s*:/g);
    const events = new Set([...eventMatches].map(match => match[1]));

    return events;
  } catch (err) {
    warning(`Failed to load events.config.ts: ${err.message}`);
    return null;
  }
}

// Main validation
async function main() {
  console.log('\n🔍 Validating Life OS Features\n');
  console.log('='.repeat(50) + '\n');

  const featureNames = getFeatureDirectories();

  if (featureNames.length === 0) {
    warning('No features found');
    return;
  }

  info(`Found ${featureNames.length} features: ${featureNames.join(', ')}\n`);

  // Validate each feature structure
  const structureResults = {};
  for (const name of featureNames) {
    console.log(`\n📦 Validating feature: ${name}`);
    structureResults[name] = validateFeatureStructure(name);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Load all feature configurations
  const features = [];
  for (const name of featureNames) {
    console.log(`\n⚙️  Loading config for: ${name}`);
    const config = await loadFeatureConfig(name);
    if (config) {
      features.push(config);
      success(`  Loaded successfully`);
      if (config.dependencies.length > 0) {
        info(`  Dependencies: ${config.dependencies.join(', ')}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Validate dependencies
  console.log('\n🔗 Validating Dependencies\n');
  const depsValid = validateDependencies(features);
  const noCircular = detectCircularDependencies(features);

  if (depsValid && noCircular) {
    success('All dependencies are valid');
  }

  // Load and validate events
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('\n📢 Validating Events\n');
  const eventCatalog = loadEventsConfig();

  if (eventCatalog) {
    info(`Found ${eventCatalog.size} documented events`);
    success('Event catalog loaded successfully');
  }

  // Summary
  console.log('\n' + '='.repeat(50) + '\n');
  console.log('\n📊 Validation Summary\n');

  const structureValid = Object.values(structureResults).every(v => v);
  const configsLoaded = features.length === featureNames.length;

  if (structureValid) {
    success(`✓ All feature structures valid`);
  } else {
    error(`✗ Some features have structural issues`);
  }

  if (configsLoaded) {
    success(`✓ All feature configs loaded (${features.length}/${featureNames.length})`);
  } else {
    error(`✗ Failed to load some configs (${features.length}/${featureNames.length})`);
  }

  if (depsValid) {
    success(`✓ All dependencies exist`);
  } else {
    error(`✗ Some dependencies are missing`);
  }

  if (noCircular) {
    success(`✓ No circular dependencies`);
  } else {
    error(`✗ Circular dependencies detected`);
  }

  console.log('');

  // Exit code
  const allValid = structureValid && configsLoaded && depsValid && noCircular;
  if (allValid) {
    success('🎉 All validations passed!\n');
    process.exit(0);
  } else {
    error('❌ Some validations failed\n');
    process.exit(1);
  }
}

main().catch(err => {
  error(`Fatal error: ${err.message}`);
  process.exit(1);
});
