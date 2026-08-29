import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv-defaults";
import apiRouter from "./api.js";
import Team from "../models/team.js";
import Land from "../models/land.js";
import User from "../models/user.js";

const TEST_DATABASE_PREFIX = "cm_it_";
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDirectory, "../.env") });

const sourceMongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;

const createTestMongoUrl = (sourceUrl, databaseName) => {
  const parsed = new URL(sourceUrl);
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
};

const requestJson = async (baseUrl, pathname, options = {}) => {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { status: response.status, body };
};

test(
  "property operations work through the authenticated API",
  { skip: !sourceMongoUrl },
  async () => {
    const databaseName = `${TEST_DATABASE_PREFIX}${String(Date.now()).slice(-8)}_${Math.random()
      .toString(16)
      .slice(2)}`;
    const mongoUrl = createTestMongoUrl(sourceMongoUrl, databaseName);
    let server;

    try {
      await mongoose.connect(mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });
      assert.equal(mongoose.connection.name, databaseName);

      await User.create({ username: "admin", password: "integration-test-only" });
      await Team.create([
        {
          id: 1,
          teamname: "Team 01",
          money: 40000,
          bank: 0,
          resources: { eecoin: 0 },
          bonus: { value: 1, time: Date.now() / 1000, duration: 3600 },
          soulgem: { value: false, time: Date.now() / 1000 },
        },
        {
          id: 2,
          teamname: "Team 02",
          money: 40000,
          bank: 0,
          resources: { eecoin: 0 },
          bonus: { value: 1, time: Date.now() / 1000, duration: 3600 },
          soulgem: { value: false, time: Date.now() / 1000 },
        },
      ]);
      await Land.create([
        {
          id: 2,
          type: "Building",
          name: "Discount Test Property",
          area: 1,
          owner: 0,
          level: 0,
          buffed: 0,
          price: { buy: 14000, upgrade: 7000 },
          rent: [2000, 4000, 8000],
        },
        {
          id: 13,
          type: "Building",
          name: "Large Property A",
          area: 2,
          owner: 1,
          level: 3,
          buffed: 0,
          price: { buy: 30000, upgrade: 15000 },
          rent: [3000, 4000, 5000],
          largePropertyGroup: 13,
          development: "Hotel",
          transportFee: [0, 0, 0],
        },
        {
          id: 14,
          type: "Building",
          name: "Large Property A",
          area: 2,
          owner: 1,
          level: 3,
          buffed: 0,
          price: { buy: 30000, upgrade: 15000 },
          rent: [3000, 4000, 5000],
          largePropertyGroup: 13,
          development: "Hotel",
          transportFee: [0, 0, 0],
        },
      ]);

      const app = express();
      app.use(express.json());
      app.use((request, response, next) => {
        request.io = { emit: () => {} };
        next();
      });
      app.use("/api", apiRouter);
      server = app.listen(0);
      await new Promise((resolve) => server.once("listening", resolve));
      const address = server.address();
      const baseUrl = `http://127.0.0.1:${address.port}`;

      const login = await requestJson(baseUrl, "/api/login", {
        method: "POST",
        body: JSON.stringify({
          username: "admin",
          password: "integration-test-only",
        }),
      });
      assert.equal(login.status, 200);
      assert.ok(login.body.token);
      const authenticatedHeaders = {
        authorization: `Bearer ${login.body.token}`,
      };

      const demolition = await requestJson(baseUrl, "/api/property/demolish", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({ teamId: 1, landId: 13 }),
      });
      assert.equal(demolition.status, 200);
      assert.deepEqual(demolition.body.landIds, [13, 14]);
      assert.equal(demolition.body.previousLevel, 3);
      assert.equal(demolition.body.level, 2);
      const linkedLands = await Land.find({ id: { $in: [13, 14] } }).sort({ id: 1 });
      assert.deepEqual(linkedLands.map((land) => land.level), [2, 2]);
      assert.equal((await Team.findOne({ id: 1 })).money, 40000);

      const clearLargeProperty = await requestJson(
        baseUrl,
        "/api/property/clear-ownership",
        {
          method: "POST",
          headers: authenticatedHeaders,
          body: JSON.stringify({ teamId: 1, landId: 13 }),
        }
      );
      assert.equal(clearLargeProperty.status, 200);
      assert.deepEqual(clearLargeProperty.body.landIds, [13, 14]);
      const clearedLinkedLands = await Land.find({ id: { $in: [13, 14] } }).sort({ id: 1 });
      for (const land of clearedLinkedLands) {
        assert.equal(land.owner, 0);
        assert.equal(land.level, 0);
        assert.equal(land.buffed, 0);
        assert.deepEqual(land.rent, [0, 0, 0]);
        assert.equal(land.development, null);
        assert.deepEqual(land.transportFee, [2000, 3000, 4000]);
      }
      assert.equal((await Team.findOne({ id: 1 })).money, 40000);

      const purchase = await requestJson(baseUrl, "/api/property/purchase", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({ teamId: 2, landId: 2, discountPercent: 30 }),
      });
      assert.equal(purchase.status, 200);
      assert.equal(purchase.body.basePrice, 14000);
      assert.equal(purchase.body.price, 9800);
      assert.equal((await Team.findOne({ id: 2 })).money, 30200);
      assert.equal((await Land.findOne({ id: 2 })).owner, 2);

      const upgrade = await requestJson(baseUrl, "/api/property/upgrade", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({ teamId: 2, landId: 2, discountPercent: 50 }),
      });
      assert.equal(upgrade.status, 200);
      assert.equal(upgrade.body.basePrice, 7000);
      assert.equal(upgrade.body.price, 3500);
      assert.equal((await Team.findOne({ id: 2 })).money, 26700);
      assert.equal((await Land.findOne({ id: 2 })).level, 2);

      const rent = await requestJson(baseUrl, "/api/transfer", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({
          from: 2,
          to: 1,
          IsEstate: true,
          baseDollar: 8000,
          discountPercent: 20,
        }),
      });
      assert.equal(rent.status, 200);
      assert.equal(rent.body.amount, 6400);
      assert.equal(rent.body.transferAmount, 6400);
      assert.equal((await Team.findOne({ id: 2 })).money, 20300);
      assert.equal((await Team.findOne({ id: 1 })).money, 46400);

      const invalidRate = await requestJson(baseUrl, "/api/transfer", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({
          from: 2,
          to: 1,
          IsEstate: true,
          baseDollar: 1000,
          discountPercent: 25,
        }),
      });
      assert.equal(invalidRate.status, 400);

      const invalidDiscount = await requestJson(baseUrl, "/api/transfer", {
        method: "POST",
        headers: authenticatedHeaders,
        body: JSON.stringify({
          from: 2,
          to: 1,
          IsEstate: false,
          baseDollar: 1000,
          discountPercent: 20,
        }),
      });
      assert.equal(invalidDiscount.status, 400);
      assert.equal((await Team.findOne({ id: 2 })).money, 20300);
      assert.equal((await Team.findOne({ id: 1 })).money, 46400);

      const clearNormalProperty = await requestJson(
        baseUrl,
        "/api/property/clear-ownership",
        {
          method: "POST",
          headers: authenticatedHeaders,
          body: JSON.stringify({ teamId: 2, landId: 2 }),
        }
      );
      assert.equal(clearNormalProperty.status, 200);
      const clearedNormalLand = await Land.findOne({ id: 2 });
      assert.equal(clearedNormalLand.owner, 0);
      assert.equal(clearedNormalLand.level, 0);
      assert.equal(clearedNormalLand.buffed, 0);
      assert.deepEqual(clearedNormalLand.rent, [8000, 12000, 16000]);
      assert.equal((await Team.findOne({ id: 2 })).money, 20300);
    } finally {
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
      if (mongoose.connection.readyState === 1) {
        assert.ok(mongoose.connection.name.startsWith(TEST_DATABASE_PREFIX));
        await mongoose.connection.dropDatabase();
      }
      await mongoose.disconnect();
    }
  }
);
