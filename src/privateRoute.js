import { Navigate, Outlet } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  console.log("Role:", role);

  if (!token) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // eslint-disable-next-line react/prop-types
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/auth/sign-in" replace />; // Trang cấm truy cập
  }

  return children ? children : <Outlet />;
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
