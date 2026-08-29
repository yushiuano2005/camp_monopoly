const invalidPricing = (message) =>
  Object.assign(new RangeError(message), { status: 400 });

export const ALLOWED_DISCOUNT_PERCENTS = [0, 10, 20, 30, 40, 50];

export const normalizeDiscountPercent = (value = 0) => {
  const discountPercent = value === "" || value === null ? 0 : Number(value);
  if (!ALLOWED_DISCOUNT_PERCENTS.includes(discountPercent)) {
    throw invalidPricing(
      "Discount must be 0, 10, 20, 30, 40, or 50 percent off"
    );
  }
  return discountPercent;
};

export const calculateDiscountedAmount = (baseValue, discountValue = 0) => {
  const baseAmount = Number(baseValue);
  if (!Number.isFinite(baseAmount) || baseAmount < 0) {
    throw invalidPricing("Base amount must be a non-negative number");
  }

  const discountPercent = normalizeDiscountPercent(discountValue);
  const amount = Math.round(baseAmount * (100 - discountPercent) / 100);
  return { baseAmount, discountPercent, amount };
};
