import { Navigate, Outlet } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  return token ? children : <Navigate to="/sign-in" replace />;
};

export default PrivateRoute;
