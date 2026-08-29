import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Map = () => {
  return (
    <Container>
      <Box
        sx={{
          marginTop: 9,
          marginBottom: 9,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
          Game Map
        </Typography>
        <img
          src="/EEmap-2026.png"
          alt="2026 Monopoly board map"
          style={{
            maxWidth: "100%",
            userSelect: "none",
          }}
        />
        <img
          src="/playground.jpg"
          alt="2026 venue map"
          style={{
            width: "100%",
            maxWidth: "100%",
            height: "auto",
            marginTop: "24px",
            userSelect: "none",
          }}
        />
      </Box>
    </Container>
  );
};

export default Map;
