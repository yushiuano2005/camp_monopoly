import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDiscountedAmount,
  normalizeDiscountPercent,
} from "./pricing.js";

test("discount pricing keeps full price when no discount is provided", () => {
  assert.deepEqual(calculateDiscountedAmount(14000), {
    baseAmount: 14000,
    discountPercent: 0,
    amount: 14000,
  });
});

test("discount pricing supports purchase, upgrade, and rent percentages", () => {
  assert.equal(calculateDiscountedAmount(14000, 30).amount, 9800);
  assert.equal(calculateDiscountedAmount(7000, 50).amount, 3500);
  assert.equal(calculateDiscountedAmount(8001, 20).amount, 6401);
  assert.equal(calculateDiscountedAmount(8000, 10).amount, 7200);
});

test("discount pricing rejects invalid percentages", () => {
  for (const value of [-1, 25, 60, 100, 12.5, "invalid"]) {
    assert.throws(() => normalizeDiscountPercent(value), /0, 10, 20, 30, 40, or 50/);
  }
});
