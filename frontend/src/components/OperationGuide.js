import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const operationGuides = {
  addmoney: {
    title: "Cash Adjustment",
    purpose: "Directly increase or decrease one team's cash after confirming the game result.",
    steps: ["Select the team", "Enter a positive or negative amount", "Check the balance preview and apply once"],
    warning: "Use Bank Operations for deposits and Team Transfer for payments between teams.",
  },
  setownership: {
    title: "Property Purchase",
    purpose: "Record a property purchase for a team.",
    steps: ["Select the team and available property", "Choose the development for a large property", "Review the price and cash balance before confirming"],
    warning: "A large property occupies two spaces and is always updated as one property.",
  },
  propertyupgrade: {
    title: "Property Upgrade",
    purpose: "Upgrade one property owned by the selected team by exactly one level.",
    steps: ["Select the team", "Choose an eligible property", "Review the next level, upgrade cost, and cash balance"],
    warning: "Parks and level-three properties cannot be upgraded. Property purchase is handled in Property Purchase.",
  },
  propertydemolition: {
    title: "Property Demolition",
    purpose: "Remove exactly one building from a team's property when a major event requires it.",
    steps: ["Select the affected team", "Choose one eligible property", "Confirm the level reduction and verify Properties"],
    warning: "This action gives no refund. For a large property, both board spaces remain synchronized.",
  },
  transfer: {
    title: "Team Transfer",
    purpose: "Process rent, a trade payment, or another cash transfer between two teams.",
    steps: ["Select the paying and receiving teams", "Enter the amount and property-payment settings", "Check both balances before submitting"],
    warning: "Use Bank Operations for deposits and withdrawals.",
  },
  banktransfer: {
    title: "Bank Operations",
    purpose: "Move cash between a team's hand and bank account, or correct a bank balance.",
    steps: ["Select the team", "Choose deposit, withdrawal, or direct correction", "Verify the cash and bank preview"],
    warning: "Major Events apply normal bank interest automatically. Only Admin may use Interest Correction for an exceptional repair.",
  },
  resources: {
    title: "Bitcoin Trading",
    purpose: "Buy or sell Brad Pitt Bitcoin at the current price, or make an explicit holdings correction.",
    steps: ["Select the team", "Choose buy or sell and enter the quantity", "Verify the cash result using the current market price"],
    warning: "The market price is controlled by major events or Admin Market Controls.",
  },
  event: {
    title: "Major Event Control",
    purpose: "Select the current major event and execute its selected branch.",
    steps: ["Select the event", "Choose a branch when required", "Verify the result in Live Updates and Market View"],
    warning: "Event effects may update every team immediately. Execute each event only once.",
  },
  interest: {
    title: "Manual Bank Interest Correction",
    purpose: "Manually correct every team's bank balance when an event settlement was missed or applied incorrectly.",
    steps: ["Enter a multiplier such as 1.1 for +10%", "Review the percentage preview", "Apply once and verify All Teams"],
    warning: "Major Events already compound bank interest once per round. Do not use this page during normal event operation.",
  },
  broadcast: {
    title: "Global Announcements",
    purpose: "Send an announcement to teams, NPC staff, or Admin users.",
    steps: ["Enter a title and message", "Choose the minimum visible role", "Publish and verify Live Updates"],
    warning: "Use the lowest level for team-visible messages and a higher level for staff-only instructions.",
  },
  setresources: {
    title: "Market Controls",
    purpose: "Correct the Bitcoin market price or a team's Bitcoin holdings.",
    steps: ["Choose price or holdings", "Select the resource or team and enter the value", "Verify the result in Market View"],
    warning: "A major event may also change the price. Check whether the event has already been executed.",
  },
  reset: {
    title: "System Reset",
    purpose: "Restore selected game data to the 2026 initial state.",
    steps: ["Select the data scopes", "Enter the Admin password", "Review the list and confirm"],
    warning: "Reset cannot be undone from this website. Login accounts are never reset.",
  },
};

const OperationGuide = ({ guide, children }) => {
  const content = operationGuides[guide];

  return (
    <>
      {content && (
        <Container maxWidth="md" sx={{ pt: 10 }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>How to use: {content.title}</Typography>
                <Typography variant="body2" color="text.secondary">{content.purpose}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography component="ol" sx={{ mt: 0, pl: 3 }}>
                {content.steps.map((step) => <li key={step}>{step}</li>)}
              </Typography>
              <Alert severity="warning" sx={{ mt: 1 }}>
                <AlertTitle>Before you continue</AlertTitle>
                {content.warning}
              </Alert>
            </AccordionDetails>
          </Accordion>
        </Container>
      )}
      {children}
    </>
  );
};

export default OperationGuide;
