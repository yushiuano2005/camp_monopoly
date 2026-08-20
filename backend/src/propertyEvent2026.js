import { getLargePropertyGroup, getLinkedLandIds } from "./largeProperties.js";

const PROPERTY_TYPES = new Set(["Building", "SpecialBuilding"]);

const propertyKey = (land) => {
  const group = getLargePropertyGroup(land.id);
  return group ? `large-${group}` : `land-${Number(land.id)}`;
};

const isOwnedProperty = (land) =>
  Number(land.owner) > 0 &&
  Number(land.level) > 0 &&
  PROPERTY_TYPES.has(land.type) &&
  land.development !== "Park";

export const getUniqueOwnedProperties = (lands) => {
  const seen = new Set();

  return [...lands]
    .sort((left, right) => Number(left.id) - Number(right.id))
    .filter((land) => {
      if (!isOwnedProperty(land)) return false;
      const key = propertyKey(land);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const toLevelOperation = (land, toLevel) => ({
  owner: Number(land.owner),
  landId: Number(land.id),
  landIds: getLinkedLandIds(land.id),
  name: land.name,
  fromLevel: Number(land.level),
  toLevel,
});

export const planFreePropertyUpgrades = (lands) =>
  getUniqueOwnedProperties(lands)
    .filter((land) => Number(land.level) < 3)
    .map((land) => toLevelOperation(land, Number(land.level) + 1));

export const planRandomPropertyDemolitions = (lands, random = Math.random) => {
  const propertiesByOwner = new Map();

  for (const land of getUniqueOwnedProperties(lands)) {
    if (Number(land.level) <= 1) continue;
    const owner = Number(land.owner);
    const properties = propertiesByOwner.get(owner) ?? [];
    properties.push(land);
    propertiesByOwner.set(owner, properties);
  }

  return [...propertiesByOwner.entries()]
    .sort(([leftOwner], [rightOwner]) => leftOwner - rightOwner)
    .map(([, properties]) => {
      const randomValue = Number(random());
      const safeRandomValue = Number.isFinite(randomValue)
        ? Math.min(Math.max(randomValue, 0), 0.9999999999999999)
        : 0;
      const index = Math.floor(safeRandomValue * properties.length);
      const selected = properties[index];
      return toLevelOperation(selected, Number(selected.level) - 1);
    });
};
