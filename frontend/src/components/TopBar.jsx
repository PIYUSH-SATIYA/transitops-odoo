import { Bell, UserCircle } from "lucide-react";

const TopBar = () => {
  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-end px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700 transition">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center gap-2 border-l pl-4 ml-2">
          <div className="text-right hidden md:block">
            <div className="text-sm font-medium text-gray-800">Fleet Manager</div>
            <div className="text-xs text-gray-500">Admin Role</div>
          </div>
          <UserCircle size={32} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
