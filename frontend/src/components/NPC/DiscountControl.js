import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";

const PRICE_RATE_OPTIONS = [
  { label: "Pay 50%", discountPercent: 50 },
  { label: "Pay 60%", discountPercent: 40 },
  { label: "Pay 70%", discountPercent: 30 },
  { label: "Pay 80%", discountPercent: 20 },
  { label: "Pay 90%", discountPercent: 10 },
];

export const calculateDiscountedAmount = (baseAmount, discountPercent) => {
  const base = Number(baseAmount) || 0;
  const discount = Number(discountPercent) || 0;
  return Math.round(base * (100 - discount) / 100);
};

const DiscountControl = ({
  baseAmount,
  discountPercent,
  onApply,
  disabled = false,
  helperText = "Select the payable price only when a card or event grants a discount.",
}) => {
  const payableAmount = calculateDiscountedAmount(baseAmount, discountPercent);

  return (
    <Box sx={{ mt: 2, p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Typography fontWeight={700}>Discount</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {helperText}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {PRICE_RATE_OPTIONS.map((option) => (
          <Button
            key={option.discountPercent}
            variant={discountPercent === option.discountPercent ? "contained" : "outlined"}
            disabled={disabled}
            onClick={() => onApply(option.discountPercent)}
          >
            {option.label}
          </Button>
        ))}
        <Button
          color="inherit"
          variant={discountPercent === 0 ? "contained" : "text"}
          disabled={disabled}
          onClick={() => onApply(0)}
        >
          Full price
        </Button>
      </Box>
      {discountPercent > 0 && (
        <Alert severity="info" sx={{ mt: 1.5 }}>
          Base {Number(baseAmount).toLocaleString()} → Pay {payableAmount.toLocaleString()} ({discountPercent}% off)
        </Alert>
      )}
    </Box>
  );
};

export default DiscountControl;
