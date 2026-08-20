import React, { useState } from "react";
import Header from "./components/Header";
import "./App.css";
import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { ThemeProvider } from "@mui/material/styles";
import Home from "./components/Home";
import Notifications from "./components/Notifications";
import Teams from "./components/Teams/Teams";
import Properties from "./components/Properties/Properties";
import Login from "./components/Login";
import AddMoney from "./components/NPC/AddMoney";
import SetOwnership from "./components/NPC/SetOwnership";
import Transfer from "./components/NPC/Transfer";
import SetShopLevel from "./components/NPC/SetShopLevel";
import RemoveBuilding from "./components/NPC/RemoveBuilding";
import Event from "./components/admin/Event";
import Resources from "./components/NPC/Resources";
import Bank from "./components/admin/Bank";
import PermissionDenied from "./components/PermissionDenied";
import Footer from "./components/Footer";
import RoleContext from "./components/useRole";
import Loading from "./components/Loading";
import BroadcastAlert from "./components/BroadcastAlert";
import Broadcast from "./components/admin/Broadcast";
import { roleIdMap } from "./components/Login";
import theme from "./theme";
import SetDice from "./components/NPC/SetDice";
import Map from "./components/Properties/Map";
import Random from "./components/NPC/Random";
import SetResources from "./components/admin/SetResources";
import Help from "./components/Help";
import ResourcesView from "./components/Teams/ResourcesView";
import BankTransfer from "./components/NPC/BankTransfer";
import Interest from "./components/admin/Interest";
import Reset from "./components/admin/Reset";
import RequireRole from "./components/RequireRole";
import OperationGuide from "./components/OperationGuide";
// import SetPrices from "./components/admin/Resources";
// import Resource from "../../backend/models/resource";
// // import { socket, SocketContext } from "./websocket";

const App = () => {
  const localRole = localStorage.getItem("role");
  // console.log(localRole);
  const [navBarId, setNavBarId] = useState(0);
  const [role, setRole] = useState(localRole ? localRole : "");
  const [roleId, setRoleId] = useState(localRole ? roleIdMap[role] : 0);
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [phase, setPhase] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const value = {
    navBarId,
    setNavBarId,
    role,
    setRole,
    roleId,
    setRoleId,
    teams,
    setTeams,
    resources,
    setResources,
    phase,
    setPhase,
    buildings,
    setBuildings,
    filteredBuildings,
    setFilteredBuildings,
  };

  const location = useLocation();

  const protectedPage = (element, access = "authenticated", guide = null) => (
    <RequireRole access={access}>
      {guide ? <OperationGuide guide={guide}>{element}</OperationGuide> : element}
    </RequireRole>
  );

  return (
    // <SocketContext.Provider value={socket}>
    <ThemeProvider theme={theme}>
      <RoleContext.Provider value={value}>
        <Header />
        <BroadcastAlert />
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            timeout={300}
            classNames="fade"
            unmountOnExit
            in={true}
            appear={true}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/help" element={protectedPage(<Help />)} />
              <Route path="notifications" element={protectedPage(<Notifications />)} />
              <Route path="teams" element={protectedPage(<Teams />)} />
              <Route path="resourcesview" element={protectedPage(<ResourcesView />)} />
              <Route path="properties" element={protectedPage(<Properties />)} />
              <Route path="login" element={<Login />} />
              <Route path="addmoney" element={protectedPage(<AddMoney />, "npc", "addmoney")} />
              <Route path="setownership" element={protectedPage(<SetOwnership />, "npc", "setownership")} />
              <Route path="propertytrade" element={protectedPage(<SetOwnership />, "npc", "setownership")} />
              <Route path="propertypurchase" element={protectedPage(<SetOwnership />, "npc", "setownership")} />
              <Route path="transfer" element={protectedPage(<Transfer />, "npc", "transfer")} />
              <Route path="banktransfer" element={protectedPage(<BankTransfer />, "npc", "banktransfer")} />
              <Route path="setshop" element={protectedPage(<SetShopLevel />, "npc", "propertyupgrade")} />
              <Route path="propertyupgrade" element={protectedPage(<SetShopLevel />, "npc", "propertyupgrade")} />
              <Route path="propertydemolition" element={protectedPage(<RemoveBuilding />, "npc", "propertydemolition")} />
              <Route path="random" element={protectedPage(<Random />, "npc")} />
              <Route path="event" element={protectedPage(<Event />, "admin", "event")} />
              <Route path="resources" element={protectedPage(<Resources />, "npc", "resources")} />
              <Route path="permission" element={<PermissionDenied />} />
              <Route path="loading" element={<Loading />} />
              <Route path="interest" element={protectedPage(<Interest />, "admin", "interest")} />
              <Route path="reset" element={protectedPage(<Reset />, "admin", "reset")} />
              <Route path="bank" element={protectedPage(<Bank />, "admin", "banktransfer")} />
              <Route path="broadcast" element={protectedPage(<Broadcast />, "admin", "broadcast")} />
              <Route path="setdice" element={protectedPage(<SetDice />, "npc")} />
              <Route path="map" element={protectedPage(<Map />)} />
              <Route path="setresources" element={protectedPage(<SetResources />, "admin", "setresources")} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
        <Footer />
      </RoleContext.Provider>
    </ThemeProvider>
    // </SocketContext.Provider>
  );
};

const Root = () => <BrowserRouter><App /></BrowserRouter>; // prettier-ignore

export default Root;
