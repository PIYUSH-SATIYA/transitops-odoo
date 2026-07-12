import {
  ArrowRight,
  CheckCircle2,
  Truck,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      
      {/* Background Decoration */}
      <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-[#10bfa8]/10 blur-3xl" />

      <div className="absolute -right-32 top-10 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* Hero Content */}
      <div className="relative mx-auto flex min-h-screen max-w-[1450px] items-center px-6 py-20 md:px-12 lg:px-20">
        
        <div className="max-w-4xl">
          
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#10bfa8]/20 bg-[#10bfa8]/10 px-4 py-2 text-sm font-medium text-[#0da892]">
            <Truck size={16} />

            Smart Transport Operations Platform
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-[#10233f] md:text-6xl lg:text-7xl">
            Simplify Transport.
            <br />

            Optimize{" "}
            <span className="text-[#10bfa8]">
              Operations.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-500">
            Manage your vehicles, drivers, trips, maintenance and operational
            expenses from one powerful centralized transport platform.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-lg bg-[#10bfa8] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10bfa8]/20 transition duration-300 hover:-translate-y-1 hover:bg-[#0da892]"
            >
              Get Started

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-8 py-3.5 text-sm font-semibold text-[#10233f] transition duration-300 hover:border-[#10bfa8] hover:text-[#10bfa8]"
            >
              <Users size={18} />

              Create Account
            </Link>
          </div>

          {/* Features */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500">
            
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-[#10bfa8]"
              />

              Fleet Management
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-[#10bfa8]"
              />

              Smart Dispatch
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2
                size={18}
                className="text-[#10bfa8]"
              />

              Real-time Insights
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Home;