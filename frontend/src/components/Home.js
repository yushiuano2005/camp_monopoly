import React from "react";
import { Container, Box } from "@mui/material";
// import image from "../banner.jpg";
//put an great made after effect intro video!!
const Home = () => {
  return (
    <Container component="main">
      <Box
        sx={{
          height: "100px",
          marginTop: "10vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      />
      <img
        src="/EEcampCover.png"
        alt="2026 電機外交聯合宿營主視覺"
        style={{
          maxWidth: "100%",
          userSelect: "none",
        }}
      />
    </Container>
  );
};

export default Home;
