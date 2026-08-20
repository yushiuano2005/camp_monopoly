import test from "node:test";
import assert from "node:assert/strict";
import {
  planFreePropertyUpgrades,
  planRandomPropertyDemolitions,
} from "./propertyEvent2026.js";

const land = (id, owner, level, overrides = {}) => ({
  id,
  owner,
  level,
  name: `Land ${id}`,
  type: "Building",
  development: null,
  ...overrides,
});

const applyOperations = (lands, operations) =>
  lands.map((item) => {
    const operation = operations.find((candidate) =>
      candidate.landIds.includes(item.id)
    );
    return operation ? { ...item, level: operation.toLevel } : item;
  });

test("free-upgrade event upgrades every eligible purchased property exactly once", () => {
  const operations = planFreePropertyUpgrades([
    land(1, 1, 1),
    land(2, 1, 2),
    land(3, 1, 3),
    land(4, 0, 0),
    land(13, 2, 2, { name: "Large property" }),
    land(14, 2, 2, { name: "Large property" }),
    land(26, 3, 1, { development: "Park" }),
    land(27, 3, 1, { development: "Park" }),
  ]);

  assert.deepEqual(
    operations.map(({ owner, landIds, fromLevel, toLevel }) => ({
      owner,
      landIds,
      fromLevel,
      toLevel,
    })),
    [
      { owner: 1, landIds: [1], fromLevel: 1, toLevel: 2 },
      { owner: 1, landIds: [2], fromLevel: 2, toLevel: 3 },
      { owner: 2, landIds: [13, 14], fromLevel: 2, toLevel: 3 },
    ]
  );
});

test("random-demolition event selects one eligible property per team", () => {
  const randomValues = [0.99, 0];
  const operations = planRandomPropertyDemolitions(
    [
      land(1, 1, 2),
      land(2, 1, 3),
      land(3, 2, 1),
      land(13, 2, 2, { name: "Large property" }),
      land(14, 2, 2, { name: "Large property" }),
      land(26, 3, 3, { development: "Park" }),
      land(27, 3, 3, { development: "Park" }),
    ],
    () => randomValues.shift()
  );

  assert.deepEqual(
    operations.map(({ owner, landIds, fromLevel, toLevel }) => ({
      owner,
      landIds,
      fromLevel,
      toLevel,
    })),
    [
      { owner: 1, landIds: [2], fromLevel: 3, toLevel: 2 },
      { owner: 2, landIds: [13, 14], fromLevel: 2, toLevel: 1 },
    ]
  );
});

test("repeated property events stop cleanly at the level boundaries", () => {
  let upgradeState = [land(1, 1, 1)];
  for (const expectedLevel of [2, 3]) {
    const operations = planFreePropertyUpgrades(upgradeState);
    assert.equal(operations.length, 1);
    upgradeState = applyOperations(upgradeState, operations);
    assert.equal(upgradeState[0].level, expectedLevel);
  }
  assert.deepEqual(planFreePropertyUpgrades(upgradeState), []);

  let demolitionState = [land(1, 1, 3)];
  for (const expectedLevel of [2, 1]) {
    const operations = planRandomPropertyDemolitions(demolitionState, () => 0);
    assert.equal(operations.length, 1);
    demolitionState = applyOperations(demolitionState, operations);
    assert.equal(demolitionState[0].level, expectedLevel);
  }
  assert.deepEqual(planRandomPropertyDemolitions(demolitionState, () => 0), []);
});
