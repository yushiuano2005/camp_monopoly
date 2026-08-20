import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Container,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Button,
  FormControl,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import RoleContext from "../useRole";
import axios from "../axios";
import TeamSelect from "../TeamSelect";

const Resources = () => {
  const [team, setTeam] = useState(-1);
  const [mode, setMode] = useState(0);
  const [resourceId, setResourceId] = useState(-1);
  const [number, setNumber] = useState("");
  const { setNavBarId, resources, setResources } = useContext(RoleContext);

  const navigate = useNavigate();

  const columns = [
    { id: "name", label: "Type", minWidth: "15vw", align: "center" },
    { id: "price", label: "Price", minWidth: "17vw", align: "center" },
  ];

  const getResources = useCallback(async () => {
    axios
      .get("/resourceInfo")
      .then((res) => {
        setResources(res.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [setResources]);

  const handleClick = async () => {
    const quantity = Number(number);
    if (team < 1 || resourceId < 0 || !Number.isInteger(quantity) || quantity <= 0) {
      alert("Select a team and enter a positive whole-number quantity.");
      return;
    }
    const payload = {
      teamId: team,
      resourceId,
      number: quantity,
      mode,
    };
    try {
      await axios.post("/sellResource", payload);
      navigate("/teams");
      setNavBarId(2);
    } catch (error) {
      alert(error.response?.data?.error || "Bitcoin trade failed.");
    }
  };

  const handleControlClick = async () => {
    const quantity = Number(number);
    if (team < 1 || resourceId < 0 || !Number.isInteger(quantity) || quantity <= 0) {
      alert("Select a team and enter a positive whole-number quantity.");
      return;
    }
    const payload = {
      teamId: team,
      resourceId,
      number: quantity,
      mode,
    };
    try {
      await axios.post("/controlResource", payload);
      navigate("/teams");
      setNavBarId(2);
    } catch (error) {
      alert(error.response?.data?.error || "Bitcoin balance correction failed.");
    }
  };

  const handleTeam = (nextTeam) => setTeam(nextTeam);

  useEffect(() => {
    getResources();
    const update = setInterval(() => {
      getResources();
    }, 80000);

    return () => clearInterval(update);
  }, [getResources]);

  return (
      <>
          <Container component="main" maxWidth="xs">
            <Box
              sx={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography component="h1" variant="h5">
                Resource Trading
              </Typography>

              <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <TeamSelect
                  label="Team"
                  team={team}
                  handleTeam={handleTeam}
                  hasZero={false}
                />
              </FormControl>


              <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <InputLabel id="resource">Resource</InputLabel>
                <Select
                  value={resourceId}
                  labelId="resource"
                  onChange={(e) => {
                    setResourceId(e.target.value);
                  }}
                >
                  <MenuItem value={-1}>Select Resource</MenuItem>
                  {resources.map((resource) => (
                    <MenuItem value={resource.id} key={resource.id}>
                      {resource.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>


              <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <InputLabel id="mode">Mode</InputLabel>
                <Select
                  value={mode}
                  labelId="mode"
                  onChange={(e) => {
                    setMode(e.target.value);
                  }}
                >
                  <MenuItem value={0}>Sell</MenuItem>
                  <MenuItem value={1}>Buy</MenuItem>
                </Select>
              </FormControl>
              <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <TextField
                  required
                  label="enter the amount"
                  id="number"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  autoFocus
                  onChange={(e) => {
                    setNumber(e.target.value);
                  }}
                />
              </FormControl>


              <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <Button
                  variant="contained"
                  disabled={team === -1 || resourceId === -1 || Number(number) <= 0}
                  onClick={handleClick}
                  fullWidth
                  sx={{ marginTop: 2 }}
                >
                  <SendIcon/>
                </Button>
              </FormControl>
            </Box>
          </Container>


          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 10,
            }}
          >

            <Typography component="h1" variant="h5">
                  Resource Direct Control
            </Typography>

            <Typography component="h1" variant="subtitle2" sx={{ color: 'gray' }}>
              CAUTION: This part will control the resource without charging money.
            </Typography>

            <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
            >
              <TeamSelect
                label="Team"
                team={team}
                handleTeam={handleTeam}
                hasZero={false}
              />
            </FormControl>

            <FormControl
              variant="standard"
              sx={{ minWidth: 250, marginTop: 2 }}
            >
              <InputLabel id="resource">Resource</InputLabel>
              <Select
                value={resourceId}
                labelId="resource"
                onChange={(e) => {
                  setResourceId(e.target.value);
                }}
              >
                <MenuItem value={-1}>Select Resource</MenuItem>
                {resources.map((resource) => (
                  <MenuItem value={resource.id} key={resource.id}>
                    {resource.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              variant="standard"
              sx={{ minWidth: 250, marginTop: 2 }}
            >
              <InputLabel id="mode">Mode</InputLabel>
              <Select
                value={mode}
                labelId="mode"
                onChange={(e) => {
                  setMode(e.target.value);
                }}
              >
                <MenuItem value={0}>-</MenuItem>
                <MenuItem value={1}>+</MenuItem>
              </Select>
            </FormControl>

            <FormControl
                variant="standard"
                sx={{ minWidth: 250, marginTop: 2 }}
              >
                <TextField
                  required
                  label="enter the amount"
                  id="number"
                  // autoComplete="enter the number"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  // sx={{ marginTop: 1, marginBottom: 1 }}
                  autoFocus
                  onChange={(e) => {
                    setNumber(e.target.value);
                  }}
                />
            </FormControl>

            <FormControl
              variant="standard"
              sx={{ minWidth: 250, marginTop: 2 }}
            >
              <Button
                variant="contained"
                disabled={team === -1 || resourceId === -1 || Number(number) <= 0}
                onClick={handleControlClick}
                fullWidth
                sx={{ marginTop: 2 }}
              >
                <SendIcon />
              </Button>
            </FormControl>
          </Box>

          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              paddingTop: "60px",
              paddingBottom: "60px",
              marginLeft: "2vw",
              marginRight: "2vw",
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 900,
              }}
            >
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((item) => (
                        <TableCell
                          key={item.id}
                          align={item.align}
                          style={{
                            minWidth: item.minWidth,
                            fontWeight: "800",
                            userSelect: "none",
                          }}
                        >
                          {item.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resources.map((resource, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ userSelect: "none" }}
                          >
                            {column.id === "name"
                              ? resource.name
                              : column.id === "price"
                              ? resource.price
                              : null}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </TableContainer>


            {/* <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img
                src="/love.jpg"
                alt="Map"
                style={{
                  maxWidth: "100%",
                  userSelect: "none",
                  marginTop: "20px",
                }}
              />
            </Box> */}
          </Paper>
        
      </>
    );
  };

export default Resources;
