import { Navigate, Outlet } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  console.log("Role: " + role);

  return token ? children : <Navigate to="auth/sign-in" replace />;
};

export default PrivateRoute;

// import { Navigate, Outlet } from "react-router-dom";

// // eslint-disable-next-line react/prop-types
// const PrivateRoute = ({ allowedRoles }) => {
//   const token = sessionStorage.getItem("token");
//   const role = sessionStorage.getItem("role");

//   if (!token) {
//     return <Navigate to="/auth/sign-in" replace />;
//   }

//   // eslint-disable-next-line react/prop-types
//   if (!allowedRoles.includes(role)) {
//     return <Navigate to="/auth/sign-in" replace />;
//   }

//   return <Outlet />;
// };

// export default PrivateRoute;
