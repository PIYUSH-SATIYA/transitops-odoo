import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;