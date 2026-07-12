import { useEffect, useState } from "react";
import { Plus, Search, X, LoaderCircle } from "lucide-react";
import axios from "axios";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);

  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    registration_number: "",
    name: "",
    type: "Van",
    max_load_capacity: "",
    odometer: "",
    acquisition_cost: "",
    region: "",
    status: "Available",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchVehicles = async () => {
    const token = getToken();

    const response = await axios.get("/api/vehicles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  const createVehicle = async (vehicleData) => {
    const token = getToken();

    const response = await axios.post(
      "/api/vehicles",
      vehicleData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };

  useEffect(() => {
    const getVehicles = async () => {
      try {
        setLoading(true);

        const data = await fetchVehicles();

        setVehicles(data);
      } catch (error) {
        console.log(error);

        setError(
          error.response?.data?.message ||
            "Failed to fetch vehicles."
        );
      } finally {
        setLoading(false);
      }
    };

    getVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      registration_number: "",
      name: "",
      type: "Van",
      max_load_capacity: "",
      odometer: "",
      acquisition_cost: "",
      region: "",
      status: "Available",
    });

    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.registration_number ||
      !formData.name ||
      !formData.type ||
      !formData.max_load_capacity ||
      !formData.acquisition_cost
    ) {
      setError("Please fill all required fields.");

      return;
    }

    try {
      setCreating(true);

      const vehicleData = {
        registration_number:
          formData.registration_number.toUpperCase(),

        name: formData.name,

        type: formData.type,

        max_load_capacity: Number(
          formData.max_load_capacity
        ),

        odometer: Number(formData.odometer || 0),

        acquisition_cost: Number(
          formData.acquisition_cost
        ),

        region: formData.region,

        status: formData.status,
      };

      const newVehicle = await createVehicle(vehicleData);

      setVehicles((prev) => [newVehicle, ...prev]);

      closeModal();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to create vehicle."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const typeMatch =
      typeFilter === "All" ||
      vehicle.type === typeFilter;

    const statusMatch =
      statusFilter === "All" ||
      vehicle.status === statusFilter;

    const searchMatch =
      vehicle.registration_number
        ?.toLowerCase()
        .includes(search.toLowerCase());

    return typeMatch && statusMatch && searchMatch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700";

      case "On Trip":
        return "bg-blue-100 text-blue-700";

      case "In Shop":
        return "bg-amber-100 text-amber-700";

      case "Retired":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-48 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#10bfa8]"
            >
              <option value="All">Type: All</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#10bfa8]"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reg. no..."
                className="w-72 rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-600 outline-none transition placeholder:text-slate-400 focus:border-[#10bfa8]"
              />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#10bfa8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0da892]"
          >
            <Plus size={18} />

            Add Vehicle
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-semibold">
                    Reg. No.
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Name / Model
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Capacity
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Odometer
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Acq. Cost
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-16">
                      <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                        <LoaderCircle
                          size={21}
                          className="animate-spin text-[#10bfa8]"
                        />

                        Loading vehicles...
                      </div>
                    </td>
                  </tr>
                ) : filteredVehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-sm text-slate-500"
                    >
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-5 text-sm font-semibold text-[#10233f]">
                        {vehicle.registration_number}
                      </td>

                      <td className="px-5 py-5 text-sm font-medium text-slate-700">
                        {vehicle.name}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        {vehicle.type}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        {vehicle.max_load_capacity} kg
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        {Number(
                          vehicle.odometer
                        ).toLocaleString()}{" "}
                        km
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-500">
                        ₹
                        {Number(
                          vehicle.acquisition_cost
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex min-w-24 justify-center rounded-full px-4 py-1.5 text-xs font-semibold ${getStatusStyle(
                            vehicle.status
                          )}`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">
              Business Rule:
            </span>{" "}
            Registration number must be unique. Retired and In
            Shop vehicles are hidden from trip dispatch.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#10233f]">
                  Add Vehicle
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Register a new vehicle in your fleet.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Registration Number
                  </label>

                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="GJ01AB4521"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Vehicle Name / Model
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VAN-05"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Vehicle Type
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Maximum Load Capacity (kg)
                  </label>

                  <input
                    type="number"
                    name="max_load_capacity"
                    value={formData.max_load_capacity}
                    onChange={handleChange}
                    placeholder="500"
                    min="1"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Odometer
                  </label>

                  <input
                    type="number"
                    name="odometer"
                    value={formData.odometer}
                    onChange={handleChange}
                    placeholder="74000"
                    min="0"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Acquisition Cost
                  </label>

                  <input
                    type="number"
                    name="acquisition_cost"
                    value={formData.acquisition_cost}
                    onChange={handleChange}
                    placeholder="620000"
                    min="0"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Region
                  </label>

                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="Gujarat"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex min-w-36 items-center justify-center gap-2 rounded-lg bg-[#10bfa8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0da892] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Add Vehicle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Vehicles;