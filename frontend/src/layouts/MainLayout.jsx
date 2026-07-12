import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;