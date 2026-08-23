import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import PaidIcon from "@mui/icons-material/Paid";
import CalculateIcon from "@mui/icons-material/Calculate";
import RoleContext from "../useRole";
import Loading from "../Loading";
import axios from "../axios";

const formatNumber = (value) => Number(value || 0).toLocaleString("zh-TW");

const requestFailureMessage = (label, error) => {
  const status = error?.response?.status;

  if (status === 401) {
    return "Your login session expired, usually because the backend restarted. Sign in again.";
  }
  if (status === 403) {
    return `${label} could not be loaded because this account does not have permission.`;
  }
  if (status === 503) {
    return "MongoDB is temporarily unavailable. Check the backend database connection.";
  }
  if (error?.code === "ECONNABORTED" || error?.message?.toLowerCase().includes("timeout")) {
    return `${label} request timed out. The backend or database responded too slowly.`;
  }
  if (!error?.response) {
    return `${label} could not reach the backend.`;
  }
  return `${label} request failed (HTTP ${status}).`;
};

const uniqueProperties = (properties = []) => {
  const seen = new Set();
  return properties.filter((property) => {
    const key = property.largePropertyGroup
      ? `large-${property.largePropertyGroup}`
      : `land-${property.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const propertyValue = (property) =>
  Number(property.price?.buy || 0) +
  Math.max(Number(property.level || 1) - 1, 0) *
    Number(property.price?.upgrade || 0);

const TeamAssetCard = ({ icon, label, value, helper }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon}
          <Typography color="text.secondary">{label}</Typography>
        </Box>
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
      </CardContent>
    </Card>
  </Grid>
);

const TeamPrivateView = ({ team, properties, coinPrice,topPadding = 10 }) => {
  const ownedProperties = useMemo(() => uniqueProperties(properties), [properties]);
  const finalSettlementCash =
    Number(team.money || 0) +
    Number(team.bank || 0) +
    Number(team.resources?.eecoin || 0) * coinPrice;

  return (
    <Container maxWidth="lg" sx={{ pt: topPadding, pb: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>{team.teamname}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page shows only your team's resources and updates automatically after staff operations.
      </Typography>
      <Grid container spacing={2}>
        <TeamAssetCard icon={<PaidIcon color="primary" />} label="Cash" value={`$ ${formatNumber(team.money)}`} />
        <TeamAssetCard icon={<AccountBalanceIcon color="primary" />} label="Bank balance" value={`$ ${formatNumber(team.bank)}`} helper="Interest compounds when each major event is executed" />
        <TeamAssetCard icon={<CurrencyBitcoinIcon color="primary" />} label="Brad Pitt Bitcoin" value={`${formatNumber(team.resources?.eecoin)} coins`} helper={`Current unit price: $ ${formatNumber(coinPrice)}`} />
        <TeamAssetCard icon={<CalculateIcon color="primary" />} label="Final settlement cash" value={`$ ${formatNumber(finalSettlementCash)}`} helper="Cash + bank balance + Bitcoin at the current price; properties are excluded" />
      </Grid>

      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          My properties ({ownedProperties.length})
        </Typography>
        {ownedProperties.length === 0 ? (
          <Alert severity="info">This team does not currently own any property.</Alert>
        ) : (
          <Stack spacing={1}>
            {ownedProperties.map((property) => (
              <Box key={property.largePropertyGroup || property.id} sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", borderBottom: "1px solid", borderColor: "divider", py: 1 }}>
                <Chip size="small" label={property.largePropertyGroup ? `Space ${property.largePropertyGroup} (large property)` : `Space ${property.id}`} />
                <Typography sx={{ flexGrow: 1 }} fontWeight={600}>{property.name}</Typography>
                {property.development && <Chip size="small" color="secondary" label={property.development} />}
                <Typography variant="body2">Level {property.level || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Invested: $ {formatNumber(propertyValue(property))}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

const OperatorTeamTable = ({ teams, properties, coinPrice, topPadding = 10 }) => {
  const getTeamProperties = (teamId) => uniqueProperties(properties.filter((item) => item.owner === teamId));

  return (
    <Container maxWidth="lg" sx={{ pt: topPadding , pb: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>All Teams</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        NPC and Admin users can verify operation results here. Team accounts cannot see this table.
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell align="right">Cash</TableCell>
              <TableCell align="right">Bank</TableCell>
              <TableCell align="right">Bitcoin</TableCell>
              <TableCell align="right">Properties</TableCell>
              <TableCell align="right">Final settlement cash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((team) => {
              const owned = getTeamProperties(team.id);
              const finalSettlementCash = Number(team.money || 0) + Number(team.bank || 0) + Number(team.resources?.eecoin || 0) * coinPrice;
              return (
                <TableRow key={team.id} hover>
                  <TableCell>{team.teamname}</TableCell>
                  <TableCell align="right">$ {formatNumber(team.money)}</TableCell>
                  <TableCell align="right">$ {formatNumber(team.bank)}</TableCell>
                  <TableCell align="right">{formatNumber(team.resources?.eecoin)}</TableCell>
                  <TableCell align="right">{owned.length}</TableCell>
                  <TableCell align="right">$ {formatNumber(finalSettlementCash)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

const Teams = () => {
  const { roleId, teams, setTeams, setRole, setRoleId } = useContext(RoleContext);
  const [privateTeam, setPrivateTeam] = useState(null);
  const [properties, setProperties] = useState([]);
  const [coinPrice, setCoinPrice] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const requestInProgress = useRef(false);
  const navigate = useNavigate();
  const isTeam = roleId >= 1 && roleId <= 9;

  const loadData = useCallback(async () => {
   if (requestInProgress.current) return;
    requestInProgress.current = true;
    setRefreshing(true);
    try {
      setError("");
      const results = await Promise.allSettled([
	axios.get(isTeam ? `/team/${roleId}` : "/team"),
        axios.get(isTeam ? `/property/${roleId}` : "/land"),
        axios.get("/resourceInfo"),
      ]);
      const labels = ["Team data", "Property data", "Resource data"];
      const failures = results
        .map((result, index) =>
          result.status === "rejected"
            ? { label: labels[index], error: result.reason }
            : null
        )
        .filter(Boolean);

      const [teamResult, propertyResult, resourceResult] = results;
      if (teamResult.status === "fulfilled") {
        if (isTeam) setPrivateTeam(teamResult.value.data);
        else setTeams(teamResult.value.data);
      }
      if (propertyResult.status === "fulfilled") {
        setProperties(propertyResult.value.data || []);
      }
      if (resourceResult.status === "fulfilled") {
        setCoinPrice(Number(resourceResult.value.data?.[0]?.price || 0));
      }

      setSessionExpired(
        failures.some(({ error: requestError }) => requestError?.response?.status === 401)
      );
      setError(
        [...new Set(failures.map(({ label, error: requestError }) =>
          requestFailureMessage(label, requestError)
        ))].join(" ")
      );
    } 
      catch (requestError) {
      setSessionExpired(false);
      setError(requestFailureMessage("Team data", requestError));
    } finally {
      requestInProgress.current = false;
      setLoading(false);
      setRefreshing(false);
    }}, [isTeam, roleId, setTeams]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const hasTeamData = isTeam ? Boolean(privateTeam) : teams.length > 0;

  const handleSignInAgain = () => {
    localStorage.removeItem("role");
    sessionStorage.removeItem("operatorToken");
    setRole("");
    setRoleId(0);
    navigate("/login", { replace: true });
  };

  if (loading && !hasTeamData) return <Loading />;

  return (
    <Box>
      {error && (
        <Container maxWidth="lg" sx={{ pt: 10, pb: 0 }}>
          <Alert severity={sessionExpired ? "warning" : "error"}>
            <Typography variant="body2">{error}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {sessionExpired ? (
                <Button size="small" variant="outlined" onClick={handleSignInAgain}>
                  Sign in again
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={refreshing}
                  onClick={loadData}
                >
                  {refreshing ? "Retrying…" : "Retry"}
                </Button>
              )}
            </Stack>
          </Alert>
        </Container>
      )}
      {hasTeamData && (isTeam ? (
        <TeamPrivateView
          team={privateTeam}
          properties={properties}
          coinPrice={coinPrice}
          topPadding={error ? 2 : 10}
        />
      ) : (
        <OperatorTeamTable
          teams={teams}
          properties={properties}
          coinPrice={coinPrice}
          topPadding={error ? 2 : 10}
        />
      ))}
    </Box>
  );
};

export default Teams;
