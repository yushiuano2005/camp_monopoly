import Event from "../models/event.js";
import Land from "../models/land.js";
import Resource from "../models/resource.js";
import Team from "../models/team.js";
import Pair from "../models/pair.js";
import { getLargePropertyGroup } from "./largeProperties.js";
import {
  getDefaultEventAnnouncement,
  getEventExecutionDetails,
  getOrderedEventBranches,
} from "./eventContent2026.js";
import { getEventRule } from "./eventRules2026.js";
import {
  planFreePropertyUpgrades,
  planRandomPropertyDemolitions,
} from "./propertyEvent2026.js";

const updateResourcePrice = async (price, session) => {
  const resource = await Resource.findOne({ id: 0 }).session(session);
  if (!resource) throw new Error("布萊德彼特幣資料不存在");
  resource.price = price;
  await resource.save({ session });
};

const applyBankRate = async (rate, session) => {
  const teams = await Team.find().session(session);
  for (const team of teams) {
    team.bank = Math.round(team.bank * rate);
    await team.save({ session });
  }
  await Pair.findOneAndUpdate(
    { key: "bankInterestRate" },
    { value: rate },
    { upsert: true, new: true, session }
  );
};

const applyBankEffect = async (multiplier, session) => {
  const teams = await Team.find().session(session);
  for (const team of teams) {
    team.bank = Math.round(team.bank * multiplier);
    await team.save({ session });
  }
};

const swapCashByRank = async (session) => {
  const teams = await Team.find().sort({ money: -1 }).session(session);
  for (let i = 0; i < Math.floor(teams.length / 2); i += 1) {
    const opposite = teams.length - 1 - i;
    const money = teams[i].money;
    teams[i].money = teams[opposite].money;
    teams[opposite].money = money;
    await teams[i].save({ session });
    await teams[opposite].save({ session });
  }
};

const applyLandlordTax = async (session) => {
  const lands = await Land.find({ owner: { $ne: 0 }, level: { $gt: 0 } }).session(session);
  const seen = new Set();
  for (const land of lands) {
    const key = getLargePropertyGroup(land.id) ?? `land-${land.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const team = await Team.findOne({ id: land.owner }).session(session);
    if (!team) continue;
    team.money -= 2000 * land.level;
    await team.save({ session });
  }
};

const getPurchasedProperties = (session) =>
  Land.find({ owner: { $ne: 0 }, level: { $gt: 0 } })
    .sort({ id: 1 })
    .session(session);

const applyPropertyLevelOperations = async (operations, session) => {
  for (const operation of operations) {
    await Land.updateMany(
      { id: { $in: operation.landIds } },
      { $set: { level: operation.toLevel } },
      { session }
    );
  }
};

const upgradeAllPurchasedProperties = async (session) => {
  const lands = await getPurchasedProperties(session);
  const operations = planFreePropertyUpgrades(lands);
  await applyPropertyLevelOperations(operations, session);
  return operations;
};

const demolishRandomPropertyPerTeam = async (session) => {
  const lands = await getPurchasedProperties(session);
  const operations = planRandomPropertyDemolitions(lands);
  await applyPropertyLevelOperations(operations, session);
  return operations;
};

const formatPropertyOperation = (operation) =>
  `第 ${operation.owner} 小隊：#${operation.landId} ${operation.name}（Level ${operation.fromLevel} → ${operation.toLevel}）`;

export const getEventPayload = (event) => {
  if (!event) return null;
  const payload = event.toObject ? event.toObject() : { ...event };
  const orderedBranches = getOrderedEventBranches(payload.id, payload.branches);
  const selected = orderedBranches.find(
    (branch) => branch.id === payload.selectedBranch
  );
  const eventTitle = Number(payload.id) === 10 ? "最後的戰役" : payload.title;
  const defaultAnnouncement = getDefaultEventAnnouncement(
    payload.id,
    payload.selectedBranch
  );
  const announcement = payload.announcement?.trim() || defaultAnnouncement;

  return {
    ...payload,
    branches: orderedBranches,
    title: Number(payload.id) === 10 ? eventTitle : selected?.title ?? eventTitle,
    description: announcement,
    defaultAnnouncement,
    executionDetails: getEventExecutionDetails(
      payload.id,
      payload.selectedBranch
    ),
  };
};

export const executeEvent2026 = async ({ eventId, branch, announcement, session }) => {
  const numericEventId = Number(eventId);
  const event = await Event.findOne({ id: numericEventId }).session(session);
  if (!event) throw new Error("大型事件不存在");

  const branches = event.branches ?? [];
  if (branches.length > 0 && !branches.some((item) => item.id === branch)) {
    const error = new Error("請選擇有效的大型事件分支");
    error.status = 400;
    throw error;
  }

  if (numericEventId === 0) {
    event.note = "";
    event.announcement = "";
    event.selectedBranch = "";
    await event.save({ session });
    return getEventPayload(event);
  }

  const normalizedAnnouncement =
    typeof announcement === "string" && announcement.trim()
      ? announcement.trim()
      : getDefaultEventAnnouncement(numericEventId, branch);

  const eventRule = getEventRule(numericEventId, branch);
  await updateResourcePrice(eventRule.bitcoinPrice, session);
  await applyBankRate(eventRule.bankMultiplier, session);
  if (eventRule.bankEffectMultiplier) {
    await applyBankEffect(eventRule.bankEffectMultiplier, session);
  }
  let note = "";

  switch (numericEventId) {
    case 1:
      break;
    case 2:
      note = "請場控依目前棋盤位置，將位於地產格的小隊各扣5000元";
      break;
    case 3: {
      const upgraded = await upgradeAllPurchasedProperties(session);
      note = upgraded.length > 0
        ? `系統已免費升級 ${upgraded.length} 處地產：${upgraded.map(formatPropertyOperation).join("；")}`
        : "事件執行時沒有符合免費升級條件的地產";
      break;
    }
    case 4:
      note = "請場控在指定格子放置實體現金";
      break;
    case 5:
      note = "請場控依SOP處理男隊輔救援與入獄";
      break;
    case 6:
      if (branch === "property") await swapCashByRank(session);
      else note = "請場控抽選各小隊是否進監獄";
      break;
    case 7:
      if (branch === "landlord") await applyLandlordTax(session);
      break;
    case 8:
      if (branch === "revolution") {
        const demolished = await demolishRandomPropertyPerTeam(session);
        note = demolished.length > 0
          ? `系統已為 ${demolished.length} 個小隊各隨機拆除一棟房屋：${demolished.map(formatPropertyOperation).join("；")}`
          : "事件執行時沒有任何小隊持有可拆除的房屋";
      }
      break;
    case 9:
      break;
    case 10:
      if (branch === "communism") await swapCashByRank(session);
      break;
    default: {
      const error = new Error("大型事件編號不在1到10之間");
      error.status = 400;
      throw error;
    }
  }

  event.note = note;
  event.announcement = normalizedAnnouncement;
  event.selectedBranch = branch ?? "";
  await event.save({ session });
  return getEventPayload(event);
};
