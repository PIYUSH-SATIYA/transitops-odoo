import { Bell, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const TopBar = () => {
  const location = useLocation();

  const pageNames = {
    "/app": "Dashboard",
    "/app/vehicles": "Vehicles",
    "/app/drivers": "Drivers",
    "/app/trips": "Trips",
    "/app/maintenance": "Maintenance",
    "/app/expenses": "Expenses",
  };

  const pageName = pageNames[location.pathname] || "TransitOps";

  // baad me backend / context se lena
  const user = {
    name: "Prayag",
    role: "Fleet Manager",
  };

  return (
    <header className="flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-6">
      
      {/* Current Page Name */}
      <div>
        <h1 className="text-xl font-semibold text-[#10233f]">
          {pageName}
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">
        
        {/* Notification */}
        <button className="relative text-slate-400 transition hover:text-[#10bfa8]">
          <Bell size={21} />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <UserCircle
            size={36}
            className="text-[#10bfa8]"
          />

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-[#10233f]">
              {user.name}
            </p>

            <p className="text-xs text-slate-400">
              {user.role}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;