const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-5">
        
        {/* Logo */}
        <div className="text-xl font-bold text-[#10233f]">
          Transit<span className="text-[#10bfa8]">Ops</span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © 2026 TransitOps. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-[#10bfa8]">
            Privacy
          </a>

          <a href="#" className="hover:text-[#10bfa8]">
            Terms
          </a>

          <a href="#contact" className="hover:text-[#10bfa8]">
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;