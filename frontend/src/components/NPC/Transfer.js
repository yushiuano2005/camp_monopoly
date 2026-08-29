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
  Alert,
  Snackbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PropertyCard from "../Properties/PropertyCard";
import RoleContext from "../useRole";
import axios from "../axios";
import TeamSelect from "../TeamSelect";
import DiscountControl from "./DiscountControl";

const Transfer = () => {
  const [from, setFrom] = useState(-1);
  const [fromData, setFromData] = useState({});

  const [to, setTo] = useState(-1);
  const [toData, setToData] = useState({});

  const [building, setBuilding] = useState(-1);
  const [buildingData, setBuildingData] = useState({});

  const [discountPercent, setDiscountPercent] = useState(0);

  const [finalData, setFinalData] = useState({});

  const [amount, setAmount] = useState(0);
  const [hotelDice, setHotelDice] = useState(1);
  const [useTransport, setUseTransport] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [error, setError] = useState(false);
  const [message, setMessage] = useState({ open: false, severity: "error", text: "" });
  const { roleId, filteredBuildings, setNavBarId } = useContext(RoleContext);
  const navigate = useNavigate();

  const handleFrom = async (from) => {
    const { data } = await axios.get("/team/" + from);
    // console.log(data);
    setFromData(data);
    setFrom(from);
  };

  const handleTo = async (to, newBuildingData) => {
    const { data: toData } = await axios.get("/team/" + to);
    setToData(toData);
    setTo(to);

    /*if the "to" is not the owner and is affected by hawkeye, 
    then set the price equal to the 40% rent of hawkeye's building */

    // console.log(to !== buildingData.owner);
    // console.log(buildingData.id !== buildingData.hawkEye);
    // console.log(buildingData);
    // if (buildingData === null) return;
    const data = newBuildingData !== undefined ? newBuildingData : buildingData;
    if (to !== data.owner && data.id !== data.hawkEye) {
      const res = await axios.get("/land/" + data.hawkEye);
      console.log(res.data);
      setAmount(Math.round(0.4 * res.data.rent[res.data.level - 1]));
      setErrorMessage("Auto Fill Hawk Eye");
    }
  };

  const fetchFinal = async () => {
    try {
      const { data } = await axios.get("/transfer", {
        params: {
          from,
          to,
          IsEstate: building !== -1,
          baseDollar: Number(amount),
          discountPercent,
        },
      });
      setFinalData(data);
    } catch (requestError) {
      setFinalData({});
      setMessage({
        open: true,
        severity: "error",
        text: requestError.response?.data?.error || "Unable to preview this transfer.",
      });
    }
  };

  const handleClick = async () => {
    const payload = {
      from,
      to,
      IsEstate: building !== -1,
      baseDollar: Number(amount),
      discountPercent,
    };
    try {
      await axios.post("/transfer", payload);
      navigate("/teams");
      setNavBarId(2);
    } catch (requestError) {
      setMessage({
        open: true,
        severity: "error",
        text: requestError.response?.data?.error || "Transfer failed.",
      });
    }
  };

  const handleBuilding = async (building) => {
    if (building > 0) {
      const { data } = await axios.get("/land/" + building);
      setBuilding(building);
      setBuildingData(data);
      setHotelDice(1);
      setUseTransport(false);
      setDiscountPercent(0);
      if (data.owner !== 0) {
        handleTo(data.owner, data);
      } 
      // else if (data.hawkEye !== 0 && data.id !== data.hawkEye) {
      //   const { data: hawkEyeTeam } = await axios.get("/team/hawkeye");
      //   handleTo(hawkEyeTeam.id, data);
      //   const { data: hawkEyeBuilding } = await axios.get(
      //     "/land/" + data.hawkEye
      //   );
      //   setAmount(
      //     Math.round(0.4 * hawkEyeBuilding.rent[hawkEyeBuilding.level - 1])
      //   );
      //   setErrorMessage("Auto Fill Hawk Eye");
      // }

      const res = await axios.post("/series", {
        teamId: data.owner,
        area: data.area,
      });
      const c = res.data.count;

      if (data.type === "Building") {
        if (data.level !== 0) {
          const baseRent = data.rent[data.level - 1];
          setAmount(data.development === "Park" ? 0 : baseRent);
        }
      } else {
        setAmount(c * 5000);
      }
    } else {
      setBuilding(-1);
      setBuildingData({});
      setAmount(0);
      setDiscountPercent(0);
    }
  };

  const handleHotelDice = (dice) => {
    setHotelDice(dice);
    const baseRent = buildingData.rent?.[buildingData.level - 1] ?? 0;
    setAmount(baseRent * dice);
  };

  const handleTransportUsage = (enabled) => {
    setUseTransport(enabled);
    const levelIndex = buildingData.level - 1;
    const baseRent = buildingData.rent?.[levelIndex] ?? 0;
    const extraFee = buildingData.transportFee?.[levelIndex] ?? 0;
    setAmount(baseRent + (enabled ? extraFee : 0));
  };

  // const handlePercentMoney = async (percent) => {
  //   // const money = fromData.money; //find the team's money
  //   const { data } = await axios.get("/getRent", {
  //     params: { building: building },
  //   });
  //   setAmount(Math.round(data * (1 + percent)));
  // };

  // const handleEqualMoney = () => {
  //   let money_from = fromData.money; //first team (using the card)
  //   let money_to = toData.money; //second team(passive)
  //   let temp = Math.round((money_from - money_to) / 2);
  //   setAmount(temp);
  // };

  useEffect(() => {
    if (roleId < 10) {
      navigate("/permission");
    }
    // axios
    //   .get("/team")
    //   .then((res) => {
    //     setTeams(res.data);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  useEffect(() => {
    if (from !== -1 && to !== -1 && Number(amount) > 0 && from !== to) {
      fetchFinal();
    }
  }, [from, to, amount, building, discountPercent]); // eslint-disable-line react-hooks/exhaustive-deps

  const PreviewBuilding = () => {
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
          Preview Building
        </Typography>
        <PropertyCard {...buildingData} />

        {buildingData.type === "Building" ? (
          <TableContainer component={Paper}>
            <Table aria-label="rent-table" size="small">
              <TableBody>
                <TableRow>
                  <TableCell align="center">
                    <HomeRoundedIcon />
                  </TableCell>
                  <TableCell align="center">
                    <HomeRoundedIcon />
                    <HomeRoundedIcon />
                  </TableCell>
                  <TableCell align="center">
                    <HomeRoundedIcon />
                    <HomeRoundedIcon />
                    <HomeRoundedIcon />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="center">{buildingData.rent[0]}</TableCell>
                  <TableCell align="center">{buildingData.rent[1]}</TableCell>
                  <TableCell align="center">{buildingData.rent[2]}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}

        {/* <Typography variant="body1" component="p">
          Series Count: {count}
        </Typography> */}
      </Box>
    );
  };

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
                <TableCell align="center">From</TableCell>
                <TableCell align="center">To</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Team</TableCell>
                <TableCell align="center">{from}</TableCell>
                <TableCell align="center">{to}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Before</TableCell>
                <TableCell align="center">{fromData.money}</TableCell>
                <TableCell align="center">{toData.money}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Base / discounted</TableCell>
                <TableCell align="center" colSpan={2}>
                  {Number(finalData.baseAmount || 0).toLocaleString()} / {Number(finalData.amount || 0).toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">Actual transfer</TableCell>
                <TableCell align="center" colSpan={2}>
                  {Number(finalData.transferAmount || 0).toLocaleString()}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center">After</TableCell>
                <TableCell align="center">{finalData.from}</TableCell>
                <TableCell align="center">{finalData.to}</TableCell>
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
          Transfer Money
        </Typography>
        <FormControl variant="standard" sx={{ minWidth: 250, marginTop: 0 }}>
          <InputLabel id="building">Building</InputLabel>
          <Select
            value={building}
            labelId="building"
            onChange={(e) => {
              handleBuilding(e.target.value);
            }}
          >
            <MenuItem value={-1}>Select Building</MenuItem>
            {filteredBuildings.map((item) => (
              <MenuItem value={item.id} key={item.id}>
                {item.id} {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {buildingData.development === "Hotel" ? (
          <FormControl variant="standard" sx={{ minWidth: 250, marginTop: 1 }}>
            <InputLabel id="hotel-dice-label">Hotel dice result</InputLabel>
            <Select
              value={hotelDice}
              labelId="hotel-dice-label"
              onChange={(e) => handleHotelDice(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((dice) => (
                <MenuItem value={dice} key={dice}>
                  {dice}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        {buildingData.development === "Transport" ? (
          <FormControl variant="standard" sx={{ minWidth: 250, marginTop: 1 }}>
            <InputLabel id="transport-usage-label">Use transport service</InputLabel>
            <Select
              value={useTransport ? "yes" : "no"}
              labelId="transport-usage-label"
              onChange={(e) => handleTransportUsage(e.target.value === "yes")}
            >
              <MenuItem value="no">Pay rent only</MenuItem>
              <MenuItem value="yes">Pay rent and transport fee</MenuItem>
            </Select>
          </FormControl>
        ) : null}
        {buildingData.development === "Park" ? (
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Parks do not charge rent.
          </Typography>
        ) : null}
        <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 1 }}
        >
          <TeamSelect
            label="From.."
            team={from}
            handleTeam={handleFrom}
            hasZero={false}
          />
        </FormControl>
        <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 1 }}
        >
          <TeamSelect
            label="To.."
            team={to}
            handleTeam={handleTo}
            hasZero={false}
            sx={{ marginBottom: 2 }}
          />
        </FormControl>

        {/* <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 1 }}
        >
          <FormLabel mx="auto">Is Concerning Estate?</FormLabel>
          <Stack
            direction="row"
            spacing="auto"
            alignItems="center"
            mx={5}
            mt={2}
          >
            <Typography>No</Typography>
            <Switch
              checked={isEstate}
              onChange={(e) => {
                setIsEstate(e.target.checked);
              }}
              label="Is concerning estate"
              size="large"
            />
            <Typography>Yes</Typography>
          </Stack>
        </FormControl> */}
        <FormControl
          variant="standard"
          sx={{ minWidth: "250px", marginTop: 2 }}
        >
          {/* <TextField
            required
            label="Amount"
            id="amount"
            value={amount}
            sx={{ marginTop: 2, marginBottom: 2 }}
            onChange={(e) => {
              setAmount(e.target.value);
              setEqual(false);
            }}
          /> */}

          <TextField
            required
            error={error}
            label="Amount"
            id="amount"
            value={amount}
            onChange={(e) => {
              const re = /^[0-9\b]+$/;
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

          <DiscountControl
            baseAmount={Number(amount)}
            discountPercent={discountPercent}
            onApply={setDiscountPercent}
            disabled={building === -1 || Number(amount) <= 0}
            helperText="Discounts apply only to property rent. Select the fixed payable rate stated by the card or event."
          />

          {/* <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 1,
              width: "100%",
            }}
          >
            <TextField
              required
              error={error0}
              label="discount"
              id="discount"
              value={discount}
              onChange={(e) => {
                const re = /^\d*\.?\d*$/;
                if (e.target.value === "" || re.test(e.target.value)) {
                  setDiscount(e.target.value ? e.target.value : "");
                  setErrorMessage0("");
                  setError0(false);
                } else {
                  setErrorMessage0("Please enter a valid number");
                  setError0(true);
                }
              }}
              helperText={errorMessage0}
              FormHelperTextProps={{ error: true }}
            />

            <Button
              variant="contained"
              disabled={amount === 0 || discount === 1}
              onClick={handleDiscount}
              fullWidth
              fullHeight
              sx={{ marginLeft: 1 }}
            >
              discount
            </Button>
          </Box> */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            {/* <Button
              variant="contained"
              sx={{ marginBottom: 1 }}
              disabled={to === -1 || from === -1}
              onClick={handleEqualMoney}
            >
              Equal
            </Button> */}
            {/* <Button
              variant="contained"
              sx={{ marginBottom: 1 }}
              disabled={to === -1 || from === -1}
              onClick={() => handlePercentMoney(0.5)}
            >
              raise
            </Button> */}

            {/* <Button
              variant="contained"
              sx={{ marginBottom: 1 }}
              disabled={to === -1 || from === -1}
              onClick={() => handlePercentMoney(0.1)}
            >
              10%
            </Button> */}
          </Box>
          {/* <Button
            disabled={!(from && to && amount) || from === to}
            onClick={handleClick}
          >
            Submit
          </Button> */}
          {/* <Button
            variant="contained"
            disabled={amount === 0 || from === to}
            onClick={handleDiscount}
            fullWidth
            sx={{ marginTop: 0 }}
          >
            love discount
          </Button> */}

          <Button
            variant="contained"
            disabled={
              from === -1 ||
              to === -1 ||
              from === to ||
              Number(amount) <= 0 ||
              error
            }
            onClick={handleClick}
            fullWidth
            sx={{ marginTop: 1 }}
          >
            <SendIcon />
          </Button>
        </FormControl>
        {building !== -1 ? <PreviewBuilding /> : null}
        {from !== -1 && to !== -1 ? <PreviewTransfer /> : null}
      </Box>
      <Snackbar
        open={message.open}
        autoHideDuration={5000}
        onClose={() => setMessage((state) => ({ ...state, open: false }))}
      >
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Container>
  );
};
export default Transfer;
