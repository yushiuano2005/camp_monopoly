import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import TeamSelect from "../TeamSelect";
import axios from "../axios";
import DiscountControl, { calculateDiscountedAmount } from "./DiscountControl";

const uniqueProperties = (properties) => {
  const seen = new Set();
  return properties.filter((property) => {
    const key = property.largePropertyGroup ? `large-${property.largePropertyGroup}` : `land-${property.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const SetOwnership = () => {
  const [team, setTeam] = useState(-1);
  const [teamData, setTeamData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState(-1);
  const [development, setDevelopment] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });

  const loadProperties = useCallback(async () => {
    const { data } = await axios.get("/land");
    setProperties(uniqueProperties(data.filter((item) => ["Building", "SpecialBuilding"].includes(item.type))));
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleTeam = async (teamId) => {
    setTeam(teamId);
    setPropertyId(-1);
    setDiscountPercent(0);
    const { data } = await axios.get(`/team/${teamId}`);
    setTeamData(data);
  };

  const availableProperties = useMemo(
    () => properties.filter((property) => property.owner === 0),
    [properties]
  );

  const selectedProperty = properties.find((property) => property.id === propertyId);
  const isLargeProperty = Boolean(selectedProperty?.largePropertyGroup);
  const price = Number(selectedProperty?.price?.buy || 0);
  const payablePrice = calculateDiscountedAmount(price, discountPercent);
  const currentCash = Number(teamData?.money || 0);
  const nextCash = currentCash - payablePrice;
  const canSubmit = team !== -1 && propertyId !== -1 && (!isLargeProperty || Boolean(development)) && nextCash >= 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await axios.post("/property/purchase", {
        teamId: team,
        landId: propertyId,
        development,
        discountPercent,
      });
      if (!isLargeProperty) await axios.post("/calcbonus", { teamId: team, land: selectedProperty.name, level: 1 });
      const { data } = await axios.get(`/team/${team}`);
      setTeamData(data);
      await loadProperties();
      setPropertyId(-1);
      setDevelopment("");
      setDiscountPercent(0);
      setMessage({ open: true, severity: "success", text: "Property purchase completed." });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: error.response?.data?.error || "Property transaction failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Property Purchase</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Record a property purchase. Property upgrades and direct cash adjustments are handled on separate pages.
          </Typography>
          <TeamSelect label="Team" team={team} handleTeam={handleTeam} hasZero={false} />
          <FormControl fullWidth sx={{ mt: 2 }} disabled={team === -1}>
            <InputLabel id="property-trade-label">Property</InputLabel>
            <Select
              labelId="property-trade-label"
              label="Property"
              value={propertyId}
              onChange={(event) => {
                setPropertyId(Number(event.target.value));
                setDevelopment("");
                setDiscountPercent(0);
              }}
            >
              <MenuItem value={-1}>Select a property</MenuItem>
              {availableProperties.map((property) => (
                <MenuItem value={property.id} key={property.id}>
                  #{property.id} {property.name}{property.largePropertyGroup ? " (large property)" : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isLargeProperty && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="development-label">Development</InputLabel>
              <Select labelId="development-label" label="Development" value={development} onChange={(event) => setDevelopment(event.target.value)}>
                <MenuItem value="Hotel">Hotel</MenuItem>
                <MenuItem value="Transport">Transport hub</MenuItem>
                <MenuItem value="Park">Park</MenuItem>
              </Select>
            </FormControl>
          )}
          {selectedProperty && teamData && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography fontWeight={700}>{selectedProperty.name}</Typography>
                <Chip label={`Pay: ${payablePrice.toLocaleString()}`} />
              </Box>
              {discountPercent > 0 && (
                <Typography color="text.secondary">
                  Base price: {price.toLocaleString()} ({discountPercent}% off)
                </Typography>
              )}
              <Typography sx={{ mt: 1 }}>Cash: {currentCash.toLocaleString()} → {nextCash.toLocaleString()}</Typography>
              {nextCash < 0 && <Alert severity="error" sx={{ mt: 1 }}>The team does not have enough cash.</Alert>}
            </Box>
          )}
          {selectedProperty && (
            <DiscountControl
              baseAmount={price}
              discountPercent={discountPercent}
              onApply={setDiscountPercent}
            />
          )}
          {team !== -1 && availableProperties.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>No properties are currently available for purchase.</Alert>
          )}
          <Button fullWidth variant="contained" startIcon={<ShoppingCartIcon />} disabled={!canSubmit || submitting} onClick={handleSubmit} sx={{ mt: 2 }}>
            {submitting ? "Processing…" : "Confirm purchase"}
          </Button>
        </CardContent>
      </Card>
      <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage((state) => ({ ...state, open: false }))}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SetOwnership;
