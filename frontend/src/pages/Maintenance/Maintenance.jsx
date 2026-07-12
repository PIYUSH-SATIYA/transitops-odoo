import { useEffect, useState } from "react";
import {
  LoaderCircle,
  Plus,
  Search,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const Maintenance = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [closingId, setClosingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    vehicle_id: "",
    description: "",
    cost: "",
    date: "",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${getToken()}`,
    };
  };

  const fetchMaintenanceLogs = async () => {
    const response = await axios.get("/api/maintenance", {
      headers: getHeaders(),
    });

    return response.data;
  };

  const fetchVehicles = async () => {
    const response = await axios.get("/api/vehicles", {
      headers: getHeaders(),
    });

    return response.data;
  };

  const createMaintenance = async (maintenanceData) => {
    const response = await axios.post(
      "/api/maintenance",
      maintenanceData,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  };

  const closeMaintenance = async (id) => {
    const response = await axios.put(
      `/api/maintenance/${id}/close`,
      {},
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [maintenanceData, vehicleData] = await Promise.all([
        fetchMaintenanceLogs(),
        fetchVehicles(),
      ]);

      setMaintenanceLogs(maintenanceData);
      setVehicles(vehicleData);
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to load maintenance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      vehicle_id: "",
      description: "",
      cost: "",
      date: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.vehicle_id ||
      !formData.description ||
      !formData.cost
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setCreating(true);

      const maintenanceData = {
        vehicle_id: formData.vehicle_id,
        description: formData.description,
        cost: Number(formData.cost),
      };

      if (formData.date) {
        maintenanceData.date = formData.date;
      }

      await createMaintenance(maintenanceData);

      setSuccess("Maintenance record created successfully.");

      resetForm();

      await loadData();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to create maintenance record."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCloseMaintenance = async (id) => {
    try {
      setClosingId(id);
      setError("");
      setSuccess("");

      await closeMaintenance(id);

      setSuccess("Maintenance closed successfully.");

      await loadData();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to close maintenance."
      );
    } finally {
      setClosingId(null);
    }
  };

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.status !== "On Trip" &&
      vehicle.status !== "Retired" &&
      vehicle.status !== "In Shop"
  );

  const filteredLogs = maintenanceLogs.filter((log) => {
    const vehicleName =
      log.vehicle?.name ||
      log.vehicles?.name ||
      "";

    const registrationNumber =
      log.vehicle?.registration_number ||
      log.vehicles?.registration_number ||
      "";

    const searchValue = search.toLowerCase();

    const searchMatch =
      vehicleName.toLowerCase().includes(searchValue) ||
      registrationNumber.toLowerCase().includes(searchValue) ||
      log.description
        ?.toLowerCase()
        .includes(searchValue);

    const statusMatch =
      statusFilter === "All" ||
      log.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const getVehicleName = (log) => {
    return (
      log.vehicle?.name ||
      log.vehicles?.name ||
      "Unknown Vehicle"
    );
  };

  const getRegistrationNumber = (log) => {
    return (
      log.vehicle?.registration_number ||
      log.vehicles?.registration_number ||
      ""
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return "bg-amber-100 text-amber-700";

      case "Closed":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="w-full">
      {(error || success) && (
        <div className="mb-6">
          {error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={18} />

              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 size={18} />

              {success}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#10bfa8]/10 text-[#10bfa8]">
                <Wrench size={20} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#10233f]">
                  Log Service Record
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Send a vehicle to maintenance.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10233f]">
                  Vehicle
                </label>

                <select
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#10bfa8]"
                >
                  <option value="">Select vehicle</option>

                  {availableVehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                    >
                      {vehicle.name} -{" "}
                      {vehicle.registration_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#10233f]">
                  Service Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Oil Change"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#10bfa8]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#10233f]">
                  Cost
                </label>

                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="2500"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#10bfa8]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#10233f]">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#10bfa8]"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#10bfa8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0da892] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={18} />

                    Save Maintenance
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-emerald-600">
                  Available
                </span>

                <span className="text-slate-400">→</span>

                <span className="font-medium text-amber-600">
                  In Shop
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-amber-600">
                  In Shop
                </span>

                <span className="text-slate-400">→</span>

                <span className="font-medium text-emerald-600">
                  Available
                </span>
              </div>

              <p className="pt-2 text-xs leading-5 text-amber-600">
                In Shop vehicles are automatically removed from the
                dispatch pool.
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#10233f]">
                Service Log
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor active and completed maintenance records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search service..."
                  className="w-56 rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#10bfa8]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-[#10bfa8]"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4 font-semibold">
                      Vehicle
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Service
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Date
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Cost
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-16">
                        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                          <LoaderCircle
                            size={21}
                            className="animate-spin text-[#10bfa8]"
                          />

                          Loading maintenance records...
                        </div>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-16 text-center text-sm text-slate-500"
                      >
                        No maintenance records found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="text-sm font-semibold text-[#10233f]">
                            {getVehicleName(log)}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {getRegistrationNumber(log)}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {log.description}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {log.date
                            ? new Date(log.date).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>

                        <td className="px-5 py-5 text-sm font-medium text-slate-600">
                          ₹
                          {Number(log.cost).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex min-w-20 justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                              log.status
                            )}`}
                          >
                            {log.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          {log.status === "Active" ? (
                            <button
                              onClick={() =>
                                handleCloseMaintenance(log.id)
                              }
                              disabled={closingId === log.id}
                              className="flex items-center gap-2 rounded-lg border border-[#10bfa8] px-3 py-2 text-xs font-semibold text-[#10bfa8] transition hover:bg-[#10bfa8] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {closingId === log.id ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}

                              Close
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;