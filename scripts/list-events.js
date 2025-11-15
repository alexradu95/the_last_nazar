#!/usr/bin/env node

/**
 * Event Documentation Tool
 *
 * Lists all events in the system with their emitters and listeners
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = path.join(__dirname, '..', 'config');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load events configuration
function loadEventsConfig() {
  const eventsConfigPath = path.join(CONFIG_DIR, 'events.config.ts');

  if (!fs.existsSync(eventsConfigPath)) {
    log('❌ events.config.ts not found', 'red');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(eventsConfigPath, 'utf8');

    // Parse EventCatalog using regex
    const catalogMatch = content.match(/export const EventCatalog = \{([\s\S]*?)\} as const;/);

    if (!catalogMatch) {
      log('❌ EventCatalog not found in events.config.ts', 'red');
      process.exit(1);
    }

    // Parse individual events
    const eventPattern = /['"]([a-z]+\.[a-z.]+)['"]\s*:\s*\{([\s\S]*?)\},?\s*(?=\n\s*['"]|\/\/|$)/g;
    const events = [];

    let match;
    while ((match = eventPattern.exec(catalogMatch[1])) !== null) {
      const eventName = match[1];
      const eventBody = match[2];

      // Extract properties
      const descMatch = eventBody.match(/description:\s*['"]([^'"]+)['"]/);
      const emitterMatch = eventBody.match(/emitter:\s*['"]([^'"]+)['"]/);
      const listenersMatch = eventBody.match(/listeners:\s*\[(.*?)\]/);

      events.push({
        name: eventName,
        description: descMatch ? descMatch[1] : '',
        emitter: emitterMatch ? emitterMatch[1] : '',
        listeners: listenersMatch
          ? listenersMatch[1]
              .match(/['"]([^'"]+)['"]/g)
              ?.map(s => s.replace(/['"]/g, '')) || []
          : [],
      });
    }

    return events;
  } catch (err) {
    log(`❌ Failed to load events.config.ts: ${err.message}`, 'red');
    process.exit(1);
  }
}

// Group events by category
function groupEventsByCategory(events) {
  const categories = {};

  events.forEach(event => {
    const category = event.name.split('.')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(event);
  });

  return categories;
}

// Display events by category
function displayByCategory(events) {
  const categories = groupEventsByCategory(events);

  console.log('\n📢 Events by Category\n');
  console.log('='.repeat(80) + '\n');

  Object.entries(categories)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, categoryEvents]) => {
      log(`\n${category.toUpperCase()}`, 'cyan');
      log('─'.repeat(80), 'cyan');

      categoryEvents.forEach(event => {
        log(`\n  ${event.name}`, 'green');
        log(`    ${event.description}`, 'reset');
        log(`    Emitter: ${event.emitter}`, 'blue');
        if (event.listeners.length > 0) {
          log(`    Listeners: ${event.listeners.join(', ')}`, 'magenta');
        }
      });
    });
}

// Display events by feature
function displayByFeature(events) {
  const features = {};

  // Group by emitter
  events.forEach(event => {
    if (!features[event.emitter]) {
      features[event.emitter] = { emits: [], listens: [] };
    }
    features[event.emitter].emits.push(event);
  });

  // Add listeners
  events.forEach(event => {
    event.listeners.forEach(listener => {
      if (!features[listener]) {
        features[listener] = { emits: [], listens: [] };
      }
      features[listener].listens.push(event);
    });
  });

  console.log('\n🔌 Events by Feature\n');
  console.log('='.repeat(80) + '\n');

  Object.entries(features)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([feature, { emits, listens }]) => {
      log(`\n${feature.toUpperCase()}`, 'cyan');
      log('─'.repeat(80), 'cyan');

      if (emits.length > 0) {
        log('\n  Emits:', 'green');
        emits.forEach(event => {
          log(`    • ${event.name}`, 'reset');
        });
      }

      if (listens.length > 0) {
        log('\n  Listens:', 'magenta');
        listens.forEach(event => {
          log(`    • ${event.name} (from ${event.emitter})`, 'reset');
        });
      }
    });
}

// Display event flows
function displayEventFlows(events) {
  console.log('\n🔄 Event Flow Diagram\n');
  console.log('='.repeat(80) + '\n');

  events.forEach(event => {
    if (event.listeners.length > 0) {
      log(`\n${event.emitter}`, 'blue');
      log(`  │`, 'yellow');
      log(`  └─ emits: ${event.name}`, 'green');
      event.listeners.forEach((listener, index) => {
        const isLast = index === event.listeners.length - 1;
        log(`      │`, 'yellow');
        log(`      ${isLast ? '└' : '├'}─ → ${listener}`, 'magenta');
      });
    }
  });
}

// Display statistics
function displayStatistics(events) {
  const totalEvents = events.length;
  const features = new Set();
  const categories = new Set();

  events.forEach(event => {
    features.add(event.emitter);
    event.listeners.forEach(listener => features.add(listener));
    categories.add(event.name.split('.')[0]);
  });

  console.log('\n📊 Statistics\n');
  console.log('='.repeat(80) + '\n');
  log(`  Total Events: ${totalEvents}`, 'green');
  log(`  Categories: ${categories.size}`, 'cyan');
  log(`  Features: ${features.size}`, 'blue');

  const withListeners = events.filter(e => e.listeners.length > 0).length;
  log(`  Events with listeners: ${withListeners}`, 'magenta');
  log(`  Events without listeners: ${totalEvents - withListeners}`, 'yellow');
}

// Main
function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'category';

  const events = loadEventsConfig();

  console.log('\n🎯 Life OS Event System\n');

  switch (mode) {
    case 'category':
    case 'cat':
      displayByCategory(events);
      break;

    case 'feature':
    case 'feat':
      displayByFeature(events);
      break;

    case 'flow':
      displayEventFlows(events);
      break;

    case 'stats':
      displayStatistics(events);
      break;

    case 'all':
      displayByCategory(events);
      displayByFeature(events);
      displayEventFlows(events);
      displayStatistics(events);
      break;

    default:
      log(`❌ Unknown mode: ${mode}`, 'red');
      log('\nUsage: npm run list-events [mode]', 'yellow');
      log('\nModes:', 'yellow');
      log('  category, cat  - Group by event category (default)', 'reset');
      log('  feature, feat  - Group by feature', 'reset');
      log('  flow           - Show event flows', 'reset');
      log('  stats          - Show statistics', 'reset');
      log('  all            - Show all views', 'reset');
      process.exit(1);
  }

  console.log('\n');
}

main();
