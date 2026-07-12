import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Car,
  Users,
  Route,
  Wrench,
  Receipt,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/app",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Vehicles",
      path: "/app/vehicles",
      icon: Car,
    },
    {
      name: "Drivers",
      path: "/app/drivers",
      icon: Users,
    },
    {
      name: "Trips",
      path: "/app/trips",
      icon: Route,
    },
    {
      name: "Maintenance",
      path: "/app/maintenance",
      icon: Wrench,
    },
    {
      name: "Expenses",
      path: "/app/expenses",
      icon: Receipt,
    },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
      
      {/* Logo */}
      <div className="flex h-[70px] items-center border-b border-slate-200 px-6">
        <div className="text-2xl font-bold text-[#10233f]">
          Transit<span className="text-[#10bfa8]">Ops</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-[#10bfa8]/10 text-[#10bfa8]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-[#10233f]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={2}
                      className={
                        isActive
                          ? "text-[#10bfa8]"
                          : "text-slate-400"
                      }
                    />

                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-500">
          <LogOut size={20} />

          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;