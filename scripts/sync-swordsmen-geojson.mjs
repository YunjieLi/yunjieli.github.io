import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eventsPath = path.join(root, 'src/maps/swordsmen/events.geojson');
const locationsPath = path.join(root, 'src/maps/swordsmen/locations.geojson');
const shouldWrite = process.argv.includes('--write');

function readGeojson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeGeojson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

const events = readGeojson(eventsPath);
const locations = readGeojson(locationsPath);
const byPointId = new Map(
  locations.features
    .filter((feature) => feature.properties.pointID != null)
    .map((feature) => [feature.properties.pointID, feature]),
);

const referencedPointIds = new Set();
let updatedEvents = 0;
const missingLocations = [];

for (const event of events.features) {
  const pointID = event.properties.pointID;
  if (pointID == null) continue;
  referencedPointIds.add(pointID);

  const location = byPointId.get(pointID);
  if (!location) {
    missingLocations.push({ pointID, eventId: event.id, name: event.properties.name });
    continue;
  }

  const nextName = location.properties.name;
  const nextCoords = location.geometry.coordinates.slice();
  const nameChanged = event.properties.name !== nextName;
  const coordsChanged =
    event.geometry.coordinates[0] !== nextCoords[0]
    || event.geometry.coordinates[1] !== nextCoords[1];

  if (nameChanged || coordsChanged) {
    event.properties.name = nextName;
    event.geometry.coordinates = nextCoords;
    updatedEvents += 1;
  }
}

const unusedLocations = locations.features
  .filter((feature) => feature.properties.pointID != null)
  .filter((feature) => !referencedPointIds.has(feature.properties.pointID))
  .map((feature) => ({
    pointID: feature.properties.pointID,
    name: feature.properties.name,
  }));

console.log(`Events: ${events.features.length}`);
console.log(`Locations: ${locations.features.length}`);
console.log(`Updated events from locations: ${updatedEvents}`);
console.log(`Missing locations for event pointIDs: ${missingLocations.length}`);
console.log(`Unused locations (not referenced by events): ${unusedLocations.length}`);

if (missingLocations.length) {
  console.log('\nMissing locations:');
  for (const item of missingLocations) {
    console.log(`  pointID ${item.pointID} (${item.name}) -> event ${item.eventId}`);
  }
}

if (unusedLocations.length) {
  console.log('\nUnused locations:');
  for (const item of unusedLocations) {
    console.log(`  pointID ${item.pointID} (${item.name})`);
  }
}

if (missingLocations.length || unusedLocations.length) {
  process.exitCode = 1;
}

if (shouldWrite && updatedEvents > 0) {
  writeGeojson(eventsPath, events);
  console.log(`\nWrote synced events to ${eventsPath}`);
}
