import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import RoleContext from "./useRole";

const hasAccess = (roleId, access) => {
  if (access === "admin") return roleId === 100;
  if (access === "npc") return roleId === 50 || roleId === 100;
  if (access === "team") return roleId >= 1 && roleId <= 9;
  return roleId > 0;
};

const RequireRole = ({ access = "authenticated", children }) => {
  const { roleId } = useContext(RoleContext);

  if (!roleId) return <Navigate to="/login" replace />;
  if (!hasAccess(roleId, access)) {
    return <Navigate to="/permission" replace />;
  }

  return children;
};

export default RequireRole;
