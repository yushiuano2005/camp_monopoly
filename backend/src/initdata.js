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

const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
if (!mongoUrl) {
  throw new Error("找不到 MONGODB_URI，請先設定 backend/.env");
}

const db = mongoose.connection;
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    deposit: 0,
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
    description: "銀行利率升到30%，布萊德彼特幣價值變為50%",
  },
  {
    id: 2,
    title: "You can 踹 one more time",
    description: "在地產格的小隊每隊扣5000元；布萊德彼特幣價值變為60%",
  },
  {
    id: 3,
    title: "普發一萬元但沒錢所以加蓋房屋",
    description:
      "每個小隊的地產格都可升級一次，銀行利率變成20%，布萊德彼特幣價值變為20%",
  },
  {
    id: 4,
    title: "富翁掉錢",
    description:
      "銀行利率回歸10%，特定格子放置現金，先走到先拿；布萊德彼特幣價值變為30%",
  },
  {
    id: 5,
    title: "男同俱樂部",
    description:
      "所有男隊輔進監獄，花6000元救回；5分鐘內未救援的小隊全隊進監獄一次；布萊德彼特幣價值變為50%",
  },
  {
    id: 6,
    title: "剝削勞工／我們的財產",
    description: "銀行利率變回10%，布萊德彼特幣價值變為300%；由場控抽選分支",
    branches: [
      {
        id: "labor",
        title: "剝削勞工",
        description: "每個小隊隨機決定是否進監獄",
      },
      {
        id: "property",
        title: "我們的財產",
        description: "手頭現金第一名與最後一名、第二名與倒數第二名依序對調",
      },
    ],
  },
  {
    id: 7,
    title: "市場的手／批鬥地主",
    description: "布萊德彼特幣價值變為160%；由場控選擇分支",
    branches: [
      {
        id: "market",
        title: "市場的手",
        description: "布萊德彼特幣大漲",
      },
      {
        id: "landlord",
        title: "批鬥地主",
        description: "各小隊依地產數量與等級扣除2000倍的現金",
      },
    ],
  },
  {
    id: 8,
    title: "讓美國再次偉大／文化大革命",
    description: "布萊德彼特幣價值變為150%；由場控選擇分支",
    branches: [
      {
        id: "maga",
        title: "讓美國再次偉大",
        description: "所有小隊上交銀行帳戶50%的錢",
      },
      {
        id: "revolution",
        title: "文化大革命",
        description: "有房子的小隊隨機被破壞一棟房子",
      },
    ],
  },
  {
    id: 9,
    title: "馬斯克發廢文",
    description: "布萊德彼特幣暴跌，價值變為5%",
  },
  {
    id: 10,
    title: "資本主義／共產主義最終結果",
    description:
      "手頭現金第一名與最後一名依序對調，布萊德彼特幣價值變為10%；由場控選擇勝方",
    branches: [
      {
        id: "capitalism",
        title: "資本主義獲勝：發動我們的財產",
        description: "毛澤東反擊川普，發動我們的財產",
      },
      {
        id: "communism",
        title: "共產主義獲勝：發動讓美國再次偉大",
        description: "川普反擊毛澤東，發動讓美國再次偉大",
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
];

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("db connected");
  await Team.deleteMany({});
  await Land.deleteMany({});
  await Resource.deleteMany({});
  await User.deleteMany({});
  await Event.deleteMany({});
  await Pair.deleteMany({});
  await Notification.deleteMany({});
  await Effect.deleteMany({});
  await Broadcast.deleteMany({});
  console.log("delete done");

  await Promise.all(users.map((user) => new User(user).save()));
  console.log("users created");

  await Promise.all(lands.map((ground) => new Land(ground).save()));
  console.log("lands created");

  await Promise.all(resources.map((row) => new Resource(row).save()));
  console.log("resources created");

  await Promise.all(teams.map((row) => new Team(row).save()));
  console.log("teams created");

  await Promise.all(events.map((row) => new Event(row).save()));
  console.log("events created");

  await Promise.all(pairs.map((row) => new Pair(row).save()));
  console.log("pairs created");

  await Promise.all(notifications.map((row) => new Notification(row).save()));
  console.log("notifications created");

  // effects.forEach(async (row) => {
  //   await new Effect(row).save();
  // });
  // console.log("effects created");

  console.log("finish saving data");
  await mongoose.disconnect();
});

