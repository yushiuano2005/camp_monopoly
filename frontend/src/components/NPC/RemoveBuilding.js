import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  const selected = new Map();
  properties.forEach((property) => {
    const key = property.largePropertyGroup ? `large-${property.largePropertyGroup}` : `land-${property.id}`;
    const current = selected.get(key);
    if (!current || Number(property.level) > Number(current.level)) {
      selected.set(key, property);
    }
  });
  return Array.from(selected.values()).sort((a, b) => Number(a.id) - Number(b.id));
};

const RemoveBuilding = () => {
  const [team, setTeam] = useState(-1);
  const [teamData, setTeamData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "success", text: "" });

  const loadTeam = useCallback(async (teamId) => {
    const [teamResponse, propertyResponse] = await Promise.all([
      axios.get(`/team/${teamId}`),
      axios.get(`/property/${teamId}`),
    ]);
    setTeamData(teamResponse.data);
    setProperties(
      uniqueProperties(propertyResponse.data).filter((property) =>
        ["Building", "SpecialBuilding"].includes(property.type)
      )
    );
  }, []);

  const handleTeam = async (teamId) => {
    setTeam(teamId);
    setPropertyId(-1);
    try {
      await loadTeam(teamId);
    } catch (error) {
      setTeamData(null);
      setProperties([]);
      setMessage({
        open: true,
        severity: "error",
        text: error.response?.data?.error || "Unable to load this team's properties.",
      });
    }
  };

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === propertyId),
    [properties, propertyId]
  );
  const canDemolish = Boolean(
    selectedProperty &&
    selectedProperty.development !== "Park" &&
    Number(selectedProperty.level) > 1
  );

  const handleSubmit = async () => {
    if (!canDemolish || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post("/property/demolish", {
        teamId: team,
        landId: propertyId,
      });
      await loadTeam(team);
      setPropertyId(-1);
      setMessage({
        open: true,
        severity: "success",
        text: `Building removed: level ${data.previousLevel} → ${data.level}. Cash was not changed.`,
      });
    } catch (error) {
      setMessage({ open: true, severity: "error", text: error.response?.data?.error || "Building removal failed." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearOwnership = async () => {
    if (!selectedProperty || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post("/property/clear-ownership", {
        teamId: team,
        landId: propertyId,
      });
      await loadTeam(team);
      setPropertyId(-1);
      setMessage({
        open: true,
        severity: "success",
        text: `Ownership cleared for space${data.landIds.length > 1 ? "s" : ""} ${data.landIds.join(", ")}. Initial property state restored; cash was not changed.`,
      });
    } catch (error) {
      setMessage({
        open: true,
        severity: "error",
        text: error.response?.data?.error || "Clearing property ownership failed.",
      });
    } finally {
      setSubmitting(false);
      setConfirmClear(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ pt: 4, pb: 10 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Property Demolition</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This page has two separate actions: remove one building level, or clear the entire property ownership and restore its initial state. Neither action issues a refund.
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
            <Alert severity="info" sx={{ mt: 2 }}>This team does not own any property.</Alert>
          )}
          {selectedProperty && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                <Typography fontWeight={700}>{selectedProperty.name}</Typography>
                <Chip label="Refund: 0" />
              </Box>
              {canDemolish ? (
                <Typography sx={{ mt: 1 }}>
                  Remove building: Level {selectedProperty.level} → {Number(selectedProperty.level) - 1}
                </Typography>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  This property cannot be reduced by one level, but its ownership can still be cleared.
                </Alert>
              )}
              {teamData && (
                <Typography>Cash remains {Number(teamData.money).toLocaleString()}.</Typography>
              )}
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
            disabled={!canDemolish || submitting}
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            {submitting ? "Removing…" : "Remove one building"}
          </Button>
          <Button
            fullWidth
            color="error"
            variant="outlined"
            disabled={!selectedProperty || submitting}
            onClick={() => setConfirmClear(true)}
            sx={{ mt: 1.5 }}
          >
            Clear property ownership
          </Button>
        </CardContent>
      </Card>
      <Dialog open={confirmClear} onClose={() => !submitting && setConfirmClear(false)}>
        <DialogTitle>Clear property ownership?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedProperty
              ? `${selectedProperty.name} will return to its initial unowned state. Its owner, level, rent bonus, and large-property development settings will be reset. The team receives no refund and its cash will not change.`
              : "The selected property will return to its initial unowned state."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={submitting} onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={submitting || !selectedProperty}
            onClick={handleClearOwnership}
          >
            {submitting ? "Clearing…" : "Clear ownership"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage((state) => ({ ...state, open: false }))}>
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};

export default RemoveBuilding;
