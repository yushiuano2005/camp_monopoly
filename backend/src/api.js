import express from "express";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import Team from "../models/team.js";
import Land from "../models/land.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import Event from "../models/event.js";
import Pair from "../models/pair.js";
import Effect from "../models/effect.js";
import Broadcast from "../models/broadcast.js";
import Resource from "../models/resource.js";
import { executeEvent2026, getEventPayload } from "./event2026.js";
import {
  getDefaultEventAnnouncement,
  getEventExecutionDetails,
  getOrderedEventBranches,
} from "./eventContent2026.js";
import {
  getInitialLandDefinition,
  RESET_SCOPE_OPTIONS,
  resetGameData,
} from "./initdata.js";
import {
  getDevelopmentConfig,
  getLargePropertyGroup,
  getLinkedLandIds,
  isLargeProperty,
} from "./largeProperties.js";
import { calculateDiscountedAmount } from "./pricing.js";
const router = express.Router();
const operatorSessions = new Map();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const createAuthSession = (username) => {
  const token = randomBytes(32).toString("hex");
  operatorSessions.set(token, { username, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
};

const getAuthSession = (req) => {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const session = operatorSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) operatorSessions.delete(token);
    return null;
  }
  return session;
};

const requireOperator = (req, res, next) => {
  const session = getAuthSession(req);
  if (!session) {
    return res.status(401).json({ error: "Operator login required" });
  }
  if (!["npc", "admin"].includes(String(session.username).toLowerCase())) {
    return res.status(403).json({ error: "NPC or Admin permission required" });
  }

  req.operator = session;
  return next();
};

const requireAdmin = (req, res, next) => {
  const session = getAuthSession(req);
  if (!session) {
    return res.status(401).json({ error: "Admin login required" });
  }
  if (String(session.username).toLowerCase() !== "admin") {
    return res.status(403).json({ error: "Admin permission required" });
  }

  req.operator = session;
  return next();
};

const requireTeamSelfOrOperator = (req, res, next) => {
  const session = getAuthSession(req);
  if (!session) return res.status(401).json({ error: "Login required" });

  const username = String(session.username).toLowerCase();
  if (["npc", "admin"].includes(username)) {
    req.operator = session;
    return next();
  }

  const match = username.match(/^team0?([1-9])$/) ?? username.match(/^第0?([1-9])小隊$/);
  if (match && Number(match[1]) === Number(req.params.teamId)) {
    req.operator = session;
    return next();
  }
  return res.status(403).json({ error: "You may only view your own team data" });
};

const normalizeLand = (land) => {
  const data = land.toObject ? land.toObject() : { ...land };
  const group = getLargePropertyGroup(data.id);
  if (!group) return data;

  return {
    ...data,
    largePropertyGroup: Number(group),
    development: data.development ?? null,
    transportFee:
      data.transportFee?.length === 3
        ? data.transportFee
        : [2000, 3000, 4000],
  };
};

const updateLinkedLandState = async (landId, state, options = {}) =>
  Land.updateMany(
    { id: { $in: getLinkedLandIds(landId) } },
    { $set: state },
    options
  );

const resetLinkedLandState = async (landId, options = {}) => {
  const state = { owner: 0, level: 0 };
  if (isLargeProperty(landId)) {
    state.buffed = 0;
    state.development = null;
    state.rent = [0, 0, 0];
    state.transportFee = [2000, 3000, 4000];
  }
  return updateLinkedLandState(landId, state, options);
};

const uniqueOwnedProperties = (lands) => {
  const seen = new Set();
  return lands.filter((land) => {
    const key = getLargePropertyGroup(land.id) ?? `land-${land.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const buffBuildings2 = async (building_1, building_2) => {
  for (let i = 0; i < 3; i++) {
    if (building_1.buffed !== 1) building_1.rent[i] *= 1.5;
    if (building_2.buffed !== 1) building_2.rent[i] *= 1.5;
  }
  building_1.buffed = 1;
  building_2.buffed = 1;
  await building_1.save();
  await building_2.save();
};

const debuffBuildings2 = async (building_1, building_2) => {
  building_1.buffed = 0;
  building_2.buffed = 0;
  for (let i = 0; i < 3; i++) {
    building_1.rent[i] /= 1.5;
    building_2.rent[i] /= 1.5;
  }

  await building_1.save();
  await building_2.save();
};

const buffBuildings3 = async (building_1, building_2, building_3) => {
  for (let i = 0; i < 3; i++) {
    if (building_1.buffed === 1) building_1.rent[i] /= 1.5;
    if (building_2.buffed === 1) building_2.rent[i] /= 1.5;
    if (building_3.buffed === 1) building_3.rent[i] /= 1.5;
    building_1.rent[i] *= 2;
    building_2.rent[i] *= 2;
    building_3.rent[i] *= 2;
  }
  building_1.buffed = 2;
  building_2.buffed = 2;
  building_3.buffed = 2;
  await building_1.save();
  await building_2.save();
  await building_3.save();
};

const debuffBuildings3 = async (building_1, building_2, building_3) => {
  building_1.buffed = 0;
  building_2.buffed = 0;
  building_3.buffed = 0;
  for (let i = 0; i < 3; i++) {
    building_1.rent[i] /= 2;
    building_2.rent[i] /= 2;
    building_3.rent[i] /= 2;
  }

  // await building_1.save();
  // await building_2.save();
  // await building_3.save();
};

const buffings2 = async (buildings, num1, num2) => {
  if (buildings[num1].owner === buildings[num2].owner) {
    console.log("0");
    buffBuildings2(buildings[num1], buildings[num2]);
  } else if (
    buildings[num1].buffed === 1 &&
    buildings[num1].owner !== buildings[num2].owner
  ) {
    debuffBuildings2(buildings[num1], buildings[num2]);
  }
};

const buffings3 = async (buildings, num1, num2, num3) => {
  if (
    buildings[num1].owner === buildings[num2].owner &&
    buildings[num2].owner === buildings[num3].owner
  ) {
    console.log("1");
    buffBuildings3(buildings[num1], buildings[num2], buildings[num3]);
  } else if (
    buildings[num1].owner === buildings[num2].owner &&
    buildings[num2].owner !== buildings[num3].owner &&
    buildings[num1].owner !== 0
  ) {
    console.log("2");
    if (buildings[num1].buffed === 2) {
      debuffBuildings3(buildings[num1], buildings[num2], buildings[num3]);
    }
    if (buildings[num3].buffed === 1) {
      buildings[num3].buffed = 0;
      for (let i = 0; i < 3; i++) {
        buildings[num3].rent[i] /= 1.5;
      }
    }
    buffBuildings2(buildings[num1], buildings[num2]);
    await buildings[num3].save();
  } else if (
    buildings[num2].owner === buildings[num3].owner &&
    buildings[num1].owner !== buildings[num2].owner &&
    buildings[num2].owner !== 0
  ) {
    console.log("3");
    if (buildings[num2].buffed === 2) {
      debuffBuildings3(buildings[num1], buildings[num2], buildings[num3]);
    }
    if (buildings[num1].buffed === 1) {
      buildings[num1].buffed = 0;
      for (let i = 0; i < 3; i++) {
        buildings[num1].rent[i] /= 1.5;
      }
    }
    buffBuildings2(buildings[num2], buildings[num3]);
    await buildings[num1].save();
  } else if (
    buildings[num1].owner === buildings[num3].owner &&
    buildings[num2].owner !== buildings[num1].owner &&
    buildings[num1].owner !== 0
  ) {
    console.log("4");
    if (buildings[num1].buffed === 2) {
      debuffBuildings3(buildings[num1], buildings[num2], buildings[num3]);
    }
    if (buildings[num2].buffed === 1) {
      buildings[num2].buffed = 0;
      for (let i = 0; i < 3; i++) {
        buildings[num2].rent[i] /= 1.5;
      }
    }
    buffBuildings2(buildings[num1], buildings[num3]);
    await buildings[num2].save();
  } else if (
    buildings[num1].owner !== buildings[num2].owner &&
    buildings[num2].owner !== buildings[num3].owner
  ) {
    console.log("5");
    if (buildings[num1].buffed === 1 && buildings[num2].buffed === 1) {
      debuffBuildings2(buildings[num1], buildings[num2]);
    } else if (buildings[num2].buffed === 1 && buildings[num3].buffed === 1) {
      debuffBuildings2(buildings[num2], buildings[num3]);
    } else if (buildings[num1].buffed === 1 && buildings[num3].buffed === 1) {
      debuffBuildings2(buildings[num1], buildings[num3]);
    }
  }
};

router.get("/", (req, res) => {
  res.json({ a: 1, b: 2 });
});

// const requireAdmin = (req, res, next) => {
//   if (!req.session.user) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   if (req.session.user.username !== "admin") {
//     res.status(403).json({ error: "Forbidden" });
//     return;
//   }
//   next();
// };

// const requireNPC = (req, res, next) => {
//   if (!req.session.user) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   next();
// };

// async function calcmoney(teamname, money, estate) {
//   const team = await Team.findOne({ teamname });
//   if (money > 0) {
//     if (team.soulgem.value) {
//       money *= 2;
//     }
//     if (estate) {
//       money *= team.bonus.value;
//     }
//   } else {
//     if (team.soulgem.value) {
//       money *= 1.5;
//     }
//   }
//   return money;
// }

async function updateTeam(team, moneyChanged, io, saved) {
  const teamObj = await Team.findOne({ id: team });
  var ratio = 1;
  if (teamObj.soulgem.value === true) {
    if (moneyChanged > 0) ratio = 2;
    else ratio = 1.5;
  }
  let final = Math.round(teamObj.money + moneyChanged * ratio);
  if (saved && final < 0) {
    const message = {
      title: "Negative cash balance",
      description: teamObj.teamname,
      level: 0,
      createdAt: Date.now(),
    };
    await new Broadcast(message).save();
    io.emit("broadcast", message);
  }
  if (saved) {
    const temp = await Team.findOneAndUpdate(
      { id: team },
      { money: final },
      { new: true } //return the item after update
    );
    return temp;
  } else {
    return { money: final };
  }
}

async function deleteTimeoutNotification() {
  const notifications = await Notification.find();
  const time = Date.now() / 1000;
  for (let i = 0; i < notifications.length; i++) {
    if (
      notifications[i].createdAt + notifications[i].duration < time &&
      notifications[i].duration > 0
    ) {
      await Notification.findByIdAndDelete(notifications[i]._id);
    }
  }
}

// router
//   .get("/phase", async (req, res) => {
//     const phase = await Pair.findOne({ key: "phase" });
//     res.json({ phase: phase.value }).status(200);
//   })
//   .post("/phase", async (req, res) => {
//     const phase = await Pair.findOne({ key: "phase" });
//     phase.value = req.body.phase;
//     await phase.save();
//     res.json({ phase: phase.value }).status(200);
//     req.io.emit("broadcast", {
//       title: `Phase Changed to ${phase.value}`,
//       description: "",
//       level: 0,
//     });
//   });

router.get("/team", requireOperator, async (req, res) => {
  const teams = await Team.find().sort({ teamname: 1 });
  res.json(teams).status(200);
});

router.get("/teamRich", requireOperator, async (req, res) => {
  const teams = await Team.find().sort({ money: -1 });
  const team = teams[0];
  console.log(team);
  res.json(team).status(200);
});

router.post("/checkPropertyCost", requireOperator, async (req, res) => {
  const { team, building, mode } = req.body;

  const targetBuilding = await Land.find({ id: building });
  const targetTeam = await Team.find({ id: team });
  const surplus = targetTeam[0].money;
  if (mode === "Buy") {
    const checkPropertyCost = targetBuilding[0].price.buy;
    if (surplus >= checkPropertyCost) res.json({ message: "OK" }).status(200);
    else {
      res.json({ message: "FUCK" }).status(200);
    }
  } else if (mode === "Upgrade") {
    const checkPropertyCost = targetBuilding[0].price.upgrade;
    console.log(checkPropertyCost);
    if (surplus >= checkPropertyCost) res.json({ message: "OK" }).status(200);
    else res.json({ message: "FUCK" }).status(200);
  }
});

router.get("/team/:teamId", requireTeamSelfOrOperator, async (req, res) => {
  const team = await Team.findOne({ id: req.params.teamId });
  res.json(team).status(200);
});

router.get("/land", async (req, res) => {
  const lands = await Land.find().sort({ id: 1 });
  res.json(lands.map(normalizeLand)).status(200);
});

router.get("/land/:id", async (req, res) => {
  const land = await Land.findOne({ id: req.params.id });
  res.json(land ? normalizeLand(land) : null).status(200);
});

router.get("/property/:teamId", requireTeamSelfOrOperator, async (req, res) => {
  const properties = await Land.find({ owner: req.params.teamId });
  res.json(properties).status(200);
});

router.post("/property/purchase", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const landId = Number(req.body.landId);
  const development = req.body.development || null;
  const discountPercent = req.body.discountPercent ?? 0;
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const team = await Team.findOne({ id: teamId }).session(session);
      const land = await Land.findOne({ id: landId }).session(session);
      if (!team || !land) throw Object.assign(new Error("Team or property not found"), { status: 404 });
      if (!["Building", "SpecialBuilding"].includes(land.type)) {
        throw Object.assign(new Error("This space cannot be purchased"), { status: 400 });
      }
      if (land.owner !== 0) {
        throw Object.assign(new Error("Property already has an owner"), { status: 409 });
      }

      const pricing = calculateDiscountedAmount(
        land.price?.buy,
        discountPercent
      );
      const price = pricing.amount;
      if (team.money < price) {
        throw Object.assign(new Error("Team does not have enough cash"), { status: 400 });
      }

      const state = { owner: teamId, level: 1 };
      if (isLargeProperty(landId)) {
        const config = getDevelopmentConfig(development);
        if (!config) {
          throw Object.assign(new Error("Select Hotel, Transport, or Park"), { status: 400 });
        }
        state.development = development;
        state.rent = config.rent;
        state.transportFee = config.transportFee;
        state.largePropertyGroup = Number(getLargePropertyGroup(landId));
      }

      team.money -= price;
      await team.save({ session });
      await updateLinkedLandState(landId, state, { session });
      result = {
        teamId,
        landIds: getLinkedLandIds(landId),
        basePrice: pricing.baseAmount,
        discountPercent: pricing.discountPercent,
        price,
        balance: team.money,
      };
    });
    return res.status(200).json({ message: "Property purchased", ...result });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  } finally {
    await session.endSession();
  }
});

router.post("/property/upgrade", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const landId = Number(req.body.landId);
  const discountPercent = req.body.discountPercent ?? 0;
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const team = await Team.findOne({ id: teamId }).session(session);
      const land = await Land.findOne({ id: landId }).session(session);
      if (!team || !land) throw Object.assign(new Error("Team or property not found"), { status: 404 });
      if (land.owner !== teamId) {
        throw Object.assign(new Error("Team does not own this property"), { status: 400 });
      }
      if (land.development === "Park") {
        throw Object.assign(new Error("Park cannot be upgraded"), { status: 400 });
      }
      if (Number(land.level) >= 3) {
        throw Object.assign(new Error("Property is already level 3"), { status: 400 });
      }

      const pricing = calculateDiscountedAmount(
        land.price?.upgrade,
        discountPercent
      );
      const price = pricing.amount;
      if (team.money < price) {
        throw Object.assign(new Error("Team does not have enough cash"), { status: 400 });
      }

      const nextLevel = Number(land.level) + 1;
      team.money -= price;
      await team.save({ session });
      await updateLinkedLandState(landId, { level: nextLevel }, { session });
      result = {
        teamId,
        landIds: getLinkedLandIds(landId),
        level: nextLevel,
        basePrice: pricing.baseAmount,
        discountPercent: pricing.discountPercent,
        price,
        balance: team.money,
      };
    });
    return res.status(200).json({ message: "Property upgraded", ...result });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  } finally {
    await session.endSession();
  }
});

router.post("/property/demolish", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const landId = Number(req.body.landId);
  if (!Number.isInteger(teamId) || !Number.isInteger(landId)) {
    return res.status(400).json({ error: "Select a valid team and property" });
  }

  const [teamExists, selectedLand] = await Promise.all([
    Team.exists({ id: teamId }),
    Land.findOne({ id: landId }),
  ]);
  if (!teamExists || !selectedLand) {
    return res.status(404).json({ error: "Team or property not found" });
  }

  const landIds = getLinkedLandIds(landId);
  const linkedLands = await Land.find({ id: { $in: landIds } }).sort({ id: 1 });
  if (linkedLands.length !== landIds.length) {
    return res.status(409).json({ error: "Linked property data is incomplete" });
  }
  if (linkedLands.some((land) => Number(land.owner) !== teamId)) {
    return res.status(409).json({ error: "Team does not own every linked property space" });
  }
  if (
    linkedLands.some(
      (land) =>
        !["Building", "SpecialBuilding"].includes(land.type) ||
        land.development === "Park"
    )
  ) {
    return res.status(400).json({ error: "This property has no removable building" });
  }

  const currentLevel = Math.max(
    ...linkedLands.map((land) => Number(land.level) || 0)
  );
  if (currentLevel <= 1) {
    return res.status(400).json({ error: "This property has no building to remove" });
  }

  const nextLevel = currentLevel - 1;
  const update = await Land.updateMany(
    { id: { $in: landIds }, owner: teamId },
    { $set: { level: nextLevel } }
  );
  if (update.matchedCount !== landIds.length) {
    return res.status(409).json({ error: "Property state changed; reload and try again" });
  }

  return res.status(200).json({
    message: "One building removed without refund",
    teamId,
    landIds,
    previousLevel: currentLevel,
    level: nextLevel,
    refund: 0,
  });
});

const createInitialLandUpdate = (landId) => {
  const initialLand = getInitialLandDefinition(landId);
  if (!initialLand) return null;

  const stateFields = [
    "level",
    "buffed",
    "rent",
    "largePropertyGroup",
    "development",
    "transportFee",
  ];
  const $set = { owner: Number(initialLand.owner || 0) };
  const $unset = {};

  stateFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(initialLand, field)) {
      $set[field] = initialLand[field];
    } else {
      $unset[field] = "";
    }
  });

  const update = { $set };
  if (Object.keys($unset).length > 0) update.$unset = $unset;
  return update;
};

router.post("/property/clear-ownership", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const landId = Number(req.body.landId);
  if (!Number.isInteger(teamId) || !Number.isInteger(landId)) {
    return res.status(400).json({ error: "Select a valid team and property" });
  }

  const [teamExists, selectedLand] = await Promise.all([
    Team.exists({ id: teamId }),
    Land.findOne({ id: landId }),
  ]);
  if (!teamExists || !selectedLand) {
    return res.status(404).json({ error: "Team or property not found" });
  }

  const landIds = getLinkedLandIds(landId);
  const linkedLands = await Land.find({ id: { $in: landIds } }).sort({ id: 1 });
  if (linkedLands.length !== landIds.length) {
    return res.status(409).json({ error: "Linked property data is incomplete" });
  }
  if (linkedLands.some((land) => Number(land.owner) !== teamId)) {
    return res.status(409).json({ error: "Team does not own every linked property space" });
  }
  if (
    linkedLands.some(
      (land) => !["Building", "SpecialBuilding"].includes(land.type)
    )
  ) {
    return res.status(400).json({ error: "This space is not a property" });
  }

  const operations = landIds.map((id) => {
    const update = createInitialLandUpdate(id);
    return update
      ? { updateOne: { filter: { id, owner: teamId }, update } }
      : null;
  });
  if (operations.some((operation) => operation === null)) {
    return res.status(500).json({ error: "Initial property state was not found" });
  }

  const result = await Land.bulkWrite(operations);
  if (result.matchedCount !== landIds.length) {
    return res.status(409).json({
      error: "Property state changed while clearing ownership; reload before continuing",
    });
  }

  return res.status(200).json({
    message: "Property ownership cleared and initial state restored",
    teamId,
    landIds,
    previousOwner: teamId,
    owner: 0,
    level: 0,
    refund: 0,
    cashChanged: false,
  });
});

router.post("/set", requireOperator, async (req, res) => {
  const { id, amount } = req.body;
  await Team.findOneAndUpdate({ id: parseInt(id) }, { money: amount });
  res.json({ success: true }).status(200);
});

router.get("/getRent", async (req, res) => {
  const building = req.query.building;
  if (building !== -1) {
    const targetBuilding = await Land.find({ id: building });
    const rent = targetBuilding[0].rent[targetBuilding[0].level - 1];
    res.json(rent).status(200);
  }
  res.json(0).status(200);
});

// router.get("/resourceInfo", async (req, res) => {
//   const resources = await Resource.find().sort({ id: 1 });
//   res.json(resources).status(200);
// });

router.get('/resourceInfo', async (req, res) => {
  const resources = await Resource.find().sort({ id: 1 });
  res.json(resources).status(200);
});

router.get("/resourceName", async (req, res) => {
  try {
    const resources = await Resource.find();
    const resourcesName = resources.map(resource => resource.name);
    res.json(resourcesName);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/resourcePrice", async (req, res) => {
  try {
    const resources = await Resource.find();
    const resourcesPrice = resources.map(resource => resource.price);
    res.json(resourcesPrice);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/controlResource", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const resourceId = Number(req.body.resourceId);
  const quantity = Number(req.body.number);
  const mode = Number(req.body.mode);
  if (!Number.isInteger(teamId) || resourceId !== 0 || !Number.isInteger(quantity) || quantity <= 0 || ![0, 1].includes(mode)) {
    return res.status(400).json({ error: "Select a team and enter a positive whole-number Bitcoin quantity" });
  }

  const team = await Team.findOne({ id: teamId });
  if (!team) return res.status(404).json({ error: "Team not found" });
  const currentQuantity = Number(team.resources?.eecoin || 0);
  const nextQuantity = currentQuantity + (mode === 1 ? quantity : -quantity);
  if (nextQuantity < 0) {
    return res.status(400).json({ error: "Bitcoin balance cannot become negative" });
  }

  team.resources.eecoin = nextQuantity;
  await team.save();
  return res.status(200).json({ message: "Bitcoin balance corrected", teamId, quantity: nextQuantity });
});

router.post("/updateResourcePrice", requireAdmin, async (req, res) => {
  const resourceId = Number(req.body.resourceId);
  const price = Number(req.body.price);
  if (!Number.isInteger(resourceId) || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({ error: "Select a resource and enter a non-negative price" });
  }
  const resource = await Resource.findOneAndUpdate(
    { id: resourceId },
    { price },
    { new: true }
  );
  if (!resource) return res.status(404).json({ error: "Resource not found" });
  return res.status(200).json(resource);
});


router.post("/sellResource", requireOperator, async (req, res) => {
  const teamId = Number(req.body.teamId);
  const resourceId = Number(req.body.resourceId);
  const quantity = Number(req.body.number);
  const mode = Number(req.body.mode);
  if (!Number.isInteger(teamId) || resourceId !== 0 || !Number.isInteger(quantity) || quantity <= 0 || ![0, 1].includes(mode)) {
    return res.status(400).json({ error: "Select a team and enter a positive whole-number Bitcoin quantity" });
  }

  const [team, resource] = await Promise.all([
    Team.findOne({ id: teamId }),
    Resource.findOne({ id: resourceId }),
  ]);
  if (!team || !resource) return res.status(404).json({ error: "Team or Bitcoin price not found" });

  const currentQuantity = Number(team.resources?.eecoin || 0);
  const cost = Number(resource.price) * quantity;
  if (mode === 0 && currentQuantity < quantity) {
    return res.status(400).json({ error: "Team does not have enough Bitcoin to sell" });
  }
  if (mode === 1 && Number(team.money) < cost) {
    return res.status(400).json({ error: "Team does not have enough cash to buy Bitcoin" });
  }

  team.resources.eecoin = currentQuantity + (mode === 1 ? quantity : -quantity);
  team.money = Number(team.money) + (mode === 0 ? cost : -cost);
  await team.save();
  return res.status(200).json({
    message: mode === 0 ? "Bitcoin sold" : "Bitcoin purchased",
    teamId,
    quantity: team.resources.eecoin,
    money: team.money,
    price: resource.price,
  });
});

router.post("/percent", requireAdmin, async (req, res) => {
  try {
    // Fetch all teams
    const teams = await Team.find();

    // Update each team's money by reducing it by 30%
    teams.forEach(async (team) => {
      team.money = team.money * 0.7; // Reduce money by 30%
      await team.save(); // Save the updated team
    });

    res.status(200).json({ message: "Money reduced by 30% for all teams" });
  } catch (err) {
    console.error("Error reducing money:", err);
    res.status(500).json({ message: "Failed to reduce money for teams" });
  }
});

router.post("/cutResource", requireAdmin, async (req, res) => {
  console.log("hello");
  try {
    // Fetch all teams
    const teams = await Team.find();

    // Update each team's money by reducing it by 30%
    teams.forEach(async (team) => {
      console.log(team.resources.eecoin);
      team.resources.eecoin = math.round(team.resources.eecoin * 0.5); 
      team.resources.love = math.round(team.resources.love * 0.5); 
      await team.save(); // Save the updated team
    });

    res.status(200).json({ message: "Resources reduced by 50% for all teams" });
  } catch (err) {
    console.error("Error reducing resources:", err);
    res.status(500).json({ message: "Failed to reduce resource for teams" });
  }
});


router.post("/bankTransfer", requireOperator, async (req, res) => {
  const targetTeam = Number(req.body.targetTeam);
  const dollar = Number(req.body.dollar);
  if (!Number.isInteger(targetTeam) || !Number.isFinite(dollar) || dollar === 0) {
    return res.status(400).json({ error: "Select a valid team and non-zero amount" });
  }

  const team = await Team.findOne({ id: targetTeam });
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (dollar > 0 && team.money < dollar) {
    return res.status(400).json({ error: "Not enough cash" });
  }
  if (dollar < 0 && team.bank < Math.abs(dollar)) {
    return res.status(400).json({ error: "Not enough money in the bank" });
  }

  team.money -= dollar;
  team.bank += dollar;
  await team.save();

  return res.status(200).json(team);
});

router.post ("/bankControl", requireOperator, async (req, res) => {
  const targetTeam = Number(req.body.targetTeam);
  const dollar = Number(req.body.dollar);
  if (!Number.isInteger(targetTeam) || !Number.isFinite(dollar) || dollar === 0) {
    return res.status(400).json({ error: "Select a valid team and non-zero amount" });
  }
  const team = await Team.findOne({ id: targetTeam });
  if (!team) return res.status(404).json({ error: "Team not found" });
  if (team.bank + dollar < 0) {
    return res.status(400).json({ error: "Bank balance cannot become negative" });
  }

  team.bank += dollar;
  await team.save();

  return res.status(200).json(team);
});

router
  .get("/interest", async (req, res) => {
    const setting = await Pair.findOne({ key: "bankInterestRate" });
    res.status(200).json({ rate: Number(setting?.value ?? 1) });
  })
  .post("/interest", requireAdmin, async (req, res) => {
    const rate = Number(req.body.rate);
    if (!Number.isFinite(rate) || rate < 0) {
      return res.status(400).json({ error: "Interest rate must be a non-negative number" });
    }

    const teams = await Team.find();
    for (const team of teams) {
      team.bank = Math.round(team.bank * rate);
      await team.save();
    }

    await Pair.findOneAndUpdate(
      { key: "bankInterestRate" },
      { value: rate },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "Interest applied", rate });
  });

router.get("/allEvents", async (req, res) => {
  const events = await Event.find().sort({ id: 1 });
  res.status(200).json(
    events.map((event) => {
      const data = event.toObject();
      return {
        ...data,
        title: Number(data.id) === 10 ? "最後的戰役" : data.title,
        defaultAnnouncement: getDefaultEventAnnouncement(data.id),
        executionDetails: getEventExecutionDetails(data.id),
        branches: getOrderedEventBranches(data.id, data.branches).map((branch) => ({
          ...branch,
          defaultAnnouncement: getDefaultEventAnnouncement(data.id, branch.id),
          executionDetails: getEventExecutionDetails(data.id, branch.id),
        })),
      };
    })
  );
});

router.get("/reset/options", (req, res) => {
  res.status(200).json(RESET_SCOPE_OPTIONS);
});

router.post("/reset", requireAdmin, async (req, res) => {
  const { scopes, adminPassword } = req.body;

  if (typeof adminPassword !== "string" || adminPassword.length === 0) {
    return res.status(403).json({ error: "Admin password is required to reset data" });
  }

  const admin = await User.findAndValidate("admin", adminPassword);
  if (!admin) {
    return res.status(403).json({ error: "Incorrect Admin password; no data was reset" });
  }

  try {
    const completedScopes = await resetGameData(scopes);
    req.io.emit("gameReset", { scopes: completedScopes });
    return res.status(200).json({
      message: "Selected data restored to the initial state",
      scopes: completedScopes,
      usersReset: false,
    });
  } catch (error) {
    console.error("Reset failed", error);
    return res.status(error.status ?? 500).json({ error: error.message });
  }
});

router
  .post("/event", requireAdmin, async (req, res) => {
    const { id, branch, content } = req.body;
    const session = await mongoose.startSession();

    try {
      if (content !== undefined && typeof content !== "string") {
        return res.status(400).json({ error: "Event content must be text" });
      }
      if (content?.trim().length > 2000) {
        return res.status(400).json({ error: "Event content is limited to 2,000 characters" });
      }
      let eventPayload;
      await session.withTransaction(async () => {
        const pair = await Pair.findOne({ key: "currentEvent" }).session(session);
        if (!pair) {
          throw Object.assign(new Error("Event state not initialized"), { status: 403 });
        }
        eventPayload = await executeEvent2026({
          eventId: id,
          branch,
          announcement: content,
          session,
        });
        pair.value = Number(id);
        await pair.save({ session });
      });
      req.io.emit("broadcast", eventPayload);
      return res.status(200).json({ message: "Success", event: eventPayload });
    } catch (error) {
      console.error("Failed to execute event", error);
      return res.status(error.status ?? 500).json({ error: error.message });
    } finally {
      await session.endSession();
    }
  })
  .get("/event", async (req, res) => {
    const pair = await Pair.findOne({ key: "currentEvent" });
    if (!pair) return res.status(404).json({ error: "Event state not initialized" });
    const event = await Event.findOne({ id: pair.value });
    return res.status(200).json(getEventPayload(event));
  });

// router.post("/occupation", async (req, res) => {
//   const { teamname, occupation } = req.body;
//   const team = await Team.findOne({ teamname });
//   team.occupation = occupation;
//   await team.save();

//   if (occupation === "鷹眼") {
//     const pair = await Pair.findOneAndUpdate(
//       { key: "hawkEyeTeam" },
//       { value: team.id }
//     );
//   }
//   res.json(team).status(200);
// });

// router.post("/level", async (req, res) => {
//   const { teamId, level } = req.body;
//   const team = await Team.findOneAndUpdate({ id: teamId }, { level: level });
//   console.log(team);
//   res.json(team).status(200);
// });

router.post("/tape", requireOperator, async (req, res) => {
  const teams = await Team.find();
  for (let i = 0; i < teams.length; i++) {
    teams[i].money -= 5000;
    await teams[i].save();
  }
  req.io.emit("broadcast", {
    title: "紙膠帶發動",
    description: "紙膠帶狂暴黑料!所有小隊遭扣除5000元",
  });
  res.json("Success").status(200);
});

router.post("/goldenFruit", requireOperator, async (req, res) => {
  const { building } = req.body;
  const land = await Land.find({ id: building });
  const level = land[0].level;
  const targetTeam = await Team.find({ id: land[0].owner });
  targetTeam[0].money +=
    Math.round(
      (land[0].price.buy + (land[0].level - 1) * land[0].price.upgrade) * 0.07
    ) * 10;

  await targetTeam[0].save();
  await resetLinkedLandState(building);
  req.io.emit("broadcast", {
    title: "金蔓莓果發動",
    description: `${targetTeam[0].teamname}被使用了金蔓莓果！`,
  });
  res.json({ land, level }).status(200);
});

router
  .post("/add", requireOperator, async (req, res) => {
    const { id, dollar, jeff, jeffTeam } = req.body;
    const team = await Team.findAndCheckValid(id);
    const targetTeam = await Team.find({ id: jeffTeam });
    if (!team) {
      res.status(403).send();
      console.log("Team not found");
      return;
    }

    if (jeff) {
      req.io.emit("broadcast", {
        title: "劫富卡發動",
        description: `第${jeffTeam}小隊遭到劫富！！`,
      });
      await Team.findOneAndUpdate(
        { id: jeffTeam },
        { money: targetTeam[0].money * 0.75 }
      );
    }

    await updateTeam(id, dollar, req.io, true);
    // if (dollar < 0) {
    //   req.io.emit("broadcast", {
    //     title: "扣錢",
    //     description: `第${id}小隊遭扣除${-dollar}元！！`,
    //   });
    // }

    res.status(200).send("Update succeeded");
  })
  .get("/add", async (req, res) => {
    console.log(req.query);
    const { id, dollar } = req.query;
    console.log(id, dollar);
    const data = await updateTeam(id, dollar, req.io, false);
    console.log(data);
    res.json(data).status(200);
  });

router.post("/series", requireOperator, async (req, res) => {
  const { teamId, area } = req.body;
  const count = await (
    await Land.find({ area, owner: teamId })
  ).filter((land) => land.owner > 0).length;
  res.json({ count }).status(200);
});

router.post("/rob", requireOperator, async (req, res) => {
  const { id } = req.body;
  const team = await Team.find({ id: id });
  const teams = await Team.find().sort({ money: 1 });
  const lands = uniqueOwnedProperties(
    await Land.find({ owner: teams[0].id, level: 1 })
  );

  if (lands.length === 0) {
    req.io.emit("broadcast", {
      title: "趁火打劫發動",
      description: `${team[0].teamname}使用了趁火打劫，但${teams[0].teamname}逃過一劫...`,
    });
  } else {
    const index = Math.floor(Math.random() * lands.length);
    await updateLinkedLandState(lands[index].id, { owner: id });
    req.io.emit("broadcast", {
      title: "趁火打劫發動",
      description: `${team[0].teamname}使用了趁火打劫, 搶走${teams[0].teamname}的${lands[index].name}, 2ㄏ2ㄏ`,
    });
    res.json({ building: lands[index].id }).status(200);
  }
});

router.post("/equility", requireOperator, async (req, res) => {
  const { id } = req.body;
  const team = await Team.find({ id: id });
  const teams = await Team.find().sort({ money: 1 });
  let order = -1;
  for (let i = 0; i < teams.length; i++) {
    if (teams[i].id === id) order = i;
  }
  if (order + 1 === teams.length) {
    team[0].money -= 10000;
    await team[0].save();
    req.io.emit("broadcast", {
      title: "實質平等發動",
      description: `${team[0].teamname}使用了實質平等, 但你太有錢了, 扣除10000元`,
    });
  } else {
    const money =
      Math.round((teams[order].money + teams[order + 1].money) * 0.05) * 10;

    teams[order].money = money;
    teams[order + 1].money = money;
    await teams[order].save();
    await teams[order + 1].save();
    req.io.emit("broadcast", {
      title: "實質平等發動",
      description: `${team[0].teamname}使用了實質平等, 與${
        teams[order + 1].teamname
      }平分金錢`,
    });
  }
  res.json("Success").status(200);
});

router.post("/handleBuff1", requireOperator, async (req, res) => {
  const { name } = req.body;
  console.log(name);
  const land = await Land.findOne({ name });
  const rent = land.rent.map((amount) => amount * 1.5);
  await updateLinkedLandState(land.id, { buffed: 1, rent });
  res.json("Success").status(200);
});

router.post("/handleBuff2", requireOperator, async (req, res) => {
  const { name } = req.body;
  const land = await Land.findOne({ name });
  const rent = land.rent.map((amount) => amount * 2);
  await updateLinkedLandState(land.id, { buffed: 2, rent });
  res.json("Success").status(200);
});

router.post("/handleDeBuff", requireOperator, async (req, res) => {
  const { name } = req.body;
  const land = await Land.findOne({ name });
  const divisor = land.buffed === 1 ? 1.5 : land.buffed === 2 ? 2 : 1;
  const rent = land.rent.map((amount) => amount / divisor);
  await updateLinkedLandState(land.id, { buffed: 0, rent });
  res.json("Success").status(200);
});

const parseEstateFlag = (value) =>
  value === true || String(value).toLowerCase() === "true";

const parseTransferRequest = (input) => {
  const from = Number(input.from);
  const to = Number(input.to);
  const isEstate = parseEstateFlag(input.IsEstate);
  const baseDollar = Number(input.baseDollar ?? input.dollar);

  if (!Number.isInteger(from) || !Number.isInteger(to)) {
    const error = new Error("From team and to team must be valid team IDs");
    error.status = 400;
    throw error;
  }
  if (from === to) {
    const error = new Error("From team and to team must be different");
    error.status = 400;
    throw error;
  }
  if (!Number.isFinite(baseDollar) || baseDollar <= 0) {
    const error = new Error("Transfer amount must be greater than zero");
    error.status = 400;
    throw error;
  }

  const pricing = calculateDiscountedAmount(
    baseDollar,
    input.discountPercent ?? 0
  );
  if (pricing.discountPercent > 0 && !isEstate) {
    const error = new Error("Discounts can only be used for property rent");
    error.status = 400;
    throw error;
  }

  return { from, to, isEstate, pricing };
};

const calcTransfer = async (from, to, amount, isEstate) => {
  const FromTeam = await Team.findOne({ id: from }); // minus
  const ToTeam = await Team.findOne({ id: to }); // add
  if (!FromTeam || !ToTeam) return null;

  let fromAmount = Number(FromTeam.money);
  let toAmount = Number(ToTeam.money);
  let transferAmount = Math.round(Number(amount));

  const recipientBonus = Number(ToTeam.bonus?.value);
  if (isEstate && recipientBonus !== 0 && Number.isFinite(recipientBonus)) {
    transferAmount = Math.round(transferAmount * recipientBonus);
  }

  if (FromTeam.soulgem.value) {
    fromAmount -= Math.round(transferAmount * 1.5);
  } else {
    fromAmount -= transferAmount;
  }

  if (ToTeam.soulgem.value) {
    toAmount += Math.round(transferAmount * 2);
  } else {
    toAmount += transferAmount;
  }

  return { from: fromAmount, to: toAmount, transferAmount };
};

router.post("/transfer", requireOperator, async (req, res) => {
  try {
    const { from, to, isEstate, pricing } = parseTransferRequest(req.body);

    // Refresh temporary team effects before calculating the final balances.
    await Team.findAndCheckValid(from);
    await Team.findAndCheckValid(to);

    const data = await calcTransfer(from, to, pricing.amount, isEstate);
    if (!data) {
      return res.status(404).json({ error: "One or both teams were not found" });
    }

    await Promise.all([
      Team.findOneAndUpdate({ id: from }, { money: data.from }),
      Team.findOneAndUpdate({ id: to }, { money: data.to }),
    ]);

    return res.status(200).json({
      message: "Update succeeded",
      ...pricing,
      transferAmount: data.transferAmount,
      from: data.from,
      to: data.to,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/transfer", requireOperator, async (req, res) => {
  try {
    const { from, to, isEstate, pricing } = parseTransferRequest(req.query);
    const data = await calcTransfer(from, to, pricing.amount, isEstate);
    if (!data) {
      return res.status(404).json({ error: "One or both teams were not found" });
    }

    return res.status(200).json({
      ...pricing,
      transferAmount: data.transferAmount,
      from: data.from,
      to: data.to,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
});

// async function updateHawkEye() {
//   const { value: hawkEyeTeam } = await Pair.findOne({ key: "hawkEyeTeam" });
//   if (hawkEyeTeam === 0) return;
//   // may delete some building need to clear and fill(?)
//   for (let i = 1; i <= 40; i++) {
//     await Land.findOneAndUpdate({ id: i }, { hawkEye: 0 });
//   }
//   const hawkEyeBuildings = await Land.find({ owner: hawkEyeTeam });
//   console.log(hawkEyeBuildings);
//   for (let i = 0; i < hawkEyeBuildings.length; i++) {
//     await Land.findOneAndUpdate(
//       { id: hawkEyeBuildings[i].id - 1 },
//       { hawkEye: hawkEyeBuildings[i].id }
//     );
//     await Land.findOneAndUpdate(
//       { id: hawkEyeBuildings[i].id + 1 },
//       { hawkEye: hawkEyeBuildings[i].id }
//     );
//   }
//   for (let i = 0; i < hawkEyeBuildings.length; i++) {
//     await Land.findOneAndUpdate(
//       { id: hawkEyeBuildings[i].id },
//       { hawkEye: hawkEyeBuildings[i].id }
//     );
//   }
//   console.log("hawkEye updated");
// }

router.post("/ownership", requireOperator, async (req, res) => {
  const { teamId, land, landId, level, development } = req.body;
  const targetLand = landId
    ? await Land.findOne({ id: landId })
    : await Land.findOne({ name: land });

  if (!targetLand) return res.status(404).json({ error: "Land not found" });

  const numericTeamId = Number(teamId);
  let numericLevel = numericTeamId === 0 ? 0 : Number(level);
  const state = { owner: numericTeamId, level: numericLevel };

  if (isLargeProperty(targetLand.id)) {
    if (numericTeamId === 0) {
      state.development = null;
      state.rent = [0, 0, 0];
      state.transportFee = [2000, 3000, 4000];
    } else {
      const selectedDevelopment = development || targetLand.development;
      const config = getDevelopmentConfig(selectedDevelopment);
      if (!config) {
        return res.status(400).json({
          error: "Large property development must be Hotel, Transport, or Park",
        });
      }
      if (selectedDevelopment === "Park") {
        numericLevel = 1;
        state.level = numericLevel;
      }
      state.development = selectedDevelopment;
      state.rent = config.rent;
      state.transportFee = config.transportFee;
      state.largePropertyGroup = Number(getLargePropertyGroup(targetLand.id));
    }
  }

  await updateLinkedLandState(targetLand.id, state);

  // await updateHawkEye(land);
  res.status(200).json({
    message: "update succeeded",
    landIds: getLinkedLandIds(targetLand.id),
  });
});

router.post("/calcbonus", requireOperator, async (req, res) => {
  const { teamId, land, level } = req.body;
  const buildings = await Land.find({}).sort({ id: 1 });
  console.log(req.body);
  const targetBuilding = await Land.find({ name: land });

  if (targetBuilding[0].id === 2 || targetBuilding[0].id === 3) {
    buffings2(buildings, 1, 2);
  } else if (targetBuilding[0].id === 9 || targetBuilding[0].id === 10) {
    buffings2(buildings, 8, 9);
  } else if (
    targetBuilding[0].id === 13 ||
    targetBuilding[0].id === 14 ||
    targetBuilding[0].id === 15
  ) {
    buffings3(buildings, 12, 13, 14);
  } else if (targetBuilding[0].id === 22 || targetBuilding[0].id === 23) {
    buffings2(buildings, 21, 22);
  } else if (
    targetBuilding[0].id === 28 ||
    targetBuilding[0].id === 29 ||
    targetBuilding[0].id === 30
  ) {
    buffings3(buildings, 27, 28, 29);
  } else if (
    targetBuilding[0].id === 34 ||
    targetBuilding[0].id === 35 ||
    targetBuilding[0].id === 36
  ) {
    buffings3(buildings, 33, 34, 35);
  } else if (targetBuilding[0].id === 39 || targetBuilding[0].id === 40) {
    buffings2(buildings, 38, 39);
  }
  res.json("Success").status(200);
});

router.post("/aquire", requireOperator, async (req, res) => {
  const { land, teamId } = req.body;
  const target = await Land.find({ name: land });
  const originOwner = target[0].owner;
  const originTeam = await Team.find({ id: originOwner });
  const newTeam = await Team.find({ id: teamId });
  originTeam[0].money +=
    target[0].price.buy + (target[0].level - 1) * target[0].price.upgrade;
  newTeam[0].money -=
    target[0].price.buy + (target[0].level - 1) * target[0].price.upgrade;
  await originTeam[0].save();
  await newTeam[0].save();
  await updateLinkedLandState(target[0].id, { owner: teamId });
  res.json("Success").status(200);
});

router.get("/aquireBuilding", async (req, res) => {
  const targetBuilding = Land.find({ type: "Building" }).sort({ id: 1 });
  res.json(targetBuilding).status(200);
});

router.post("/exchange", requireOperator, async (req, res) => {
  const { land, otherLand, teamId, otherTeamId } = req.body;
  const land_1 = await Land.find({ name: land });
  const land_2 = await Land.find({ name: otherLand });
  await updateLinkedLandState(land_1[0].id, { owner: otherTeamId });
  await updateLinkedLandState(land_2[0].id, { owner: teamId });
  res.json("Success").status(200);
});

router.post("/shipRepair", requireOperator, async (req, res) => {
  const { teamId } = req.body;
  console.log(teamId);
  const team = await Team.find({ id: teamId });
  team[0].dice = 2;
  await team[0].save();
  res.json("Success").status(200);
});

router.get("/allEffects", async (req, res) => {
  const effects = await Effect.find({}).sort({ id: 1 });
  res.json(effects).status(200);
});

router.post("/effect", requireOperator, async (req, res) => {
  const { teamname, title } = req.body;
  const effect = await Effect.findOne({ title });
  if (!effect) {
    res.status(403).send();
    console.log("Effect not found");
    return;
  }
  const { id, description, trait, duration, bonus } = effect;
  const team = await Team.findOne({ teamname });
  const time = Date.now() / 1000;
  if (!team) {
    res.status(403).send("Team not found");
    console.log("Team not found");
    return;
  }
  if (bonus !== -1) {
    team.bonus = { value: bonus, duration, time };
  }
  if (id === 4) {
    // soulgem
    team.soulgem = { value: true, duration, time };
  }

  const pair = await Pair.findOne({ key: "lastNotificationId" });
  const type = trait ? "temporary" : "permanent";
  const notification = {
    id: pair.value,
    type,
    teamname,
    title,
    description: `${teamname}: ${description}`,
    duration,
    createdAt: time,
  };
  // await deleteTimeoutNotification();
  // save
  console.log(notification);
  await new Notification(notification).save();
  await team.save();
  req.io.emit("broadcast", notification);
  res.status(200).send("Update succeeded");
});

router
  .post("/broadcast", requireOperator, async (req, res) => {
    const { title, description, level } = req.body;
    let time = Date.now();
    const broadcast = {
      createdAt: time,
      title: title,
      description: description,
      level: level,
    };
    await new Broadcast(broadcast).save();
    req.io.emit("broadcast", { title, description, level });
    res.status(200).send("Broadcast succeeded");
    console.log("broadcast sent");
  })
  .get("/broadcast", async (req, res) => {
    const data = await Broadcast.find({}).sort({ createdAt: -1 });
    res.json(data).status(200);
  })
  .delete("/broadcast/:createdAt", async (req, res) => {
    const { createdAt } = req.params;
    const data = await Broadcast.findOneAndDelete({ createdAt });
    res.json(data).status(200);
  });

router.get("/notifications", async (req, res) => {
  await deleteTimeoutNotification();
  // save
  const newNotifications = await Notification.find();
  res.json(newNotifications).status(200);
});

// router.post("/bonus", async (req, res) => {
//   console.log(req.body);
//   const { teamname, bonus, duration } = req.body;
//   const time = Date.now() / 1000;
//   const team = await Team.findOneAndUpdate(
//     { teamname: teamname },
//     { bonus: { value: bonus, time: time, duration: duration } }
//   );
//   if (!team) {
//     res.status(403).send();
//     console.log("Update failed");
//     return;
//   }
//   res.status(200).send("update succeeded");
// });

// router.post("/soulgem", async (req, res) => {
//   const { teamname } = req.body;
//   const time = Date.now() / 1000;
//   const team = await Team.findOneAndUpdate(
//     { teamname: teamname },
//     { soulgem: { value: true, time: time } }
//   );
//   if (!team) {
//     res.status(403).send();
//     console.log("Update failed");
//     return;
//   }
//   res.status(200).send("update succeeded");
// });

// router.get("/checkvalid", async (req, res) => {
//   const { teamname } = req.query;
//   const team = await findAndCheckValid(teamname);
//   res.status(200).send(team);
// });

// Login
router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { username, password } = req.body;
  // console.log(username);
  // console.log(password);
  const user = await User.findAndValidate(username, password);
  if (!user) {
    res.status(200).send({ username: "" });
    console.log("login failed");
    return;
  }
  const token = createAuthSession(user.username);
  res.status(200).send({ username: user.username, token });
  // null, npc, admin: String
});

router.get("/room", async (req, res) => {
  res.status(200).send(req.io.room);
});

// router.post("/logout", async (req, res) => {
//   req.session.destroy();
//   res.status(200).send("logout success");
// });

// router.get("/adminsecret", requireAdmin, async (req, res) => {
//   res.status(200).send("admin secret");
// });

// router.get("/npcsecret", requireNPC, async (req, res) => {
//   res.status(200).send("npc secret");
// });

export default router;
