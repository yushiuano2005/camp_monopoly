import React, { useContext } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RoleContext from "./useRole";

const teamSteps = [
  ["Live Updates", "View the current major event, effects applied to your team, and staff announcements."],
  ["My Team", "View only your team's cash, deposits, Bitcoin, final settlement cash, and properties."],
  ["Properties", "Check property prices, rent, owners, and building status."],
  ["Game Map", "Use the space numbers to confirm the team's location and route."],
  ["Market View", "Check the current Bitcoin price and latest applied bank rate."],
];

const npcSteps = [
  ["1. Confirm the game result", "Verify the team, board space, amount, and applicable rule before changing data."],
  ["2. Choose one operation", "Use Cash Adjustment for direct cash, Team Transfer for payments, and Bank Operations for deposits."],
  ["3. Keep property actions separate", "Use Property Purchase only for buying land, and Property Upgrade only for upgrades."],
  ["4. Verify after submitting", "Check All Teams, Properties, or Market View and do not submit the same result twice."],
];

const adminSteps = [
  ["Major Events", "Choose the event and on-site branch; an event may update the market, banks, or team assets."],
  ["Bank Interest", "Enter a multiplier that is applied immediately to every team, such as 1.1 for +10%."],
  ["Market Controls", "Use only for a manual correction and first check whether a major event already changed the price."],
  ["Global Announcements", "Choose the minimum visible role before publishing to teams, NPC staff, or Admin users."],
  ["System Reset", "Reset only selected scopes. Login accounts are excluded and data cannot be restored from the page."],
];

const GuideCards = ({ items }) => (
  <Grid container spacing={2}>
    {items.map(([title, description]) => (
      <Grid item xs={12} sm={6} key={title}>
        <Card variant="outlined" sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Typography color="text.secondary">{description}</Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const Help = () => {
  const { roleId } = useContext(RoleContext);
  const isTeam = roleId >= 1 && roleId <= 9;
  const isAdmin = roleId === 100;

  return (
    <Container maxWidth="md" sx={{ pt: 10, pb: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Help Center</Typography>
      {isTeam ? (
        <>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Team accounts have five read-only information pages and cannot access staff operations.</Typography>
          <GuideCards items={teamSteps} />
        </>
      ) : (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>NPC workflow</Typography>
            <GuideCards items={npcSteps} />
          </Box>
          {isAdmin && (
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>Admin workflow</Typography>
              <GuideCards items={adminSteps} />
              <Alert severity="warning" sx={{ mt: 2 }}>
                Major Events, Bank Interest, and System Reset may affect several teams at once. Verify each result before continuing.
              </Alert>
            </Box>
          )}
        </Stack>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Source rules and worksheets</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open("https://docs.google.com/document/d/12xsq8KE-BfSfC_eI_g3PQU9ktGcfPIGU2w5XeRDXzY0/edit", "_blank", "noopener,noreferrer")}
          >
            2026 game rules
          </Button>
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open("https://docs.google.com/document/d/1dZtQcybst0T6yovUcKuQg3wGUoq9dhf3KoRRNyXniv0/edit", "_blank", "noopener,noreferrer")}
          >
            Common SOP
          </Button>
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open("https://docs.google.com/document/d/1Fewt4xPQkGLPoau46Z01cX5jSPgdlQIV/edit", "_blank", "noopener,noreferrer")}
          >
            NPC SOP
          </Button>
          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open("https://docs.google.com/spreadsheets/d/1p5wTjTyECRKNNSRqKfKzVfzFjTK7NfmcmzW8NinMZiI/edit", "_blank", "noopener,noreferrer")}
          >
            Property pricing
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Help;
