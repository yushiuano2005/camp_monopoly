export const DEFAULT_EVENT_BANK_MULTIPLIER = 1.1;

const EVENT_RULES_2026 = {
  0: { bitcoinPrice: null, bankMultiplier: null },
  1: { bitcoinPrice: 5000, bankMultiplier: 1.3 },
  2: { bitcoinPrice: 6000, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
  3: { bitcoinPrice: 2000, bankMultiplier: 1.2 },
  4: { bitcoinPrice: 3000, bankMultiplier: 1.1 },
  5: { bitcoinPrice: 5000, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
  6: { bitcoinPrice: 30000, bankMultiplier: 1.1 },
  7: { bitcoinPrice: 16000, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
  8: { bitcoinPrice: 15000, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
  9: { bitcoinPrice: 500, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
  10: { bitcoinPrice: 1000, bankMultiplier: DEFAULT_EVENT_BANK_MULTIPLIER },
};

const BRANCH_RULE_OVERRIDES_2026 = {
  8: {
    maga: { bankEffectMultiplier: 0.5 },
  },
  10: {
    communism: { bankEffectMultiplier: 0.5 },
  },
};

export const EVENT_RULE_IDS = Object.keys(EVENT_RULES_2026).map(Number);

export function getEventRule(eventId, branch) {
  const numericEventId = Number(eventId);
  const baseRule = EVENT_RULES_2026[numericEventId] ?? EVENT_RULES_2026[0];
  const branchOverride = branch
    ? BRANCH_RULE_OVERRIDES_2026[numericEventId]?.[branch]
    : undefined;

  return { ...baseRule, ...branchOverride };
}

export function formatBankMultiplier(multiplier) {
  const percentage = Math.round((Number(multiplier) - 1) * 100);
  return {
    multiplier: Number(multiplier).toFixed(2),
    percentage,
    percentageLabel: `${percentage >= 0 ? "+" : ""}${percentage}%`,
  };
}
