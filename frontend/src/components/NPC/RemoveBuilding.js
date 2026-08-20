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
import DomainDisabledIcon from "@mui/icons-material/DomainDisabled";
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

const RemoveBuilding = () => {
  const [team, setTeam] = useState(-1);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });

  const loadTeam = useCallback(async (teamId) => {
    const response = await axios.get(`/property/${teamId}`);
    setProperties(uniqueProperties(response.data).filter((property) =>
      ["Building", "SpecialBuilding"].includes(property.type) &&
      property.development !== "Park" &&
      Number(property.level) > 1
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

  const handleSubmit = async () => {
    if (!selectedProperty || submitting) return;
    setSubmitting(true);
    try {
      await axios.post("/property/demolish", { teamId: team, landId: propertyId });
      await loadTeam(team);
      setPropertyId(-1);
      setMessage({ open: true, severity: "success", text: "One building was removed without a refund." });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: error.response?.data?.error || "Building removal failed." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Property Demolition</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Use this page only when a major event instructs the control desk to remove a building. No refund is issued.
          </Alert>
          <TeamSelect label="Team" team={team} handleTeam={handleTeam} hasZero={false} />
          <FormControl fullWidth sx={{ mt: 2 }} disabled={team === -1}>
            <InputLabel id="demolish-property-label">Property</InputLabel>
            <Select
              labelId="demolish-property-label"
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
            <Alert severity="info" sx={{ mt: 2 }}>This team has no removable building.</Alert>
          )}
          {selectedProperty && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography fontWeight={700}>{selectedProperty.name}</Typography>
                <Chip label="Refund: 0" />
              </Box>
              <Typography sx={{ mt: 1 }}>
                Level: {selectedProperty.level} → {Number(selectedProperty.level) - 1}
              </Typography>
              {selectedProperty.largePropertyGroup && (
                <Typography color="text.secondary">Both spaces of this large property will stay synchronized.</Typography>
              )}
            </Box>
          )}
          <Button
            fullWidth
            color="error"
            variant="contained"
            startIcon={<DomainDisabledIcon />}
            disabled={!selectedProperty || submitting}
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            {submitting ? "Removing…" : "Remove one building"}
          </Button>
        </CardContent>
      </Card>
      <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage((state) => ({ ...state, open: false }))}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default RemoveBuilding;
