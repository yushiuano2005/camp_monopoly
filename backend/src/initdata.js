import mongoose from "mongoose";
import dotenv from "dotenv-defaults";
import Team from "../models/team.js";
import Land from "../models/land.js";
import User from "../models/user.js";
import Resource from "../models/resource.js";
import Notification from "../models/notification.js";
import Broadcast from "../models/broadcast.js";
import Event from "../models/event.js";
import Pair from "../models/pair.js";
import Effect from "../models/effect.js";

dotenv.config();

const users = [
  {
    username: "admin",
    password: "adminNTUEE",
  },
  {
    username: "NPC",
    password: "pp9AxWvSh35z",
  },
  {
    username: "team01",
    password: "aY7w2z3D",
  },
  {
    username: "team02",
    password: "cvEGgStw",
  },
  {
    username: "team03",
    password: "UAwGZSc7",
  },
  {
    username: "team04",
    password: "gCy2eWBA",
  },
  {
    username: "team05",
    password: "fzUegff2",
  },
  {
    username: "team06",
    password: "7PPFT5QD",
  },
  {
    username: "team07",
    password: "Sb4GeGAH",
  },
  {
    username: "team08",
    password: "9WbxwUsS",
  },
  {
    username: "team09",
    password: "rkMPmnqw",
  },
];

const teams = [
  {
    id: 1,
    teamname: "第01小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 2,
    teamname: "第02小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 3,
    teamname: "第03小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 4,
    teamname: "第04小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 5,
    teamname: "第05小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 6,
    teamname: "第06小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 7,
    teamname: "第07小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 8,
    teamname: "第08小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
  {
    id: 9,
    teamname: "第09小隊",
    // occupation: "N/A",
    money: 40000,
    bank: 0,
    resourcesName: {  eecoin: "EE幣" },
    resources: {  eecoin: 0, cola: 0, wood: 0, metal: 0 },
    bonus: { value: 1.0, time: 0, duration: 0 },
    soulgem: { value: false, time: 0 },
  },
];

const resources = [
  // {
  //   id: 0,
  //   name: "總召的愛",
  //   price: 10000
  // },
  {
    id: 0,
    name: "布萊德彼特幣",
    price: 10000
  },
]

const lands = [
  { id: 1, type: "Game", name: "排列組合期中考", description: "認真聽規則！", owner: 0},
  {
    id: 2,
    type: "Building",
    area: 1,
    name: "瑪莎拉地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  {
    id: 3,
    type: "Building",
    area: 1,
    name: "心存芥地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 4,
    type: "Building",
    area: 1,
    name: "垃圾不落地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  { id: 5, type: "Game", name: "猜歌名", description: "認真聽規則！", owner: 0 },
  { id: 6, type: "Bank", name: "銀行", description: "存錢拿利息", owner: 0 },
  {
    id: 7,
    type: "Building",
    area: 1,
    name: "掃地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 10000, upgrade: 5000 },
    rent: [4000, 8000, 12000],
  },
  {
    id: 8,
    type: "Building",
    area: 1,
    name: "死心塌地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 9,
    type: "Building",
    area: 1,
    name: "彼得大地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  { id: 10, type: "Game", name: "排列組合期末考", description: "認真聽規則！", owner: 0 },
  {
    id: 11,
    type: "Jail",
    name: "尬電大監獄",
    description: "進監獄囉，真爽",
    owner: 0,
  },
  {
    id: 12,
    type: "Chance",
    name: "命運",
    description: "為你的未來重新洗牌！",
    owner: 0,
  },
  {
    id: 13,
    type: "Building",
    area: 0,
    name: "地寶",
    description: "大型地產，可開發為公園、飯店或轉運站",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:15000, upgrade: 10000 },
    rent: [0, 0, 0],
    largePropertyGroup: 13,
    development: null,
    transportFee: [2000, 3000, 4000],
  },
  {
    id: 14,
    type: "Building",
    area: 0,
    name: "地寶",
    description: "大型地產，可開發為公園、飯店或轉運站",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:15000, upgrade: 10000 },
    rent: [0, 0, 0],
    largePropertyGroup: 13,
    development: null,
    transportFee: [2000, 3000, 4000],
  },
  { id: 15, type: "Game", name: "紙飛機", description: "認真聽規則！", owner: 0 },
  {
    id: 16,
    type: "Building",
    area: 1,
    name: "甘迺地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 10000, upgrade: 5000 },
    rent: [4000, 8000, 12000],
  },
  {
    id: 17,
    type: "Building",
    area: 1,
    name: "龍兄虎地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 18,
    type: "Building",
    area: 1,
    name: "馬力兄地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  { id: 19, type: "Arena", name: "唬爛王", description: "來決鬥吧！", owner: 0 },
  { id: 20, type: "Game", name: "猜英文歌", description: "認真聽規則！" , owner: 0},
  {
    id: 21,
    type: "Building",
    area: 1,
    name: "白蘭地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 10000, upgrade: 5000 },
    rent: [4000, 8000, 12000],
  },
  {
    id: 22,
    type: "Building",
    area: 1,
    name: "出人頭地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 23,
    type: "Building",
    area: 1,
    name: "超級快地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  { id: 24, type: "Game", name: "注音猜詞", description: "認真聽規則！", owner: 0 },
  {
    id: 25,
    type: "Chance",
    name: "機會",
    description: "為你的未來重新洗牌！",
    owner: 0,
  },
  {
    id: 26,
    type: "Building",
    area: 0,
    name: "地王",
    description: "大型地產，可開發為公園、飯店或轉運站",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:15000, upgrade: 10000 },
    rent: [0, 0, 0],
    largePropertyGroup: 26,
    development: null,
    transportFee: [2000, 3000, 4000],
  },
  {
    id: 27,
    type: "Building",
    area: 0,
    name: "地王",
    description: "大型地產，可開發為公園、飯店或轉運站",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy:15000, upgrade: 10000 },
    rent: [0, 0, 0],
    largePropertyGroup: 26,
    development: null,
    transportFee: [2000, 3000, 4000],
  },
  {
    id: 28,
    type: "Building",
    area: 1,
    name: "違規取地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 10000, upgrade: 5000 },
    rent: [4000, 8000, 12000],
  },
  {
    id: 29,
    type: "Building",
    area: 1,
    name: "五體投地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 30,
    type: "Building",
    area: 1,
    name: "腳踏實地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
  { id: 31, type: "Game", name: "比手畫腳", description: "認真聽規則！", owner: 0 },
  {
    id: 32,
    type: "Chance",
    name: "機會",
    description: "為你的未來重新洗牌！",
    owner: 0,
  },
  {
    id: 33,
    type: "Chance",
    name: "命運",
    description: "為你的未來重新洗牌！",
    owner: 0,
  },
  { id: 34, type: "Arena", name: "碰撞機器人", description: "來決鬥吧！", owner: 0 },
  {
    id: 35,
    type: "Building",
    area: 1,
    name: "亂丟菸地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 10000, upgrade: 5000 },
    rent: [4000, 8000, 12000],
  },
  {
    id: 36,
    type: "Building",
    area: 1,
    name: "張家兄地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 12000, upgrade: 6000 },
    rent: [6000, 10000, 14000],
  },
  {
    id: 37,
    type: "Building",
    area: 1,
    name: "冰天雪地",
    owner: 0,
    level: 0,
    buffed: 0,
    price: { buy: 14000, upgrade: 7000 },
    rent: [8000, 12000, 16000],
  },
];

const events = [
  {
    id: 0,
    title: "無",
    description: "",
  },
  {
    id: 1,
    title: "幣圈龍婆聖旨",
    description: "銀行餘額複利增加30%，布萊德彼特幣價格設為5000",
  },
  {
    id: 2,
    title: "You can 踹 one more time",
    description: "銀行餘額依預設增加10%；地產格小隊由場控扣5000元；布萊德彼特幣價格設為6000",
  },
  {
    id: 3,
    title: "普發一萬元但沒錢所以加蓋房屋",
    description:
      "不發放現金；所有已購買且符合條件的地產自動免費升級一級；銀行餘額複利增加20%；布萊德彼特幣價格設為2000",
  },
  {
    id: 4,
    title: "富翁掉錢",
    description:
      "銀行餘額複利增加10%；場控在指定格子放置實體現金；布萊德彼特幣價格設為3000",
  },
  {
    id: 5,
    title: "男同俱樂部",
    description:
      "銀行餘額依預設增加10%；所有男隊輔進監獄，花6000元救回；5分鐘內未救援的小隊全隊進監獄一次；布萊德彼特幣價格設為5000",
  },
  {
    id: 6,
    title: "剝削勞工／我們的財產",
    description: "銀行餘額複利增加10%，布萊德彼特幣價格設為30000；由場控選擇分支",
    branches: [
      {
        id: "labor",
        title: "剝削勞工（資本主義）",
        description: "每個小隊隨機決定是否進監獄",
      },
      {
        id: "property",
        title: "我們的財產（共產主義）",
        description: "手頭現金第一名與最後一名、第二名與倒數第二名依序對調",
      },
    ],
  },
  {
    id: 7,
    title: "市場的手／批鬥地主",
    description: "銀行餘額依預設增加10%，布萊德彼特幣價格設為16000；由場控選擇分支",
    branches: [
      {
        id: "market",
        title: "市場的手（資本主義）",
        description: "除銀行複利與彼特幣價格外無額外效果",
      },
      {
        id: "landlord",
        title: "批鬥地主（共產主義）",
        description: "每筆已購地產扣除持有隊伍2000乘以地產等級的現金；大型地產只計一次",
      },
    ],
  },
  {
    id: 8,
    title: "讓美國再次偉大／文化大革命",
    description: "布萊德彼特幣價格設為15000；由場控選擇分支與銀行倍率",
    branches: [
      {
        id: "maga",
        title: "讓美國再次偉大（資本主義）",
        description: "銀行餘額先依預設增加10%，再將複利後餘額乘以0.5",
      },
      {
        id: "revolution",
        title: "文化大革命（共產主義）",
        description: "銀行餘額依預設增加10%；系統為每個有房屋可拆的小隊各隨機選取一處地產並自動降級",
      },
    ],
  },
  {
    id: 9,
    title: "馬斯克發廢文",
    description: "銀行餘額依預設增加10%；布萊德彼特幣價格設為500",
  },
  {
    id: 10,
    title: "最後的戰役",
    description:
      "布萊德彼特幣價格設為1000；由場控選擇勝方與銀行倍率",
    branches: [
      {
        id: "capitalism",
        title: "資本主義獲勝：發動讓美國再次偉大",
        description: "銀行餘額先依預設增加10%，再將複利後餘額乘以0.5",
      },
      {
        id: "communism",
        title: "共產主義獲勝：發動我們的財產",
        description: "銀行餘額依預設增加10%；手頭現金排名首尾配對交換",
      },
    ],
  },
];

// const effects = [
//   {
//     id: 1,
//     title: "地產增值(I)",
//     description: "房地產租金提升至150%, 效果持續10分鐘。不可疊加使用",
//     trait: 1,
//     duration: 600,
//     bonus: 1.5,
//   },
//   {
//     id: 2,
//     title: "財產凍結",
//     description: "其他小隊踩到此小隊的房產無須付租金, 效果持續5分鐘",
//     trait: 1,
//     duration: 300,
//     bonus: 0,
//   },
//   {
//     id: 3,
//     title: "量子領域",
//     description:
//       "選擇一個區域, 若其他小隊停在此區域會損失10%手上的金錢, 效果持續10分鐘",
//     trait: 1,
//     duration: 600,
//     bonus: -1,
//   },
//   {
//     id: 4,
//     title: "靈魂寶石",
//     description:
//       "所需支付的金錢提升至150%, 但同時所獲得的金錢提升至200%, 效果持續10分鐘",
//     trait: 1,
//     duration: 600,
//     bonus: -1,
//   },
//   {
//     id: 5,
//     title: "地產增值(II)",
//     description: "房地產租金提升至200%, 效果持續10分鐘。不可疊加使用",
//     trait: 1,
//     duration: 600,
//     bonus: 2,
//   },
//   {
//     id: 6,
//     title: "double一下",
//     description:
//       "選擇一個區域。若持有該區域數量-1的房產即可獲得double效果, 此效果沒有時間限制",
//     trait: 0,
//     duration: -1,
//     bonus: -1,
//   },
//   {
//     id: 7,
//     title: "時間寶石",
//     description: "強制其他小隊接下來的3回合內必須倒著走, GO格沒錢領",
//     trait: 1,
//     duration: 300,
//     bonus: -1,
//   },
// ];

const notifications = [
  {
    id: 0,
    title: "歡迎遊玩大富翁",
    description: "衝啊",
    type: "temporary",
    duration: 1800,
    createdAt: 0,
  },
  // {
  //   id: 1,
  //   title: "Test temporary",
  //   description: "temporary",
  //   type: "temporary",
  //   duration: 10,
  //   createdAt: Date.now() / 1000,
  // },
];

const pairs = [
  {
    key: "currentEvent",
    value: 0,
  },
  {
    key: "lastNotificationId",
    value: 0,
  },
  {
    key: "hawkEyeTeam",
    value: 0,
  },
  {
    key: "phase",
    value: 1,
  },
  {
    key: "bankInterestRate",
    value: 1.1,
  },
];

export const RESET_SCOPE_OPTIONS = [
  {
    id: "teams",
    label: "Team data",
    description: "Recreate nine teams and restore cash, bank balances, resources, and bonus states.",
  },
  {
    id: "lands",
    label: "Property data",
    description: "Recreate all 37 spaces and clear ownership, levels, bonuses, and large-property development.",
  },
  {
    id: "resources",
    label: "Resources and market price",
    description: "Recreate resource data and restore Brad Pitt Bitcoin to the initial price of 10,000.",
  },
  {
    id: "events",
    label: "Major events",
    description: "Recreate the aligned 2026 events, branches, announcements, notes, and selected branches.",
  },
  {
    id: "notifications",
    label: "Notifications and announcements",
    description: "Clear announcements and restore the initial welcome notification.",
  },
  {
    id: "effects",
    label: "Special effects",
    description: "Clear special-effect data created or active during the game.",
  },
  {
    id: "gameState",
    label: "Global game state",
    description: "Reset the current event, notification sequence, Hawk Eye team, game phase, and latest bank multiplier to 1.10.",
  },
];

const replaceCollection = async (Model, rows) => {
  await Model.deleteMany({});
  await Promise.all(rows.map((row) => new Model(row).save()));
};

const resetActions = {
  teams: () => replaceCollection(Team, teams),
  lands: () => replaceCollection(Land, lands),
  resources: () => replaceCollection(Resource, resources),
  events: () => replaceCollection(Event, events),
  notifications: async () => {
    await replaceCollection(Notification, notifications);
    await Broadcast.deleteMany({});
  },
  effects: () => Effect.deleteMany({}),
  gameState: () => replaceCollection(Pair, pairs),
};

export const resetGameData = async (requestedScopes, { includeUsers = false } = {}) => {
  if (!Array.isArray(requestedScopes) || requestedScopes.length === 0) {
    const error = new Error("Select at least one reset scope");
    error.status = 400;
    throw error;
  }

  const scopes = [...new Set(requestedScopes)];
  const validScopes = new Set(RESET_SCOPE_OPTIONS.map((option) => option.id));
  const invalidScopes = scopes.filter((scope) => !validScopes.has(scope));
  if (invalidScopes.length > 0) {
    const error = new Error(`Unknown reset scope: ${invalidScopes.join(", ")}`);
    error.status = 400;
    throw error;
  }

  if (includeUsers) {
    await replaceCollection(User, users);
  }
  for (const scope of scopes) {
    await resetActions[scope]();
  }
  return scopes;
};

const runInitData = async () => {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("找不到 MONGODB_URI，請先設定 backend/.env");
  }

  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("db connected");
  const allScopes = RESET_SCOPE_OPTIONS.map((option) => option.id);
  await resetGameData(allScopes, { includeUsers: true });
  console.log("finish saving data");
};

const normalizedEntry = process.argv[1]?.replace(/\\/g, "/");
if (normalizedEntry?.endsWith("/src/initdata.js")) {
  runInitData()
    .catch((error) => {
      console.error("初始化資料失敗", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await mongoose.disconnect();
    });
}

