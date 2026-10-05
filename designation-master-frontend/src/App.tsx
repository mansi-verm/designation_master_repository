// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// import Dashboard from "./app/pages/designation/Dashboard";
// import DesignationActivityBoard from "./app/pages/designation/designation-activity-board";
// import Login from "./app/pages/designation/Login";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Login Page */}
//         <Route path="/login" element={<Login />} />

//         {/* Main Activity Board */}
//         <Route path="/designation" element={<DesignationActivityBoard />} />

//         {/* Dashboard */}
//         <Route path="/dashboard" element={<Dashboard />} />

//         {/* Default */}
//         <Route path="/" element={<Navigate to="/designation" replace />} />

//         {/* Unknown URL */}
//         <Route path="*" element={<Navigate to="/designation" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./app/pages/designation/Dashboard";
import DesignationActivityBoard from "./app/pages/designation/designation-activity-board";
import Login from "./app/pages/designation/Login";

import { isAuthenticated } from "./auth/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/designation" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login - only for unauthenticated users */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Main Activity Board - protected */}
        <Route
          path="/designation"
          element={
            <ProtectedRoute>
              <DesignationActivityBoard />
            </ProtectedRoute>
          }
        />

        {/* Dashboard - protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Root */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated() ? "/designation" : "/login"}
              replace
            />
          }
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? "/designation" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;