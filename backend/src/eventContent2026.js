import { formatBankMultiplier, getEventRule } from "./eventRules2026.js";

const EVENT_CONTENT_2026 = {
  0: {
    announcement: "目前沒有正在進行的大型事件。",
    executionDetails: ["不執行任何資源或隊伍資料調整。"],
  },
  1: {
    announcement:
      "幣圈龍婆聖旨降臨！布萊德彼特幣價格調整為 5,000，本輪銀行複利倍率為 1.3（+30%）。",
    executionDetails: [],
  },
  2: {
    announcement:
      "You can 踹 one more time！停在地產格的小隊須支付 5,000；布萊德彼特幣價格調整為 6,000，本輪銀行依預設 +10% 複利。",
    executionDetails: [
      "停在地產格的小隊須扣除 5,000 現金；場控依目前棋盤位置手動處理。",
    ],
  },
  3: {
    announcement:
      "普發一萬元但沒錢，所以改為加蓋房屋！本事件不發放現金；事件執行當下，所有已購買且符合升級條件的地產都免費升級一級。布萊德彼特幣價格調整為 2,000，本輪銀行複利 +20%。",
    executionDetails: [
      "本事件不會自動或手動發放 10,000 現金。",
      "系統會將事件執行當下所有已購買、可升級且尚未達 Level 3 的地產自動免費升級一級，不扣除小隊現金。",
      "公園與已達 Level 3 的地產維持不變；大型地產的兩個格子視為同一處地產並同步升級。",
    ],
  },
  4: {
    announcement:
      "富翁掉錢！場控將在指定棋盤格放置實體現金，先抵達者先取得。布萊德彼特幣價格調整為 3,000，本輪銀行複利 +10%。",
    executionDetails: [
      "場控依 2026 SOP 在指定棋盤格放置實體現金；系統不會自動增加小隊現金。",
    ],
  },
  5: {
    announcement:
      "男同俱樂部事件開始！所有男隊輔進入監獄，可支付 6,000 救援；5 分鐘內未完成救援的小隊，全隊須進入監獄一次。布萊德彼特幣價格調整為 5,000，本輪銀行依預設 +10% 複利。",
    executionDetails: [
      "所有男隊輔進入監獄；每次救援費用為 6,000。",
      "5 分鐘內未救援男隊輔的小隊，全隊進入監獄一次。",
      "監獄、救援、扣款與時間判定皆由場控依 2026 SOP 手動處理。",
    ],
  },
  6: {
    announcement:
      "剝削勞工／我們的財產事件開始！分支由上到下依序為資本主義、共產主義，請場控選擇本次分支。布萊德彼特幣價格調整為 30,000，本輪銀行複利 +10%。",
    executionDetails: [],
    branches: {
      labor: {
        announcement:
          "剝削勞工（資本主義分支）！場控將隨機決定各小隊是否進入監獄。布萊德彼特幣價格調整為 30,000，本輪銀行複利 +10%。",
        executionDetails: [
          "選擇第一個「剝削勞工（資本主義）」分支。",
          "場控依 2026 SOP 手動抽選各小隊是否進入監獄；系統不會自動變更小隊位置。",
        ],
      },
      property: {
        announcement:
          "我們的財產（共產主義分支）！系統將依手頭現金排名，交換首尾配對小隊的現金。布萊德彼特幣價格調整為 30,000，本輪銀行複利 +10%。",
        executionDetails: [
          "選擇第二個「我們的財產（共產主義）」分支。",
          "系統依手頭現金由高到低排序，將首尾小隊配對，並交換每一組配對小隊的全部現金；9 隊時第 5 名不變。",
        ],
      },
    },
  },
  7: {
    announcement:
      "市場的手／批鬥地主事件開始！分支由上到下依序為資本主義、共產主義，請場控選擇本次分支。布萊德彼特幣價格調整為 16,000，本輪銀行依預設 +10% 複利。",
    executionDetails: [],
    branches: {
      market: {
        announcement:
          "市場的手（資本主義分支）！布萊德彼特幣價格調整為 16,000，本輪銀行依預設 +10% 複利；沒有其他資產調整。",
        executionDetails: [
          "選擇第一個「市場的手（資本主義）」分支。",
          "除彼特幣價格與銀行複利外，不執行其他處理。",
        ],
      },
      landlord: {
        announcement:
          "批鬥地主（共產主義分支）！持有地產的小隊將依各地產目前等級支付稅金。布萊德彼特幣價格調整為 16,000，本輪銀行依預設 +10% 複利。",
        executionDetails: [
          "選擇第二個「批鬥地主（共產主義）」分支。",
          "系統針對每筆等級大於 0 的已購地產，自動扣除持有隊伍「2,000 × 建築等級」的現金。",
          "大型地產的兩個格子視為同一筆地產，只計算一次。",
        ],
      },
    },
  },
  8: {
    announcement:
      "讓美國再次偉大／文化大革命事件開始！分支由上到下依序為資本主義、共產主義，請場控選擇本次分支。布萊德彼特幣價格調整為 15,000。",
    executionDetails: [],
    branches: {
      maga: {
        announcement:
          "讓美國再次偉大，戶頭上交50%財產！本輪銀行先依預設 +10% 複利，再將各小隊複利後的銀行餘額乘以 0.5（上交 50%）；布萊德彼特幣價格調整為 15,000。",
        executionDetails: ["選擇第一個「讓美國再次偉大（資本主義）」分支。"],
      },
      revolution: {
        announcement:
          "文化大革命（共產主義分支）！事件發生當下，系統會從每個有房屋可拆的小隊持有的地產中，各隨機選取一處並拆除一棟房屋。布萊德彼特幣價格調整為 15,000，本輪銀行依預設 +10% 複利。",
        executionDetails: [
          "選擇第二個「文化大革命（共產主義）」分支。",
          "系統會針對每個至少持有一處 Level 2 以上可拆房屋的小隊，各自隨機選取一處地產並自動降低一級，不退還現金。",
          "Level 1、公園及其他不可拆除地產維持不變；大型地產的兩個格子視為同一處地產並同步降級。",
        ],
      },
    },
  },
  9: {
    announcement:
      "馬斯克發廢文！布萊德彼特幣價格暴跌至 500；本輪銀行仍依預設 +10% 複利。",
    executionDetails: ["除彼特幣價格與銀行複利外，不執行其他處理。"],
  },
  10: {
    announcement:
      "最後的戰役開始！請場控選擇最終制度分支；布萊德彼特幣價格調整為 1,000。",
    executionDetails: [],
    branches: {
      capitalism: {
        announcement:
          "最後的戰役：資本主義獲勝，發動讓美國再次偉大！本輪銀行先依預設 +10% 複利，再將各小隊複利後的銀行餘額乘以 0.5（上交 50%）；布萊德彼特幣價格調整為 1,000。",
        executionDetails: [
          "選擇「資本主義獲勝：發動讓美國再次偉大」分支。",
          "此分支再次執行「讓美國再次偉大」的銀行效果；它是一次新的事件結算，不會撤銷先前的同名事件。",
        ],
      },
      communism: {
        announcement:
          "最後的戰役：共產主義獲勝，發動我們的財產！系統將依手頭現金排名，交換首尾配對小隊的現金；布萊德彼特幣價格調整為 1,000，本輪銀行依預設 +10% 複利。",
        executionDetails: [
          "選擇「共產主義獲勝：發動我們的財產」分支。",
          "系統依事件發生當下的手頭現金由高到低排序，將首尾小隊配對並交換全部現金；9 隊時第 5 名不變。",
          "此分支再次執行「我們的財產」；每次都依當下排名重新計算，不沿用前一次配對。",
        ],
      },
    },
  },
};

const EVENT_BRANCH_PRESENTATION_2026 = {
  6: [
    { id: "labor", title: "剝削勞工（資本主義）" },
    { id: "property", title: "我們的財產（共產主義）" },
  ],
  7: [
    { id: "market", title: "市場的手（資本主義）" },
    { id: "landlord", title: "批鬥地主（共產主義）" },
  ],
  8: [
    { id: "maga", title: "讓美國再次偉大（資本主義）" },
    { id: "revolution", title: "文化大革命（共產主義）" },
  ],
  10: [
    { id: "capitalism", title: "資本主義獲勝：發動讓美國再次偉大" },
    { id: "communism", title: "共產主義獲勝：發動我們的財產" },
  ],
};

export const EVENT_CONTENT_IDS = Object.keys(EVENT_CONTENT_2026).map(Number);

const getAutomaticExecutionDetails = (eventId, branch) => {
  const numericEventId = Number(eventId);
  if (numericEventId === 0) return [];

  const { bitcoinPrice, bankMultiplier, bankEffectMultiplier } = getEventRule(numericEventId, branch);
  const rate = formatBankMultiplier(bankMultiplier);
  const details = [
    `布萊德彼特幣價格自動設為 ${Number(bitcoinPrice).toLocaleString("zh-TW")}。`,
    `本次大型事件視為一次約 10 分鐘的銀行複利結算；各隊銀行餘額自動乘以 ${rate.multiplier}（${rate.percentageLabel}），並四捨五入為整數。`,
    `Resource View 的最近套用銀行倍率自動設為 ${rate.multiplier}。`,
  ];
  if (bankEffectMultiplier) {
    const effect = formatBankMultiplier(bankEffectMultiplier);
    details.splice(
      2,
      0,
      `完成本輪複利後，事件再將各隊銀行餘額乘以 ${effect.multiplier}（${effect.percentageLabel}），並再次四捨五入為整數。`
    );
  }
  return details;
};

export function getEventContentDefinition(eventId, branch) {
  const definition = EVENT_CONTENT_2026[Number(eventId)] ?? EVENT_CONTENT_2026[0];
  const branchDefinition = branch ? definition.branches?.[branch] : undefined;

  return {
    announcement: branchDefinition?.announcement ?? definition.announcement,
    executionDetails: [
      ...getAutomaticExecutionDetails(eventId, branch),
      ...definition.executionDetails,
      ...(branchDefinition?.executionDetails ?? []),
    ],
  };
}

export function getDefaultEventAnnouncement(eventId, branch) {
  return getEventContentDefinition(eventId, branch).announcement;
}

export function getEventExecutionDetails(eventId, branch) {
  return getEventContentDefinition(eventId, branch).executionDetails;
}

export function getOrderedEventBranches(eventId, branches = []) {
  const presentation = EVENT_BRANCH_PRESENTATION_2026[Number(eventId)] ?? [];
  const order = new Map(presentation.map((item, index) => [item.id, index]));
  const titles = new Map(presentation.map((item) => [item.id, item.title]));

  return [...branches]
    .sort(
      (left, right) =>
        (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(right.id) ?? Number.MAX_SAFE_INTEGER)
    )
    .map((branch) => ({
      ...branch,
      title: titles.get(branch.id) ?? branch.title,
    }));
}
