import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  Box,
  Button,
  FormControl,
  Alert,
} from "@mui/material";
import Loading from "../Loading";
import RoleContext from "../useRole";
import axios from "../axios";

const Event = () => {
  const [event, setEvent] = useState(0);
  const [branch, setBranch] = useState("");
  const [message, setMessage] = useState("無");
  const [APIResponse, setAPIResponse] = useState("");
  const [tempPhase, setTempPhase] = useState(1);
  const [events, setEvents] = useState([]);
  const { role, setPhase } = useContext(RoleContext);
  const navigate = useNavigate();

  const handleClick = async () => {
    await axios.post("/event", { id: event, branch }).then((res) => {
      setAPIResponse(res.data.message);
    });
    // navigate("/notifications");
  };

  const handleClick2 = async () => {
    setPhase(tempPhase);
    await axios.post("/phase", { phase: tempPhase });
    navigate("/notifications");
  };

  const handleMoneyPercent = async () => {
    await axios.post("/percent", {});
    navigate("/teams");
  }

  const handleResourcePercent = async () => {
    console.log("in");
    await axios.post("/cutResource", {});
    navigate("/teams");
  }

  const handleReset = async () => {
    try {
      console.log("reset");
      await axios.post("/reset", {});
      navigate("/teams");
    } catch (error) {
      console.error("There was an error resetting:", error);
    }

    navigate("/teams");
  };
  

  useEffect(() => {
    if (role !== "admin") {
      navigate("/permission");
    }
    axios
      .get("/allEvents")
      .then((res) => {
        setEvents(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (events.length === 0) {
    return <Loading />;
  } else {
    const selectedEvent = events.find((item) => item.id === event);
    const selectedBranches = selectedEvent?.branches ?? [];
    return (
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
            Event Settings
          </Typography>
          <FormControl variant="standard" sx={{ minWidth: 250, marginTop: 2 }}>
            <InputLabel id="title">Title</InputLabel>
            <Select
              value={event}
              labelId="title"
              onChange={(e) => {
                const nextEvent = events.find(
                  (item) => item.id === e.target.value
                );
                const nextBranch = nextEvent?.branches?.[0]?.id ?? "";
                const nextBranchDescription =
                  nextEvent?.branches?.[0]?.description ?? "";
                setEvent(e.target.value);
                setBranch(nextBranch);
                setMessage(
                  [nextBranchDescription, nextEvent?.description]
                    .filter(Boolean)
                    .join("\n")
                );
              }}
            >
              {events.map((item) => {
                return (
                  <MenuItem value={item.id} key={events.indexOf(item)}>
                    {item.title}
                  </MenuItem>
                );
              })}
            </Select>
            {selectedBranches.length > 0 ? (
              <FormControl variant="standard" sx={{ marginTop: 2 }}>
                <InputLabel id="branch-title">事件分支</InputLabel>
                <Select
                  value={branch}
                  labelId="branch-title"
                  onChange={(e) => {
                    const nextBranch = selectedBranches.find(
                      (item) => item.id === e.target.value
                    );
                    setBranch(e.target.value);
                    setMessage(
                      `${nextBranch?.description ?? ""}\n${
                        selectedEvent?.description ?? ""
                      }`
                    );
                  }}
                >
                  {selectedBranches.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
                      {item.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <TextField
              id="content"
              label="Content"
              multiline
              sx={{ marginTop: 2, marginBottom: 2 }}
              variant="standard"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            <Button
              disabled={
                event === 0 ||
                !message ||
                (selectedBranches.length > 0 && !branch)
              }
              onClick={handleClick}
            >
              Submit
            </Button>
          </FormControl>

          <Box
            sx={{
              marginTop: 15  ,
              display: 'flex',
              flexDirection: 'column', // Arrange children vertically
              alignItems: 'center',    // Center items horizontally
              justifyContent: 'center', // Center items vertically
            }}
          >
            <Typography component="h1" variant="subtitle2" sx={{ color: 'gray', marginBottom: 2 }}>
              CAUTION: It will reset EVERYTHING.
            </Typography>
            <Button
              variant="contained"
              sx={{
                width: 120,
                backgroundColor: 'red', // Set the background color to red
                '&:hover': {
                  backgroundColor: 'darkred' // Optional: change color on hover
                }
              }}
              onClick={() => {
                handleReset();
              }}
            >
              RESET
            </Button>
          </Box>

          {APIResponse && <Alert severity="info">{APIResponse}</Alert>}
        </Box>

        {/* <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Button
              variant="contained"
              sx={{ marginBottom: 1, width: 80 }}
              onClick={handleMoneyPercent}
            >
              money -30%
            </Button>

            <Button
              variant="contained"
              sx={{ marginBottom: 1, width: 80 }}
              onClick={handleResourcePercent}
            >
              Resource -50%
            </Button>
          </Box> */}
        {/* <Box
          sx={{
            marginTop: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            Phase Settings
          </Typography>
          <FormControl variant="standard" sx={{ minWidth: 250, marginTop: 2 }}>
            <InputLabel id="title">Select Phase</InputLabel>
            <Select
              value={tempPhase}
              onChange={(e) => setTempPhase(e.target.value)}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
            <Button onClick={handleClick2} sx={{ marginTop: 2 }}>
              Submit
            </Button>
          </FormControl>
        </Box> */}
      </Container>
    );
  }
};

export default Event;
