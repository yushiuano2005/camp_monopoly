import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  SwipeableDrawer,
} from "@mui/material";
import { NavBarItems, NPCItems, adminItems } from "./NavBarItem";
import { NavBarStyles } from "./NavStyle";
import RoleContext from "../useRole";

const Navbar = ({ open, onClose }) => {
  // const [navBarId, setNavBarId] = useState(0);
  const { role, roleId, navBarId, setNavBarId } = useContext(RoleContext);
  const navigate = useNavigate();
  const handleClick = (index, name) => {
    navigate(name);
    setNavBarId(index);
    onClose();
  };

  const mapping = (item) => (
    <ListItem
      button
      key={item.id}
      onClick={() => handleClick(item.id, item.route)}
      selected={navBarId === item.id}
    >
      <ListItemIcon sx={NavBarStyles.icons}>{item.icon}</ListItemIcon>
      <ListItemText
        sx={NavBarStyles.text}
        primary={item.route === "teams" && roleId > 20 ? "All Teams" : item.label}
        secondary={item.description}
        secondaryTypographyProps={{ fontSize: "0.72rem" }}
      />
    </ListItem>
  );

  return (
    <SwipeableDrawer
      sx={NavBarStyles.drawer}
      variant="temporary"
      anchor="left"
      open={open}
      onOpen={() => {}}
      onClose={onClose}
    >
      <Toolbar align="center">{role || "Not signed in"}</Toolbar>
      <Divider />
      <List>
        {roleId > 0 && NavBarItems.map(mapping)}
        {roleId > 20 && (
          <>
            <Divider />
            <Typography sx={{ marginLeft: 3, marginTop: 2 }}>NPC Operations</Typography>
            {NPCItems.map(mapping)}
          </>
        )}
        {roleId === 100 && (
          <>
            <Divider />
            <Typography sx={{ marginLeft: 3, marginTop: 2 }}>Admin Controls</Typography>
            {adminItems.map(mapping)}
          </>
        )}
      </List>
    </SwipeableDrawer>
  );
};

export default Navbar;
