import { User, UserPlus } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="flex h-[70px] items-center justify-between px-5">
        
        {/* Logo */}
        <div className="text-[28px] font-bold text-[#10233f]">
          Transit<span className="text-[#10bfa8]">Ops</span>
        </div>

        {/* Nav Links
        <div className="flex items-center gap-12 text-[14px] font-medium text-[#10233f]">
          <a href="#features" className="hover:text-[#10bfa8]">
            Features
          </a>

          <a href="#modules" className="hover:text-[#10bfa8]">
            Modules
          </a>

          <a href="#benefits" className="hover:text-[#10bfa8]">
            Benefits
          </a>

          <a href="#about" className="hover:text-[#10bfa8]">
            About Us
          </a>

          <a href="#contact" className="hover:text-[#10bfa8]">
            Contact
          </a>
        </div> */}

        {/* Buttons
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2.5 text-[14px] font-medium text-[#10233f] transition hover:bg-gray-50">
            <User size={17} />
            Login
          </button>

          <button className="flex items-center gap-2 rounded-md bg-[#10bfa8] px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-[#0da892]">
            <UserPlus size={17} />
            Register
          </button>
        </div> */}

      </div>
    </nav>
  );
};

export default Navbar;