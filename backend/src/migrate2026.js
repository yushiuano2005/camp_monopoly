import mongoose from "mongoose";
import dotenv from "dotenv-defaults";
import Event from "../models/event.js";
import Land from "../models/land.js";
import Pair from "../models/pair.js";
import Team from "../models/team.js";

dotenv.config();

const regularProperties = [
  { id: 2, name: "瑪莎拉地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 3, name: "心存芥地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 4, name: "垃圾不落地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 7, name: "掃地", price: { buy: 10000, upgrade: 5000 }, rent: [4000, 8000, 12000] },
  { id: 8, name: "死心塌地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 9, name: "彼得大地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 16, name: "甘迺地", price: { buy: 10000, upgrade: 5000 }, rent: [4000, 8000, 12000] },
  { id: 17, name: "龍兄虎地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 18, name: "馬力兄地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 21, name: "白蘭地", price: { buy: 10000, upgrade: 5000 }, rent: [4000, 8000, 12000] },
  { id: 22, name: "出人頭地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 23, name: "超級快地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 28, name: "違規取地", price: { buy: 10000, upgrade: 5000 }, rent: [4000, 8000, 12000] },
  { id: 29, name: "五體投地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 30, name: "腳踏實地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
  { id: 35, name: "亂丟菸地", price: { buy: 10000, upgrade: 5000 }, rent: [4000, 8000, 12000] },
  { id: 36, name: "張家兄地", price: { buy: 12000, upgrade: 6000 }, rent: [6000, 10000, 14000] },
  { id: 37, name: "冰天雪地", price: { buy: 14000, upgrade: 7000 }, rent: [8000, 12000, 16000] },
];

const largeProperties = [
  { id: 13, name: "地寶", largePropertyGroup: 13 },
  { id: 14, name: "地寶", largePropertyGroup: 13 },
  { id: 26, name: "地王", largePropertyGroup: 26 },
  { id: 27, name: "地王", largePropertyGroup: 26 },
];

const events = [
  { id: 0, title: "無", description: "", branches: [] },
  { id: 1, title: "幣圈龍婆聖旨", description: "銀行餘額複利增加30%，布萊德彼特幣價格設為5000", branches: [] },
  { id: 2, title: "You can 踹 one more time", description: "銀行餘額依預設增加10%；地產格小隊由場控扣5000元；布萊德彼特幣價格設為6000", branches: [] },
  { id: 3, title: "普發一萬元但沒錢所以加蓋房屋", description: "不發放現金；所有已購買且符合條件的地產自動免費升級一級；銀行餘額複利增加20%；布萊德彼特幣價格設為2000", branches: [] },
  { id: 4, title: "富翁掉錢", description: "銀行餘額複利增加10%；場控在指定格子放置實體現金；布萊德彼特幣價格設為3000", branches: [] },
  { id: 5, title: "男同俱樂部", description: "銀行餘額依預設增加10%；所有男隊輔進監獄，花6000元救回；5分鐘內未救援的小隊全隊進監獄一次；布萊德彼特幣價格設為5000", branches: [] },
  {
    id: 6,
    title: "剝削勞工／我們的財產",
    description: "銀行餘額複利增加10%，布萊德彼特幣價格設為30000；由場控選擇分支",
    branches: [
      { id: "labor", title: "剝削勞工（資本主義）", description: "每個小隊隨機決定是否進監獄" },
      { id: "property", title: "我們的財產（共產主義）", description: "手頭現金第一名與最後一名、第二名與倒數第二名依序對調" },
    ],
  },
  {
    id: 7,
    title: "市場的手／批鬥地主",
    description: "銀行餘額依預設增加10%，布萊德彼特幣價格設為16000；由場控選擇分支",
    branches: [
      { id: "market", title: "市場的手（資本主義）", description: "除銀行複利與彼特幣價格外無額外效果" },
      { id: "landlord", title: "批鬥地主（共產主義）", description: "每筆已購地產扣除持有隊伍2000乘以地產等級的現金；大型地產只計一次" },
    ],
  },
  {
    id: 8,
    title: "讓美國再次偉大／文化大革命",
    description: "布萊德彼特幣價格設為15000；由場控選擇分支與銀行倍率",
    branches: [
      { id: "maga", title: "讓美國再次偉大（資本主義）", description: "銀行餘額先依預設增加10%，再將複利後餘額乘以0.5" },
      { id: "revolution", title: "文化大革命（共產主義）", description: "銀行餘額依預設增加10%；系統為每個有房屋可拆的小隊各隨機選取一處地產並自動降級" },
    ],
  },
  { id: 9, title: "馬斯克發廢文", description: "銀行餘額依預設增加10%；布萊德彼特幣價格設為500", branches: [] },
  {
    id: 10,
    title: "最後的戰役",
    description: "布萊德彼特幣價格設為1000；由場控選擇勝方與銀行倍率",
    branches: [
      { id: "capitalism", title: "資本主義獲勝：發動讓美國再次偉大", description: "銀行餘額先依預設增加10%，再將複利後餘額乘以0.5" },
      { id: "communism", title: "共產主義獲勝：發動我們的財產", description: "銀行餘額依預設增加10%；手頭現金排名首尾配對交換" },
    ],
  },
];

const applyChanges = process.argv.includes("--apply");
const requiredLandIds = [
  ...regularProperties.map(({ id }) => id),
  ...largeProperties.map(({ id }) => id),
  25,
];

const migrate = async () => {
  const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUrl) throw new Error("找不到 MONGODB_URI，請先設定 backend/.env");
  await mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const existingLands = await Land.find({ id: { $in: requiredLandIds } });
    if (existingLands.length !== requiredLandIds.length) {
      throw new Error("地圖資料不完整，已中止；此指令不會代替 initdata 建立全新資料庫");
    }

    const [existingEvents, legacyDepositCount, bankSetting] = await Promise.all([
      Event.find({ id: { $in: events.map(({ id }) => id) } }),
      Team.collection.countDocuments({ deposit: { $exists: true } }),
      Pair.findOne({ key: "bankInterestRate" }),
    ]);
    if (existingEvents.length !== events.length) {
      throw new Error("大型事件資料不完整或有重複，已中止遷移");
    }

    const occupiedLargeProperties = existingLands.filter(
      (land) => [13, 14, 26, 27].includes(land.id) && land.owner !== 0
    );

    console.log(`已驗證 ${requiredLandIds.length} 個目標格與 ${events.length} 個事件設定`);
    console.log(`舊銀行暫存欄位：${legacyDepositCount} 隊；目前銀行倍率：${Number(bankSetting?.value ?? 1).toFixed(2)}`);
    console.log(`已持有的大型地產格：${occupiedLargeProperties.length} 格（套用時保留持有者與建築狀態）`);
    if (!applyChanges) {
      console.log("目前是檢查模式，資料庫未變更；確認後執行 yarn migrate-2026:apply");
      return;
    }

    await Land.bulkWrite([
      ...regularProperties.map(({ id, ...data }) => ({
        updateOne: {
          filter: { id },
          update: { $set: { type: "Building", area: 1, ...data } },
        },
      })),
      ...largeProperties.flatMap(({ id, ...data }) => [
        {
          updateOne: {
            filter: { id },
            update: {
              $set: {
                type: "Building",
                area: 0,
                ...data,
                description: "大型地產，可開發為公園、飯店或轉運站",
                price: { buy: 15000, upgrade: 10000 },
                transportFee: [2000, 3000, 4000],
              },
            },
          },
        },
        {
          updateOne: {
            filter: { id, owner: 0 },
            update: {
              $set: {
                level: 0,
                buffed: 0,
                rent: [0, 0, 0],
                development: null,
              },
            },
          },
        },
      ]),
      {
        updateOne: {
          filter: { id: 25 },
          update: {
            $set: {
              type: "Chance",
              name: "機會",
              description: "為你的未來重新洗牌！",
            },
          },
        },
      },
    ]);

    await Event.bulkWrite(
      events.map((event) => ({
        updateOne: {
          filter: { id: event.id },
          update: { $set: event },
          upsert: true,
        },
      }))
    );
    await Team.collection.updateMany({}, { $unset: { deposit: "" } });
    await Pair.findOneAndUpdate(
      { key: "bankInterestRate" },
      { value: 1.1 },
      { upsert: true }
    );
    console.log("2026 地產與大型事件資料遷移完成；已移除舊 Pending deposit 並將預設銀行倍率設為1.1");
  } finally {
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
