// import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import Dashboard from "./app/pages/designation/Dashboard";
// import DesignationActivityBoard from "./app/pages/designation/designation-activity-board";
// import Login from "./app/pages/designation/Login";

// const App = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/" element={<Navigate to="/designation" replace />} />

//         <Route path="/designation" element={<DesignationActivityBoard />} />

//         <Route path="/dashboard" element={<Dashboard />} />

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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Main Activity Board */}
        <Route path="/designation" element={<DesignationActivityBoard />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/designation" replace />} />

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/designation" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;