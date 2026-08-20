import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";
import VillaIcon from "@mui/icons-material/Villa";
import PaidIcon from "@mui/icons-material/Paid";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import EventIcon from "@mui/icons-material/Event";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import MapIcon from "@mui/icons-material/Map";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CalculateIcon from "@mui/icons-material/Calculate";
import SavingsIcon from "@mui/icons-material/Savings";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import DomainDisabledIcon from "@mui/icons-material/DomainDisabled";

export const NavBarItems = [
  { id: 1, icon: <NotificationsIcon />, label: "Live Updates", shortLabel: "Updates", description: "Major events, effects, and announcements", route: "notifications" },
  { id: 2, icon: <PeopleIcon />, label: "My Team", shortLabel: "Team", description: "Teams see their own data; staff see all teams", route: "teams" },
  { id: 3, icon: <VillaIcon />, label: "Properties", shortLabel: "Properties", description: "Prices, owners, rent, and building status", route: "properties" },
  { id: 4, icon: <MapIcon />, label: "Game Map", shortLabel: "Map", description: "Board spaces and positions", route: "map" },
  { id: 5, icon: <AutoGraphIcon />, label: "Market View", shortLabel: "Market", description: "Bitcoin price and latest applied bank multiplier", route: "resourcesView" },
];

export const NPCItems = [
  { id: 6, icon: <PaidIcon />, label: "Cash Adjustment", shortLabel: "Cash", description: "Directly increase or decrease team cash", route: "addmoney" },
  { id: 7, icon: <RequestQuoteIcon />, label: "Property Purchase", shortLabel: "Purchase", description: "Purchase an available property for a team", route: "propertypurchase" },
  { id: 18, icon: <UpgradeIcon />, label: "Property Upgrade", shortLabel: "Upgrade", description: "Upgrade one owned property by one level", route: "propertyupgrade" },
  { id: 19, icon: <DomainDisabledIcon />, label: "Property Demolition", shortLabel: "Demolish", description: "Remove one building when instructed by an event", route: "propertydemolition" },
  { id: 8, icon: <CurrencyExchangeIcon />, label: "Team Transfer", shortLabel: "Transfer", description: "Move cash between teams", route: "transfer" },
  { id: 9, icon: <SavingsIcon />, label: "Bank Operations", shortLabel: "Bank", description: "Deposit, withdraw, or correct bank balances", route: "banktransfer" },
  { id: 10, icon: <AutoGraphIcon />, label: "Bitcoin Trading", shortLabel: "Bitcoin", description: "Adjust a team's Bitcoin holdings", route: "resources" },
];

export const adminItems = [
  { id: 11, icon: <EventIcon />, label: "Major Events", shortLabel: "Events", description: "Select a branch and execute event effects", route: "event" },
  { id: 12, icon: <LocalAtmIcon />, label: "Interest Correction", shortLabel: "Interest", description: "Correct a missed or incorrect bank settlement", route: "interest" },
  { id: 15, icon: <VolumeUpIcon />, label: "Global Announcements", shortLabel: "Announcements", description: "Publish role-based live messages", route: "broadcast" },
  { id: 16, icon: <CalculateIcon />, label: "Market Controls", shortLabel: "Market", description: "Correct Bitcoin price and holdings", route: "setresources" },
  { id: 17, icon: <RestartAltIcon />, label: "System Reset", shortLabel: "Reset", description: "Restore selected 2026 initial data", route: "reset" },
];
