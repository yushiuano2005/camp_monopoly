import test from "node:test";
import assert from "node:assert/strict";
import Event from "../models/event.js";
import Land from "../models/land.js";
import Pair from "../models/pair.js";
import Resource from "../models/resource.js";
import Team from "../models/team.js";
import { executeEvent2026 } from "./event2026.js";

const sessionResult = (value) => ({ session: async () => value });

const makeTeam = (id, money, bank) => ({
  id,
  money,
  bank,
  save: async () => {},
});

const makeLand = (id, owner, level, overrides = {}) => ({
  id,
  owner,
  level,
  name: `Land ${id}`,
  type: "Building",
  development: null,
  ...overrides,
});

const installModelMocks = (t, { eventId, branches = [], teams, lands }) => {
  const event = {
    id: eventId,
    title: `Event ${eventId}`,
    branches,
    announcement: "",
    selectedBranch: "",
    note: "",
    save: async () => {},
  };
  const resource = { id: 0, price: 10000, save: async () => {} };

  t.mock.method(Event, "findOne", () => sessionResult(event));
  t.mock.method(Resource, "findOne", () => sessionResult(resource));
  t.mock.method(Pair, "findOneAndUpdate", async () => ({}));
  t.mock.method(Team, "find", () => ({
    session: async () => teams,
    sort: () => ({
      session: async () => [...teams].sort((left, right) => right.money - left.money),
    }),
  }));
  t.mock.method(Land, "find", () => ({
    sort: () => ({ session: async () => lands }),
  }));
  t.mock.method(Land, "updateMany", async (filter, update) => {
    for (const currentLand of lands) {
      if (filter.id.$in.includes(currentLand.id)) {
        currentLand.level = update.$set.level;
      }
    }
  });

  return { event, resource };
};

test("event 3 upgrades all eligible purchased properties without changing cash", async (t) => {
  const teams = [makeTeam(1, 40000, 1000), makeTeam(2, 30000, 2000)];
  const lands = [
    makeLand(1, 1, 1),
    makeLand(2, 1, 2),
    makeLand(13, 2, 2),
    makeLand(14, 2, 2),
    makeLand(26, 2, 1, { development: "Park" }),
    makeLand(27, 2, 1, { development: "Park" }),
  ];
  const { resource } = installModelMocks(t, { eventId: 3, teams, lands });

  const result = await executeEvent2026({ eventId: 3, session: {} });

  assert.deepEqual(teams.map((team) => team.money), [40000, 30000]);
  assert.deepEqual(teams.map((team) => team.bank), [1200, 2400]);
  assert.deepEqual(lands.map((item) => item.level), [2, 3, 3, 3, 1, 1]);
  assert.equal(resource.price, 2000);
  assert.match(result.note, /免費升級 3 處地產/);
});

test("culture revolution automatically demolishes one random property per eligible team", async (t) => {
  const teams = [makeTeam(1, 40000, 1000), makeTeam(2, 30000, 2000)];
  const lands = [
    makeLand(1, 1, 2),
    makeLand(2, 1, 3),
    makeLand(13, 2, 2),
    makeLand(14, 2, 2),
    makeLand(26, 2, 3, { development: "Park" }),
    makeLand(27, 2, 3, { development: "Park" }),
  ];
  const { resource } = installModelMocks(t, {
    eventId: 8,
    branches: [{ id: "maga" }, { id: "revolution" }],
    teams,
    lands,
  });
  t.mock.method(Math, "random", () => 0);

  const result = await executeEvent2026({
    eventId: 8,
    branch: "revolution",
    session: {},
  });

  assert.deepEqual(teams.map((team) => team.bank), [1100, 2200]);
  assert.deepEqual(lands.map((item) => item.level), [1, 3, 1, 1, 3, 3]);
  assert.equal(resource.price, 15000);
  assert.match(result.note, /2 個小隊各隨機拆除一棟房屋/);
});

test("final battle maps capitalism to MAGA and communism to Our Property", async (t) => {
  const branches = [{ id: "capitalism" }, { id: "communism" }];

  await t.test("capitalism repeats the MAGA bank effect", async (child) => {
    const teams = [makeTeam(1, 300, 1000), makeTeam(2, 100, 2000)];
    const { resource } = installModelMocks(child, {
      eventId: 10,
      branches,
      teams,
      lands: [],
    });

    await executeEvent2026({ eventId: 10, branch: "capitalism", session: {} });

    assert.deepEqual(teams.map((team) => team.money), [300, 100]);
    assert.deepEqual(teams.map((team) => team.bank), [550, 1100]);
    assert.equal(resource.price, 1000);
  });

  await t.test("communism repeats Our Property using the current cash ranking", async (child) => {
    const teams = [
      makeTeam(1, 300, 1000),
      makeTeam(2, 200, 1000),
      makeTeam(3, 100, 1000),
    ];
    installModelMocks(child, {
      eventId: 10,
      branches,
      teams,
      lands: [],
    });

    await executeEvent2026({ eventId: 10, branch: "communism", session: {} });

    assert.deepEqual(teams.map((team) => team.money), [100, 200, 300]);
    assert.deepEqual(teams.map((team) => team.bank), [1100, 1100, 1100]);
  });
});
