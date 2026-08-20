import Event from "../models/event.js";
import Land from "../models/land.js";
import Resource from "../models/resource.js";
import Team from "../models/team.js";
import Pair from "../models/pair.js";
import { getLargePropertyGroup } from "./largeProperties.js";
import {
  getDefaultEventAnnouncement,
  getEventExecutionDetails,
} from "./eventContent2026.js";

const EVENT_RESOURCE_PRICES = {
  1: 5000,
  2: 6000,
  3: 2000,
  4: 3000,
  5: 5000,
  6: 30000,
  7: 16000,
  8: 15000,
  9: 500,
  10: 1000,
};

const updateResourcePrice = async (eventId) => {
  const resource = await Resource.findOne({ id: 0 });
  if (!resource) throw new Error("布萊德彼特幣資料不存在");
  resource.price = EVENT_RESOURCE_PRICES[eventId];
  await resource.save();
};

const applyBankRate = async (rate) => {
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
};

const swapCashByRank = async () => {
  const teams = await Team.find().sort({ money: -1 });
  for (let i = 0; i < Math.floor(teams.length / 2); i += 1) {
    const opposite = teams.length - 1 - i;
    const money = teams[i].money;
    teams[i].money = teams[opposite].money;
    teams[opposite].money = money;
    await teams[i].save();
    await teams[opposite].save();
  }
};

const applyLandlordTax = async () => {
  const lands = await Land.find({ owner: { $ne: 0 }, level: { $gt: 0 } });
  const seen = new Set();
  for (const land of lands) {
    const key = getLargePropertyGroup(land.id) ?? `land-${land.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const team = await Team.findOne({ id: land.owner });
    if (!team) continue;
    team.money -= 2000 * land.level;
    await team.save();
  }
};

export const getEventPayload = (event) => {
  if (!event) return null;
  const payload = event.toObject ? event.toObject() : { ...event };
  const selected = payload.branches?.find(
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
    title: Number(payload.id) === 10 ? eventTitle : selected?.title ?? eventTitle,
    description: announcement,
    defaultAnnouncement,
    executionDetails: getEventExecutionDetails(
      payload.id,
      payload.selectedBranch
    ),
  };
};

export const executeEvent2026 = async ({ eventId, branch, announcement }) => {
  const numericEventId = Number(eventId);
  const event = await Event.findOne({ id: numericEventId });
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
    await event.save();
    return getEventPayload(event);
  }

  const normalizedAnnouncement =
    typeof announcement === "string" && announcement.trim()
      ? announcement.trim()
      : getDefaultEventAnnouncement(numericEventId, branch);

  await updateResourcePrice(numericEventId);
  let note = "";

  switch (numericEventId) {
    case 1:
      await applyBankRate(1.3);
      break;
    case 2:
      note = "請場控依目前棋盤位置，將位於地產格的小隊各扣5000元";
      break;
    case 3:
      await applyBankRate(1.2);
      note = "請場控依 2026 SOP，為各小隊地產人工升級一次";
      break;
    case 4:
      await applyBankRate(1.1);
      note = "請場控在指定格子放置實體現金";
      break;
    case 5:
      note = "請場控依SOP處理男隊輔救援與入獄";
      break;
    case 6:
      await applyBankRate(1.1);
      if (branch === "property") await swapCashByRank();
      else note = "請場控抽選各小隊是否進監獄";
      break;
    case 7:
      if (branch === "landlord") await applyLandlordTax();
      break;
    case 8:
      if (branch === "maga") await applyBankRate(0.5);
      else note = "請場控依 2026 SOP，人工抽選並移除一棟房屋";
      break;
    case 9:
      break;
    case 10:
      if (branch === "capitalism") await swapCashByRank();
      else if (branch === "communism") await applyBankRate(0.5);
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
  await event.save();
  return getEventPayload(event);
};
