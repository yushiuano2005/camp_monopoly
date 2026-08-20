import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import axios from "../axios";

const Interest = () => {
  const [rate, setRate] = useState("");
  const [currentRate, setCurrentRate] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });

  useEffect(() => {
    axios.get("/interest").then(({ data }) => setCurrentRate(Number(data.rate ?? 1))).catch(() => {});
  }, []);

  const numericRate = Number(rate);
  const isValid = rate !== "" && Number.isFinite(numericRate) && numericRate >= 0;
  const percentage = useMemo(() => (isValid ? (numericRate - 1) * 100 : 0), [isValid, numericRate]);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post("/interest", { rate: numericRate });
      setCurrentRate(Number(data.rate));
      setRate("");
      setMessage({ open: true, severity: "success", text: `Applied a ${Number(data.rate).toFixed(2)}× multiplier to every team's bank balance.` });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: "Unable to apply bank interest. Check the backend status before retrying." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Bank Interest</Typography>
          <Typography color="text.secondary">Latest applied rate: {currentRate.toFixed(2)}× ({((currentRate - 1) * 100).toFixed(0)}%)</Typography>
          <Alert severity="warning" sx={{ my: 2 }}>
            Submitting immediately multiplies all nine teams' bank balances. Use 1.1 for +10% or 0.9 for -10%.
          </Alert>
          <TextField
            fullWidth
            required
            label="Interest multiplier"
            value={rate}
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            onChange={(event) => setRate(event.target.value)}
            error={rate !== "" && !isValid}
            helperText={rate !== "" && !isValid ? "Enter a number greater than or equal to zero." : "Example: 1.1 = increase by 10%"}
          />
          {isValid && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography>Result: current bank balance × {numericRate.toFixed(2)}</Typography>
              <Typography fontWeight={700} color={percentage >= 0 ? "success.main" : "error.main"}>
                {percentage >= 0 ? "Increase" : "Decrease"} {Math.abs(percentage).toFixed(0)}%
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!isValid || submitting}
            onClick={handleSubmit}
            fullWidth
            sx={{ mt: 2 }}
          >
            {submitting ? "Applying…" : "Apply to all teams"}
          </Button>
        </CardContent>
      </Card>
      <Snackbar
        open={message.open}
        autoHideDuration={5000}
        onClose={() => setMessage((state) => ({ ...state, open: false }))}
      >
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Interest;
