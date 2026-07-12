import { Link } from "react-router-dom";
import { LayoutDashboard, Car, Users, Route, Wrench, Receipt, LogOut } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#10233f] text-white flex flex-col min-h-screen">
      <div className="h-[70px] flex items-center px-6 border-b border-gray-700">
        <div className="text-2xl font-bold">
          Transit<span className="text-[#10bfa8]">Ops</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <Link to="/app" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <LayoutDashboard size={20} className="text-[#10bfa8]" />
          Dashboard
        </Link>
        <Link to="/app/vehicles" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <Car size={20} className="text-[#10bfa8]" />
          Vehicles
        </Link>
        <Link to="/app/drivers" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <Users size={20} className="text-[#10bfa8]" />
          Drivers
        </Link>
        <Link to="/app/trips" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <Route size={20} className="text-[#10bfa8]" />
          Trips
        </Link>
        <Link to="/app/maintenance" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <Wrench size={20} className="text-[#10bfa8]" />
          Maintenance
        </Link>
        <Link to="/app/expenses" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 transition">
          <Receipt size={20} className="text-[#10bfa8]" />
          Expenses
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md hover:bg-gray-800 transition text-left">
          <LogOut size={20} className="text-gray-400" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
