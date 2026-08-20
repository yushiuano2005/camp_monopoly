import test from "node:test";
import assert from "node:assert/strict";
import {
  EVENT_CONTENT_IDS,
  getDefaultEventAnnouncement,
  getEventExecutionDetails,
  getOrderedEventBranches,
} from "./eventContent2026.js";
import {
  DEFAULT_EVENT_BANK_MULTIPLIER,
  EVENT_RULE_IDS,
  getEventRule,
} from "./eventRules2026.js";

const EVENT_BRANCHES = {
  6: ["labor", "property"],
  7: ["market", "landlord"],
  8: ["maga", "revolution"],
  10: ["capitalism", "communism"],
};

test("all 2026 events provide default announcements and execution details", () => {
  assert.deepEqual(EVENT_CONTENT_IDS, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  for (const eventId of EVENT_CONTENT_IDS) {
    const announcement = getDefaultEventAnnouncement(eventId);
    const executionDetails = getEventExecutionDetails(eventId);

    assert.ok(announcement, `event ${eventId} is missing an announcement`);
    assert.ok(
      executionDetails.length > 0,
      `event ${eventId} is missing execution details`
    );
    assert.doesNotMatch(
      `${announcement}\n${executionDetails.join("\n")}`,
      /2025|Pending deposit/i,
      `event ${eventId} contains legacy event text`
    );
    if (eventId !== 0) {
      assert.ok(
        executionDetails.some((detail) => detail.includes("銀行複利結算")),
        `event ${eventId} does not describe its bank settlement`
      );
    }
  }
});

test("all event branches provide their own announcement and execution details", () => {
  for (const [eventId, branches] of Object.entries(EVENT_BRANCHES)) {
    for (const branch of branches) {
      assert.ok(getDefaultEventAnnouncement(eventId, branch));
      assert.ok(getEventExecutionDetails(eventId, branch).length > 0);
    }
  }
});

test("event announcements match their event titles and behavior", () => {
  assert.match(getDefaultEventAnnouncement(1), /幣圈龍婆/);
  assert.doesNotMatch(getDefaultEventAnnouncement(1), /普發一萬元/);
  assert.match(getDefaultEventAnnouncement(3), /普發一萬元/);
  assert.match(getDefaultEventAnnouncement(3), /不發放現金/);
  assert.match(getDefaultEventAnnouncement(9), /馬斯克發廢文/);
});

test("every major event has exactly one configured bank multiplier", () => {
  assert.deepEqual(EVENT_RULE_IDS, EVENT_CONTENT_IDS);

  const expectedMultipliers = {
    1: 1.3,
    2: DEFAULT_EVENT_BANK_MULTIPLIER,
    3: 1.2,
    4: 1.1,
    5: DEFAULT_EVENT_BANK_MULTIPLIER,
    6: 1.1,
    7: DEFAULT_EVENT_BANK_MULTIPLIER,
    8: DEFAULT_EVENT_BANK_MULTIPLIER,
    9: DEFAULT_EVENT_BANK_MULTIPLIER,
    10: DEFAULT_EVENT_BANK_MULTIPLIER,
  };

  for (const [eventId, multiplier] of Object.entries(expectedMultipliers)) {
    assert.equal(getEventRule(eventId).bankMultiplier, multiplier);
  }
  assert.equal(getEventRule(8, "maga").bankMultiplier, DEFAULT_EVENT_BANK_MULTIPLIER);
  assert.equal(getEventRule(8, "maga").bankEffectMultiplier, 0.5);
  assert.equal(getEventRule(8, "revolution").bankMultiplier, 1.1);
  assert.equal(getEventRule(10, "capitalism").bankMultiplier, 1.1);
  assert.equal(getEventRule(10, "capitalism").bankEffectMultiplier, 0.5);
  assert.equal(getEventRule(10, "communism").bankMultiplier, DEFAULT_EVENT_BANK_MULTIPLIER);
  assert.equal(getEventRule(10, "communism").bankEffectMultiplier, undefined);
});

test("every major event uses the 2026 Bitcoin price from the event sheet", () => {
  const expectedPrices = {
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

  for (const [eventId, price] of Object.entries(expectedPrices)) {
    assert.equal(getEventRule(eventId).bitcoinPrice, price);
  }
});

test("bank penalties do not replace the required event interest settlement", () => {
  for (const [eventId, branch] of [[8, "maga"], [10, "capitalism"]]) {
    const details = getEventExecutionDetails(eventId, branch).join(" ");
    assert.match(details, /1\.10/);
    assert.match(details, /0\.50/);
    assert.match(details, /完成本輪複利後/);
  }
});

test("property-event announcements match their automatic execution", () => {
  const upgradeAnnouncement = getDefaultEventAnnouncement(3);
  const upgradeDetails = getEventExecutionDetails(3).join(" ");
  assert.match(upgradeAnnouncement, /所有已購買/);
  assert.match(upgradeDetails, /自動免費升級/);
  assert.match(upgradeDetails, /不扣除小隊現金/);
  assert.doesNotMatch(upgradeDetails, /手動選擇/);

  const revolutionAnnouncement = getDefaultEventAnnouncement(8, "revolution");
  const revolutionDetails = getEventExecutionDetails(8, "revolution").join(" ");
  assert.match(revolutionAnnouncement, /各隨機選取一處/);
  assert.match(revolutionDetails, /自動降低一級/);
  assert.doesNotMatch(revolutionDetails, /Property Demolition|系統不會自動/);
});

test("political branches and final-battle effects use the corrected mapping", () => {
  assert.match(getDefaultEventAnnouncement(6, "labor"), /資本主義分支/);
  assert.match(getDefaultEventAnnouncement(6, "property"), /共產主義分支/);
  assert.match(getDefaultEventAnnouncement(7, "market"), /資本主義分支/);
  assert.match(getDefaultEventAnnouncement(7, "landlord"), /共產主義分支/);
  assert.match(getEventExecutionDetails(8, "maga").join(" "), /資本主義/);
  assert.match(getDefaultEventAnnouncement(8, "revolution"), /共產主義分支/);

  const capitalismAnnouncement = getDefaultEventAnnouncement(10, "capitalism");
  const capitalismDetails = getEventExecutionDetails(10, "capitalism").join(" ");
  assert.match(capitalismAnnouncement, /發動讓美國再次偉大/);
  assert.match(capitalismDetails, /0\.50/);
  assert.doesNotMatch(capitalismAnnouncement, /交換首尾/);

  const communismAnnouncement = getDefaultEventAnnouncement(10, "communism");
  const communismDetails = getEventExecutionDetails(10, "communism").join(" ");
  assert.match(communismAnnouncement, /發動我們的財產/);
  assert.match(communismDetails, /首尾小隊配對/);
  assert.doesNotMatch(communismDetails, /0\.50/);
});

test("MAGA uses the requested default announcement", () => {
  assert.equal(
    getDefaultEventAnnouncement(8, "maga"),
    "讓美國再次偉大，戶頭上交50%財產！本輪銀行先依預設 +10% 複利，再將各小隊複利後的銀行餘額乘以 0.5（上交 50%）；布萊德彼特幣價格調整為 15,000。"
  );
});

test("political branches are returned capitalism-first even for legacy database order", () => {
  const legacyBranches = {
    6: [{ id: "property" }, { id: "labor" }],
    7: [{ id: "landlord" }, { id: "market" }],
    8: [{ id: "revolution" }, { id: "maga" }],
    10: [{ id: "communism" }, { id: "capitalism" }],
  };

  const expected = {
    6: ["labor", "property"],
    7: ["market", "landlord"],
    8: ["maga", "revolution"],
    10: ["capitalism", "communism"],
  };

  for (const [eventId, branches] of Object.entries(legacyBranches)) {
    const ordered = getOrderedEventBranches(eventId, branches);
    assert.deepEqual(ordered.map((branch) => branch.id), expected[eventId]);
    assert.match(ordered[0].title, /資本主義/);
    assert.match(ordered[1].title, /共產主義/);
  }
});
