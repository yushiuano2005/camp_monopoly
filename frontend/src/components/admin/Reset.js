import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RoleContext from "../useRole";
import axios from "../axios";

const Reset = () => {
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (role !== "admin") {
      navigate("/permission");
      return;
    }

    axios
      .get("/reset/options")
      .then((response) => setOptions(response.data))
      .catch(() => {
        setResult({
          severity: "error",
          message: "Unable to load reset options. Check whether the backend is running.",
        });
      });
  }, [navigate, role]);

  const allSelected =
    options.length > 0 && selectedScopes.length === options.length;
  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => selectedScopes.includes(option.id))
        .map((option) => option.label),
    [options, selectedScopes]
  );

  const toggleScope = (scope) => {
    setSelectedScopes((current) =>
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope]
    );
    setResult(null);
  };

  const toggleAll = () => {
    setSelectedScopes(allSelected ? [] : options.map((option) => option.id));
    setResult(null);
  };

  const executeReset = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post("/reset", {
        scopes: selectedScopes,
        adminPassword,
      });
      setResult({
        severity: "success",
        message: `${response.data.message}: ${selectedLabels.join(", ")}`,
      });
      setAdminPassword("");
      setSelectedScopes([]);
    } catch (error) {
      setResult({
        severity: "error",
        message:
          error.response?.data?.error ??
          "Reset failed. Check the backend and MongoDB Atlas connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 9, marginBottom: 9 }}>
        <Typography component="h1" variant="h5" align="center">
          Admin Reset
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ marginTop: 1, marginBottom: 3 }}
        >
          Select the data to restore to the 2026 initial state. Login accounts are never reset.
        </Typography>

        <Paper variant="outlined" sx={{ padding: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={
                  selectedScopes.length > 0 && !allSelected
                }
                onChange={toggleAll}
              />
            }
            label="Select all game data (login accounts excluded)"
          />

          <FormGroup sx={{ marginTop: 1 }}>
            {options.map((option) => (
              <Box key={option.id} sx={{ marginBottom: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedScopes.includes(option.id)}
                      onChange={() => toggleScope(option.id)}
                    />
                  }
                  label={option.label}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", marginLeft: 4 }}
                >
                  {option.description}
                </Typography>
              </Box>
            ))}
          </FormGroup>

          <TextField
            fullWidth
            required
            type="password"
            label="Confirm Admin password"
            value={adminPassword}
            autoComplete="current-password"
            onChange={(event) => setAdminPassword(event.target.value)}
            sx={{ marginTop: 2 }}
          />

          <Alert severity="warning" sx={{ marginTop: 2 }}>
            Reset overwrites the selected MongoDB Atlas data and cannot be undone from this page.
          </Alert>

          <Button
            fullWidth
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={18} /> : <RestartAltIcon />}
            disabled={
              loading || selectedScopes.length === 0 || !adminPassword
            }
            onClick={() => setConfirmOpen(true)}
            sx={{ marginTop: 2 }}
          >
            {loading ? "Resetting…" : "Reset selected data"}
          </Button>
        </Paper>

        {result ? (
          <Alert severity={result.severity} sx={{ marginTop: 2 }}>
            {result.message}
          </Alert>
        ) : null}
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm data reset?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The following data will be reset: {selectedLabels.join(", ")}. Login accounts will not be reset.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={executeReset}>
            Confirm reset
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reset;
