export const LARGE_PROPERTY_GROUPS = {
  13: [13, 14],
  26: [26, 27],
};

export const LARGE_PROPERTY_DEVELOPMENTS = {
  Hotel: {
    label: "飯店",
    rent: [3000, 4000, 5000],
    transportFee: [0, 0, 0],
  },
  Transport: {
    label: "轉運站",
    rent: [8000, 12000, 16000],
    transportFee: [2000, 3000, 4000],
  },
  Park: {
    label: "公園",
    rent: [0, 0, 0],
    transportFee: [0, 0, 0],
  },
};

export const getLargePropertyGroup = (landId) => {
  const numericId = Number(landId);
  return Object.entries(LARGE_PROPERTY_GROUPS).find(([, ids]) =>
    ids.includes(numericId)
  )?.[0];
};

export const getLinkedLandIds = (landId) => {
  const group = getLargePropertyGroup(landId);
  return group ? LARGE_PROPERTY_GROUPS[group] : [Number(landId)];
};

export const isLargeProperty = (landId) =>
  getLargePropertyGroup(landId) !== undefined;

export const getDevelopmentConfig = (development) =>
  LARGE_PROPERTY_DEVELOPMENTS[development] ?? null;
