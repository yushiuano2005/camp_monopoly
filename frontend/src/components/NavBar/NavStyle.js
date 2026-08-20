export const NavBarStyles = {
  drawer: {
    width: 250,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: 290,
      boxSizing: "border-box",
      backgroundColor: "rgba(80,80,80,1)",
      color: "rgba(255, 255, 255, 0.7)",
    },
    "& .Mui-selected": {
      //color: "rgba(51,153,255,0.7)",
      color: "#EFA53A",
    },
  },
  icons: {
    color: "rgba(255, 255, 255, 0.7)!important",
    marginLeft: "5px",
  },
  text: {
    marginLeft: "-12px",
    "& .MuiListItemText-primary": {
      fontWeight: "200",
      fontSize: "15px",
    },
    "& .MuiListItemText-secondary": {
      color: "rgba(255, 255, 255, 0.5)",
      lineHeight: 1.35,
    },
  },
};
