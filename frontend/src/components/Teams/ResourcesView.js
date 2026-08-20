import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import RoleContext from "../useRole";
import Loading from "../Loading";
import axios from "../axios";

const formatNumber = (value) => Number(value || 0).toLocaleString("zh-TW");

const ResourcesView = () => {
  const { resources, setResources } = useContext(RoleContext);
  const [interestRate, setInterestRate] = useState(null);
  const [error, setError] = useState("");

  const loadMarket = useCallback(async () => {
    try {
      const [resourceResponse, interestResponse] = await Promise.all([
        axios.get("/resourceInfo"),
        axios.get("/interest"),
      ]);
      setResources(resourceResponse.data || []);
      setInterestRate(Number(interestResponse.data?.rate ?? 1));
      setError("");
    } catch (requestError) {
      setError("Unable to load market data. Check whether the backend is running.");
    }
  }, [setResources]);

  useEffect(() => {
    loadMarket();
    const interval = setInterval(loadMarket, 10000);
    return () => clearInterval(interval);
  }, [loadMarket]);

  if (resources.length === 0 && interestRate === null && !error) return <Loading />;

  const percentage = interestRate === null ? 0 : (interestRate - 1) * 100;
  const percentageLabel = `${percentage >= 0 ? "+" : ""}${percentage.toFixed(0)}%`;

  return (
    <Container maxWidth="md" sx={{ pt: 10, pb: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Market View</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page is read-only. Opening it does not change prices or bank balances.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} key={resource.id}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AutoGraphIcon color="primary" />
                  <Typography color="text.secondary">Current market price</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700}>{resource.name}</Typography>
                <Typography variant="h4">$ {formatNumber(resource.price)}</Typography>
                <Typography variant="caption" color="text.secondary">Price per coin</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <AccountBalanceIcon color="primary" />
                <Typography color="text.secondary">Latest applied bank multiplier</Typography>
              </Box>
              <Typography variant="h4">{Number(interestRate ?? 1).toFixed(2)}×</Typography>
              <Typography variant="h6" color={percentage >= 0 ? "success.main" : "error.main"}>{percentageLabel}</Typography>
              <Typography variant="caption" color="text.secondary">
                Major Events apply one multiplier per round. Viewing this page does not apply it again.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ResourcesView;
