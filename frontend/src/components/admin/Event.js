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
  const [message, setMessage] = useState("");
  const [APIResponse, setAPIResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const { role } = useContext(RoleContext);
  const navigate = useNavigate();

  const handleClick = async () => {
    setSubmitting(true);
    setAPIResponse(null);
    try {
      const { data } = await axios.post("/event", {
        id: event,
        branch,
        content: message.trim(),
      });
      setAPIResponse({ severity: "success", text: data.message });
    } catch (error) {
      setAPIResponse({
        severity: "error",
        text: error.response?.data?.error ?? "Failed to execute the event",
      });
    } finally {
      setSubmitting(false);
    }
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
    const selectedBranch = selectedBranches.find((item) => item.id === branch);
    const executionDetails =
      selectedBranch?.executionDetails ?? selectedEvent?.executionDetails ?? [];
    return (
      <Container
	component="main" 
	maxWidth="xs"
	sx={{ pt:10,pb:12 }}
	>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
	   width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            Event Settings
          </Typography>
          <FormControl fullWidth variant="standard" sx={{ marginTop: 2}}>
            <InputLabel id="title">Title</InputLabel>
            <Select
              value={event}
              labelId="title"
              onChange={(e) => {
                const nextEventId = Number(e.target.value);
                const nextEvent = events.find(
                  (item) => item.id === nextEventId
                );
                const nextBranch = nextEvent?.branches?.[0];
                setEvent(nextEventId);
                setBranch(nextBranch?.id ?? "");
                setMessage(
                  nextBranch?.defaultAnnouncement ??
                    nextEvent?.defaultAnnouncement ??
                    ""
                );
                setAPIResponse(null);
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
                <InputLabel id="branch-title">Event Branch</InputLabel>
                <Select
                  value={branch}
                  labelId="branch-title"
                  onChange={(e) => {
                    const nextBranch = selectedBranches.find(
                      (item) => item.id === e.target.value
                    );
                    setBranch(e.target.value);
                    setMessage(
                      nextBranch?.defaultAnnouncement ??
                        selectedEvent?.defaultAnnouncement ??
                        ""
                    );
                    setAPIResponse(null);
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
              label="Announcement Content (editable)"
              multiline
              minRows={4}
              sx={{ marginTop: 2, marginBottom: 2 }}
              variant="standard"
              value={message}
              helperText="The control desk may revise this announcement before publishing it."
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            />
            {event !== 0 ? (
              <Alert severity="info" sx={{ marginBottom: 2 }}>
                <Typography variant="subtitle2">
                  Actual Execution (read-only)
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                  {executionDetails.map((detail, index) => (
                    <Typography component="li" variant="body2" key={index}>
                      {detail}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            ) : null}
           <Box
              sx={{
                position: "sticky",
                bottom: 64,
                zIndex: 2,
                py: 1,
                bgcolor: "background.paper",
              }}
	    >
            <Button
                fullWidth
                variant="contained"
                disabled={
                  submitting ||
                  event === 0 ||
                  !message.trim() ||
                  (selectedBranches.length > 0 && !branch)
                }
                onClick={handleClick}
              >
                {submitting ? "Publishing..." : "Publish and Execute Event"}
              </Button>
            </Box>
          </FormControl>

          {APIResponse && (
            <Alert severity={APIResponse.severity} sx={{ marginTop: 2 }}>
              {APIResponse.text}
            </Alert>
          )}
        </Box>
      </Container>
    );
  }
};

export default Event;
