const COMMON_DEPOSIT_EFFECT =
  "共通自動處理：每隊的 Pending deposit 依既有流程調整為原值約 150%（以 10 元為單位四捨五入）。";

const EVENT_CONTENT_2026 = {
  0: {
    announcement: "目前沒有正在進行的大型事件。",
    executionDetails: ["不執行任何資源或隊伍資料調整。"],
  },
  1: {
    announcement:
      "政府宣布普發一萬元！請各小隊依 2026 年活動規則領取，並留意最新的銀行利率與布萊德彼特幣價格。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 5,000。",
      "各隊銀行存款自動乘以 1.3，並四捨五入為整數。",
      "Resource View 的銀行利率自動設為 1.3。",
      COMMON_DEPOSIT_EFFECT,
      "普發一萬元為實體遊戲流程，由場控依 2026 SOP 執行；系統不會自動增加小隊現金。",
    ],
  },
  2: {
    announcement:
      "房市政策出現重大變動！請持有地產的小隊留意臨時支出，並確認最新的布萊德彼特幣價格。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 6,000。",
      COMMON_DEPOSIT_EFFECT,
      "停在地產格的小隊須扣除 5,000；此項由場控依現場位置手動處理。",
    ],
  },
  3: {
    announcement:
      "城市建設計畫正式啟動！各小隊的地產將依 2026 年活動 SOP 進行升級，銀行利率與幣值也同步調整。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 2,000。",
      "各隊銀行存款自動乘以 1.2，並四捨五入為整數。",
      "Resource View 的銀行利率自動設為 1.2。",
      COMMON_DEPOSIT_EFFECT,
      "地產升級由場控依 2026 SOP 手動操作；系統不會自動選擇或升級地產。",
    ],
  },
  4: {
    announcement:
      "市場迎來振興措施！請各小隊依現場說明領取實體資源，並留意銀行利率與布萊德彼特幣價格變化。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 3,000。",
      "各隊銀行存款自動乘以 1.1，並四捨五入為整數。",
      "Resource View 的銀行利率自動設為 1.1。",
      COMMON_DEPOSIT_EFFECT,
      "實體現金或其他現場資源由場控依 2026 SOP 發放；系統不會自動增加小隊現金。",
    ],
  },
  5: {
    announcement:
      "臨時管制措施啟動！請各小隊依現場 NPC 與場控指示完成監獄及救援相關流程。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 5,000。",
      COMMON_DEPOSIT_EFFECT,
      "監獄與救援流程由場控依 2026 SOP 手動執行；系統不會自動變更小隊位置。",
    ],
  },
  6: {
    announcement:
      "社會政策進入關鍵抉擇！請場控選擇本次事件分支，各小隊依選定結果執行後續流程。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 30,000。",
      "各隊銀行存款自動乘以 1.1，並四捨五入為整數。",
      "Resource View 的銀行利率自動設為 1.1。",
      COMMON_DEPOSIT_EFFECT,
    ],
    branches: {
      labor: {
        announcement:
          "勞工政策成為本次焦點！請各小隊依場控與 NPC 指示完成監獄相關流程。",
        executionDetails: [
          "選擇「勞工」分支。",
          "場控依 2026 SOP 手動抽選各小隊是否進入監獄；系統不會自動變更小隊位置。",
        ],
      },
      property: {
        announcement:
          "資產重新分配政策正式啟動！系統將依目前現金排名交換指定小隊的現金。",
        executionDetails: [
          "選擇「房地產」分支。",
          "系統依現金由高到低排序，將首尾小隊配對，並自動交換每一組配對小隊的現金。",
        ],
      },
    },
  },
  7: {
    announcement:
      "市場制度面臨選擇！請場控選擇本次事件分支，各小隊依選定結果留意資產與稅務變化。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 16,000。",
      COMMON_DEPOSIT_EFFECT,
    ],
    branches: {
      market: {
        announcement:
          "自由市場機制維持運作！本分支沒有額外的自動資產調整。",
        executionDetails: [
          "選擇「市場」分支。",
          "除本事件的共通調整外，不執行額外自動處理。",
        ],
      },
      landlord: {
        announcement:
          "地產持有稅正式開徵！持有地產的小隊將依建築等級支付稅金。",
        executionDetails: [
          "選擇「地主」分支。",
          "系統以每個大型地產群組計算一次，依建築等級自動扣除「2,000 × 等級」的現金。",
        ],
      },
    },
  },
  8: {
    announcement:
      "國際局勢出現重大變化！請場控選擇本次事件分支，各小隊依選定結果執行後續調整。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 15,000。",
      COMMON_DEPOSIT_EFFECT,
    ],
    branches: {
      maga: {
        announcement:
          "金融政策急遽轉向！銀行利率將下調，請各小隊重新評估資源配置。",
        executionDetails: [
          "選擇「MAGA」分支。",
          "各隊銀行存款自動乘以 0.5，並四捨五入為整數。",
          "Resource View 的銀行利率自動設為 0.5。",
        ],
      },
      revolution: {
        announcement:
          "革命行動開始！請場控依 2026 SOP 抽選並移除一棟建築物。",
        executionDetails: [
          "選擇「革命」分支。",
          "抽選及移除建築物由場控依 2026 SOP 手動操作；系統不會自動選擇地產。",
        ],
      },
    },
  },
  9: {
    announcement:
      "布萊德彼特幣市場劇烈震盪！幣值已大幅調整，請各小隊留意資產配置。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 500。",
      COMMON_DEPOSIT_EFFECT,
      "除上述調整外，不執行其他自動處理。",
    ],
  },
  10: {
    announcement:
      "最後的戰役正式開始！請場控選擇最終制度分支，各小隊依選定結果完成最終資產調整。",
    executionDetails: [
      "布萊德彼特幣價格自動設為 1,000。",
      COMMON_DEPOSIT_EFFECT,
    ],
    branches: {
      capitalism: {
        announcement:
          "「最後的戰役」選擇資本主義分支：系統將依目前現金排名交換指定小隊的現金。",
        executionDetails: [
          "選擇「資本主義」分支。",
          "系統依現金由高到低排序，將首尾小隊配對，並自動交換每一組配對小隊的現金。",
        ],
      },
      communism: {
        announcement:
          "「最後的戰役」選擇共產主義分支：銀行利率將下調，請各小隊確認最終資產。",
        executionDetails: [
          "選擇「共產主義」分支。",
          "各隊銀行存款自動乘以 0.5，並四捨五入為整數。",
          "Resource View 的銀行利率自動設為 0.5。",
        ],
      },
    },
  },
};

export const EVENT_CONTENT_IDS = Object.keys(EVENT_CONTENT_2026).map(Number);

export function getEventContentDefinition(eventId, branch) {
  const definition = EVENT_CONTENT_2026[Number(eventId)] ?? EVENT_CONTENT_2026[0];
  const branchDefinition = branch ? definition.branches?.[branch] : undefined;

  return {
    announcement: branchDefinition?.announcement ?? definition.announcement,
    executionDetails: [
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
