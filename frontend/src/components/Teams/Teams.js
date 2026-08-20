import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
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

const TeamPrivateView = ({ team, properties, coinPrice }) => {
  const ownedProperties = useMemo(() => uniqueProperties(properties), [properties]);
  const finalSettlementCash =
    Number(team.money || 0) +
    Number(team.bank || 0) +
    Number(team.deposit || 0) +
    Number(team.resources?.eecoin || 0) * coinPrice;

  return (
    <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>{team.teamname}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page shows only your team's resources and updates automatically after staff operations.
      </Typography>
      <Grid container spacing={2}>
        <TeamAssetCard icon={<PaidIcon color="primary" />} label="Cash" value={`$ ${formatNumber(team.money)}`} />
        <TeamAssetCard icon={<AccountBalanceIcon color="primary" />} label="Bank balance" value={`$ ${formatNumber(team.bank)}`} helper={Number(team.deposit || 0) !== 0 ? `Pending settlement: $ ${formatNumber(team.deposit)}` : "Cash is shown separately"} />
        <TeamAssetCard icon={<CurrencyBitcoinIcon color="primary" />} label="Brad Pitt Bitcoin" value={`${formatNumber(team.resources?.eecoin)} coins`} helper={`Current unit price: $ ${formatNumber(coinPrice)}`} />
        <TeamAssetCard icon={<CalculateIcon color="primary" />} label="Final settlement cash" value={`$ ${formatNumber(finalSettlementCash)}`} helper="Cash + all deposits + Bitcoin at the current price; properties are excluded" />
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

const OperatorTeamTable = ({ teams, properties, coinPrice }) => {
  const getTeamProperties = (teamId) => uniqueProperties(properties.filter((item) => item.owner === teamId));

  return (
    <Container maxWidth="lg" sx={{ pt: 10, pb: 10 }}>
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
              const finalSettlementCash = Number(team.money || 0) + Number(team.bank || 0) + Number(team.deposit || 0) + Number(team.resources?.eecoin || 0) * coinPrice;
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
  const { roleId, teams, setTeams } = useContext(RoleContext);
  const [privateTeam, setPrivateTeam] = useState(null);
  const [properties, setProperties] = useState([]);
  const [coinPrice, setCoinPrice] = useState(0);
  const [error, setError] = useState("");
  const isTeam = roleId >= 1 && roleId <= 9;

  const loadData = useCallback(async () => {
    try {
      setError("");
      const [teamResponse, propertyResponse, resourceResponse] = await Promise.all([
        axios.get(isTeam ? `/team/${roleId}` : "/team"),
        axios.get(isTeam ? `/property/${roleId}` : "/land"),
        axios.get("/resourceInfo"),
      ]);
      if (isTeam) setPrivateTeam(teamResponse.data);
      else setTeams(teamResponse.data);
      setProperties(propertyResponse.data || []);
      setCoinPrice(Number(resourceResponse.data?.[0]?.price || 0));
    } catch (requestError) {
      setError("Unable to load team data. Check the backend and MongoDB connection.");
    }
  }, [isTeam, roleId, setTeams]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (error) return <Container sx={{ pt: 12 }}><Alert severity="error">{error}</Alert></Container>;
  if (isTeam && !privateTeam) return <Loading />;
  if (!isTeam && teams.length === 0) return <Loading />;

  return isTeam ? (
    <TeamPrivateView team={privateTeam} properties={properties} coinPrice={coinPrice} />
  ) : (
    <OperatorTeamTable teams={teams} properties={properties} coinPrice={coinPrice} />
  );
};

export default Teams;
