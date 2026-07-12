import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// App Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Vehicles from "./pages/Vehicles/Vehicles";
import Drivers from "./pages/Drivers/Drivers";
import Trips from "./pages/Trips/Trips";
import Maintenance from "./pages/Maintenance/Maintenance";
import Expenses from "./pages/Expenses/Expenses";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* Auth routes without MainLayout (no navbar/footer for cleaner auth pages) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="trips" element={<Trips />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="expenses" element={<Expenses />} />
      </Route>
    </>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;