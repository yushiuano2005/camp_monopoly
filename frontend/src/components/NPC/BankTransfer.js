import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Container,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Button,
  FormControl,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  Table,
  Grid,
  // Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PropertyCard from "../Properties/PropertyCard";
import RoleContext from "../useRole";
import axios from "../axios";
import TeamSelect from "../TeamSelect";

const BankTransfer = () => {
  const [targetTeam, setTargetTeam] = useState(-1);
  const [targetBankTeam, setTargetBankTeam] = useState(-1);
  const [fromData, setFromData] = useState({});
  const [fromBankData, setFromBankData] = useState({});

  const [amount, setAmount] = useState(0);
  const [bankAmount, setBankAmount] = useState(0);

  const [showPreview, setShowPreview] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [errorBankMessage, setErrorBankMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorBank, setErrorBank] = useState(false);
  const { setNavBarId } = useContext(RoleContext);
  const navigate = useNavigate();

  const handleFrom = async (from) => {
    const { data } = await axios.get("/team/" + from);
    // console.log(data);
    setFromData(data);
    setTargetTeam(from);
  };


  const handleClick = async () => {
    const payload = {
      targetTeam: targetTeam,
      dollar: parseInt(amount),
    };

    if(fromData.money < amount){
        setErrorMessage("Not enough money in the account");
        setError(true);
        return;
    }else if(fromData.bank < -amount){
        setErrorMessage("Not enough money in the bank");
        setError(true);
        return;
    }

    await axios.post("/bankTransfer", payload);
    navigate("/teams");
    setNavBarId(2);
  };

  const handleTeam = async (team) => {
    if (bankAmount !== "-" && bankAmount !== "" && targetBankTeam !== -1) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
    const { data } = await axios.get("/team/" + team);
    // console.log(data);
    setFromBankData(data);
    setTargetBankTeam(team);
  };

  const handleAmount = async (amount) => {
    if (bankAmount !== "-" && bankAmount !== "" && targetBankTeam !== -1) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
    setBankAmount(amount);
  };

  const handleBankClick = async() => {
    const payload = {
      targetTeam: targetBankTeam,
      dollar: parseInt(bankAmount),
    };

    await axios.post("/bankControl", payload);
    navigate("/teams");
    setNavBarId(2);
  }

  const PreviewTransfer = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 1,
          width: "100%",
        }}
      >
        <Typography variant="h6" component="h2">
          Preview Transfer
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="transfer-preview" size="small">
            <TableBody>
              <TableRow>
                <TableCell align="center">Transfer</TableCell>
                <TableCell align="center">Money</TableCell>
                <TableCell align="center">Bank</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Current</TableCell>
                <TableCell align="center">{fromData.money}</TableCell>
                <TableCell align="center">{fromData.bank}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">After Transfer</TableCell>
                <TableCell align="center">{fromData.money - amount}</TableCell>
                <TableCell align="center">{Number(fromData.bank) + Number(amount)}</TableCell>
              </TableRow>
            

            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 9,
          marginBottom: 9,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
            Bank Transfer
        </Typography>
        <Typography component="h1" variant="subtitle2" sx={{ color: 'gray' }}>
            Enter positive number to save money to bank.<br/>
            Enter negative number to withdraw money from bank.
        </Typography>
        <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 1 }}
        >
          <TeamSelect
            label="Team.."
            team={targetTeam}
            handleTeam={handleFrom}
            hasZero={false}
          />
        </FormControl>

        <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 2 }}
        >
          <TextField
            required
            error={error}
            label="Amount"
            id="amount"
            value={amount}
            onChange={(e) => {
              const re = /^-?\d*\.?\d*$/;
              if (e.target.value === "" || re.test(e.target.value)) {
                setAmount(e.target.value ? e.target.value : "");
                setErrorMessage("");
                setError(false);
              } else {
                setErrorMessage("Please enter a valid number");
                setError(true);
              }
            }}
            helperText={errorMessage}
            FormHelperTextProps={{ error: true }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
          </Box>

          <Button
            variant="contained"
            disabled={amount === 0 || targetTeam === -1}
            onClick={handleClick}
            fullWidth
            sx={{ marginTop: 1 }}
          >
            <SendIcon />
          </Button>
        </FormControl>

        {targetTeam !== -1  ? <PreviewTransfer /> : null}

        <Box
        sx={{
          marginTop: 9,
          marginBottom: 9,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5" sx={{ marginBottom: 0 }}>
          Direct Bank Balance Correction
        </Typography>

        <Typography component="h1" variant="subtitle2" sx={{ color: 'gray' }}>
          Directly correct a team's bank balance without moving cash. Use only to fix an operator error.
        </Typography>
          <FormControl variant="standard" sx={{ minWidth: 250 }}>
            <TeamSelect
              label="Team"
              team={targetBankTeam}
              handleTeam={handleTeam}
              hasZero={false}
            />

            <TextField
              required
              label="Bank balance adjustment"
              id="bankAmount"
              value={bankAmount}
              sx={{ marginTop: 2, marginBottom: 1 }}
              onChange={(e) => {
                const re = /^-?[0-9\b]+$/;
                if (
                  e.target.value === "-" ||
                  e.target.value === "" ||
                  re.test(e.target.value)
                ) {
                  if (Math.abs(parseInt(e.target.value)) > 1000000) {
                    setErrorBankMessage("Too Large");
                  } else {
                    handleAmount(e.target.value ? e.target.value : "");
                    setErrorBankMessage("");
                  }
                } else {
                  setErrorBankMessage("Please enter a valid number");
                }
              }}
              helperText={errorBankMessage}
              FormHelperTextProps={{ error: true }}
            />

            <Box display="flex" flexDirection="row" justifyContent="center">
              <Button
                variant="contained"
                disabled={targetBankTeam === -1 || bankAmount === ""}
                onClick={handleBankClick}
                fullWidth
              >
                <SendIcon />
              </Button>
            </Box>
          </FormControl>
        </Box>
      </Box>
    </Container>
  );
};
export default BankTransfer;
