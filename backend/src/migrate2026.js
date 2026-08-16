import mongoose from "mongoose";
import dotenv from "dotenv-defaults";
import Event from "../models/event.js";
import Land from "../models/land.js";

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
  { id: 1, title: "幣圈龍婆聖旨", description: "銀行利率升到30%，布萊德彼特幣價值變為50%", branches: [] },
  { id: 2, title: "You can 踹 one more time", description: "在地產格的小隊每隊扣5000元；布萊德彼特幣價值變為60%", branches: [] },
  { id: 3, title: "普發一萬元但沒錢所以加蓋房屋", description: "每個小隊的地產格都可升級一次，銀行利率變成20%，布萊德彼特幣價值變為20%", branches: [] },
  { id: 4, title: "富翁掉錢", description: "銀行利率回歸10%，特定格子放置現金，先走到先拿；布萊德彼特幣價值變為30%", branches: [] },
  { id: 5, title: "男同俱樂部", description: "所有男隊輔進監獄，花6000元救回；5分鐘內未救援的小隊全隊進監獄一次；布萊德彼特幣價值變為50%", branches: [] },
  {
    id: 6,
    title: "剝削勞工／我們的財產",
    description: "銀行利率變回10%，布萊德彼特幣價值變為300%；由場控抽選分支",
    branches: [
      { id: "labor", title: "剝削勞工", description: "每個小隊隨機決定是否進監獄" },
      { id: "property", title: "我們的財產", description: "手頭現金第一名與最後一名、第二名與倒數第二名依序對調" },
    ],
  },
  {
    id: 7,
    title: "市場的手／批鬥地主",
    description: "布萊德彼特幣價值變為160%；由場控選擇分支",
    branches: [
      { id: "market", title: "市場的手", description: "布萊德彼特幣大漲" },
      { id: "landlord", title: "批鬥地主", description: "各小隊依地產數量與等級扣除2000倍的現金" },
    ],
  },
  {
    id: 8,
    title: "讓美國再次偉大／文化大革命",
    description: "布萊德彼特幣價值變為150%；由場控選擇分支",
    branches: [
      { id: "maga", title: "讓美國再次偉大", description: "所有小隊上交銀行帳戶50%的錢" },
      { id: "revolution", title: "文化大革命", description: "有房子的小隊隨機被破壞一棟房子" },
    ],
  },
  { id: 9, title: "馬斯克發廢文", description: "布萊德彼特幣暴跌，價值變為5%", branches: [] },
  {
    id: 10,
    title: "資本主義／共產主義最終結果",
    description: "手頭現金第一名與最後一名依序對調，布萊德彼特幣價值變為10%；由場控選擇勝方",
    branches: [
      { id: "capitalism", title: "資本主義獲勝：發動我們的財產", description: "毛澤東反擊川普，發動我們的財產" },
      { id: "communism", title: "共產主義獲勝：發動讓美國再次偉大", description: "川普反擊毛澤東，發動讓美國再次偉大" },
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

    const occupiedLargeProperties = existingLands.filter(
      (land) => [13, 14, 26, 27].includes(land.id) && land.owner !== 0
    );
    if (occupiedLargeProperties.length > 0) {
      throw new Error(
        `大型地產目前已有持有人（ID ${occupiedLargeProperties
          .map(({ id }) => id)
          .join(", ")}），為避免覆蓋狀態，已中止遷移`
      );
    }

    console.log(`已驗證 ${requiredLandIds.length} 個目標格與 ${events.length} 個事件設定`);
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
      ...largeProperties.map(({ id, ...data }) => ({
        updateOne: {
          filter: { id },
          update: {
            $set: {
              type: "Building",
              area: 0,
              ...data,
              description: "大型地產，可開發為公園、飯店或轉運站",
              owner: 0,
              level: 0,
              buffed: 0,
              price: { buy: 15000, upgrade: 10000 },
              rent: [0, 0, 0],
              development: null,
              transportFee: [2000, 3000, 4000],
            },
          },
        },
      })),
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
          update: { $set: { ...event, selectedBranch: "", note: "" } },
          upsert: true,
        },
      }))
    );
    console.log("2026 地產與大型事件資料遷移完成；隊伍、帳號與金錢資料均保留");
  } finally {
    await mongoose.disconnect();
  }
};

migrate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
