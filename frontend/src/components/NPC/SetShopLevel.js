import React, { useCallback, useMemo, useState } from "react";
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
import UpgradeIcon from "@mui/icons-material/Upgrade";
import TeamSelect from "../TeamSelect";
import axios from "../axios";

const uniqueProperties = (properties) => {
  const seen = new Set();
  return properties.filter((property) => {
    const key = property.largePropertyGroup ? `large-${property.largePropertyGroup}` : `land-${property.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const SetShopLevel = () => {
  const [team, setTeam] = useState(-1);
  const [teamData, setTeamData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });

  const loadTeam = useCallback(async (teamId) => {
    const [teamResponse, propertyResponse] = await Promise.all([
      axios.get(`/team/${teamId}`),
      axios.get(`/property/${teamId}`),
    ]);
    setTeamData(teamResponse.data);
    setProperties(uniqueProperties(propertyResponse.data).filter((property) =>
      ["Building", "SpecialBuilding"].includes(property.type) &&
      property.development !== "Park" &&
      Number(property.level) < 3
    ));
  }, []);

  const handleTeam = async (teamId) => {
    setTeam(teamId);
    setPropertyId(-1);
    await loadTeam(teamId);
  };

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === propertyId),
    [properties, propertyId]
  );
  const price = Number(selectedProperty?.price?.upgrade || 0);
  const currentCash = Number(teamData?.money || 0);
  const nextCash = currentCash - price;
  const canSubmit = Boolean(selectedProperty) && nextCash >= 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await axios.post("/property/upgrade", { teamId: team, landId: propertyId });
      await loadTeam(team);
      setPropertyId(-1);
      setMessage({ open: true, severity: "success", text: "Property upgrade completed." });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: error.response?.data?.error || "Property upgrade failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Property Upgrade</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Upgrade one property by exactly one level. Property purchases and direct cash adjustments are handled on separate pages.
          </Typography>
          <TeamSelect label="Team" team={team} handleTeam={handleTeam} hasZero={false} />
          <FormControl fullWidth sx={{ mt: 2 }} disabled={team === -1}>
            <InputLabel id="upgrade-property-label">Property</InputLabel>
            <Select
              labelId="upgrade-property-label"
              label="Property"
              value={propertyId}
              onChange={(event) => setPropertyId(Number(event.target.value))}
            >
              <MenuItem value={-1}>Select a property</MenuItem>
              {properties.map((property) => (
                <MenuItem value={property.id} key={property.id}>
                  #{property.id} {property.name} — Level {property.level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {team !== -1 && properties.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>This team has no property that can be upgraded.</Alert>
          )}
          {selectedProperty && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography fontWeight={700}>{selectedProperty.name}</Typography>
                <Chip label={`Upgrade cost: ${price.toLocaleString()}`} />
              </Box>
              <Typography sx={{ mt: 1 }}>Level: {selectedProperty.level} → {Number(selectedProperty.level) + 1}</Typography>
              <Typography>Cash: {currentCash.toLocaleString()} → {nextCash.toLocaleString()}</Typography>
              {nextCash < 0 && <Alert severity="error" sx={{ mt: 1 }}>The team does not have enough cash.</Alert>}
            </Box>
          )}
          <Button fullWidth variant="contained" startIcon={<UpgradeIcon />} disabled={!canSubmit || submitting} onClick={handleSubmit} sx={{ mt: 2 }}>
            {submitting ? "Upgrading…" : "Confirm upgrade"}
          </Button>
        </CardContent>
      </Card>
      <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage((state) => ({ ...state, open: false }))}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SetShopLevel;
