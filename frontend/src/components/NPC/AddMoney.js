import React, { useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import RoleContext from "../useRole";
import TeamSelect from "../TeamSelect";
import axios from "../axios";

const quickAmounts = [-16000, -10000, -5000, -4000, -3000, -2000, 2000, 3000, 4000, 5000, 10000, 16000];

const AddMoney = () => {
  const [team, setTeam] = useState(-1);
  const [teamData, setTeamData] = useState(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });
  const { setNavBarId } = useContext(RoleContext);

  const numericAmount = Number(amount);
  const isValid = team !== -1 && amount !== "" && Number.isInteger(numericAmount) && Math.abs(numericAmount) <= 1000000;

  const handleTeam = async (teamId) => {
    setTeam(teamId);
    const { data } = await axios.get(`/team/${teamId}`);
    setTeamData(data);
  };

  const addQuickAmount = (value) => {
    const current = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    setAmount(String(current + value));
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await axios.post("/add", { id: team, dollar: numericAmount });
      const { data } = await axios.get(`/team/${team}`);
      setTeamData(data);
      setAmount("");
      setNavBarId(6);
      setMessage({ open: true, severity: "success", text: "Cash balance updated." });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: error.response?.data?.error || "Cash adjustment failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const currentBalance = Number(teamData?.money || 0);
  const nextBalance = currentBalance + (Number.isFinite(numericAmount) ? numericAmount : 0);

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Cash Adjustment</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Use this page only for a direct increase or decrease of a team's cash balance. Property transactions and upgrades have separate pages.
          </Typography>
          <TeamSelect label="Team" team={team} handleTeam={handleTeam} hasZero={false} />
          <TextField
            fullWidth
            required
            type="number"
            label="Adjustment amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            error={amount !== "" && (!Number.isInteger(numericAmount) || Math.abs(numericAmount) > 1000000)}
            helperText="Use a positive number to add cash or a negative number to deduct cash."
            sx={{ mt: 2 }}
          />
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {quickAmounts.map((value) => (
              <Grid item xs={4} sm={3} key={value}>
                <Button
                  fullWidth
                  size="small"
                  variant={value > 0 ? "outlined" : "text"}
                  color={value > 0 ? "primary" : "error"}
                  disabled={team === -1}
                  onClick={() => addQuickAmount(value)}
                >
                  {value > 0 ? "+" : ""}{value.toLocaleString()}
                </Button>
              </Grid>
            ))}
          </Grid>
          {teamData && amount !== "" && (
            <Alert severity={nextBalance < 0 ? "warning" : "info"} sx={{ mt: 2 }}>
              Cash preview: {currentBalance.toLocaleString()} → {nextBalance.toLocaleString()}
              {nextBalance < 0 ? " (negative balance)" : ""}
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => setAmount("")} disabled={amount === ""}>Clear</Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<PaidIcon />}
              disabled={!isValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Applying…" : "Apply adjustment"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar open={message.open} autoHideDuration={4000} onClose={() => setMessage((state) => ({ ...state, open: false }))}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default AddMoney;
