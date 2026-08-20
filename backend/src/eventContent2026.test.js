import test from "node:test";
import assert from "node:assert/strict";
import {
  EVENT_CONTENT_IDS,
  getDefaultEventAnnouncement,
  getEventExecutionDetails,
} from "./eventContent2026.js";

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
      /2025/,
      `event ${eventId} still refers to 2025`
    );
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

test("the universal cash announcement refers to the 2026 rules", () => {
  assert.match(getDefaultEventAnnouncement(1), /2026/);
});
