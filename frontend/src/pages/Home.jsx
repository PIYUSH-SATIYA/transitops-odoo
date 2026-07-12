import { User, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="min-h-[calc(100vh-70px)] bg-[#f8fafc]">
      <div className="flex min-h-[650px] items-center px-12">
        <div className="max-w-2xl">

          {/* Heading */}
          <h1 className="text-5xl font-bold leading-[1.15] text-[#10233f]">
            Simplify Transport.
            <br />
            Optimize{" "}
            <span className="text-[#10bfa8]">
              Operations.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-lg leading-7 text-slate-500">
            TransitOps helps transport and logistics teams manage drivers,
            trips, maintenance and expenses in one centralized platform.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex items-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-md bg-[#10bfa8] px-9 py-3 text-sm font-medium text-white transition hover:bg-[#0da892]"
            >
              <User size={18} />
              Login
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-3 rounded-md border border-[#10bfa8] bg-white px-8 py-3 text-sm font-medium text-[#10bfa8] transition hover:bg-[#f0fdfa]"
            >
              <UserPlus size={18} />
              Register
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Home;