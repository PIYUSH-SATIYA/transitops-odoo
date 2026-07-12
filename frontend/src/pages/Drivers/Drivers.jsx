import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import axios from "axios";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    license_category: "LMV",
    license_expiry_date: "",
    contact_number: "",
    safety_score: "100",
    status: "Available",
  });

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    return {
      Authorization: `Bearer ${getToken()}`,
    };
  };

  // =========================
  // API FUNCTIONS
  // =========================

  const fetchDrivers = async () => {
    const response = await axios.get("/api/drivers", {
      headers: getHeaders(),
    });

    return response.data;
  };

  const createDriver = async (driverData) => {
    const response = await axios.post(
      "/api/drivers",
      driverData,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  };

  const updateDriver = async (id, driverData) => {
    const response = await axios.put(
      `/api/drivers/${id}`,
      driverData,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  };

  // =========================
  // FETCH DRIVERS
  // =========================

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchDrivers();

      setDrivers(data);
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to load drivers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      license_number: "",
      license_category: "LMV",
      license_expiry_date: "",
      contact_number: "",
      safety_score: "100",
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
    setSuccess("");

    if (
      !formData.name ||
      !formData.license_number ||
      !formData.license_category ||
      !formData.license_expiry_date
    ) {
      setError("Please fill all required fields.");

      return;
    }

    try {
      setCreating(true);

      const driverData = {
        name: formData.name,

        license_number:
          formData.license_number.toUpperCase(),

        license_category: formData.license_category,

        license_expiry_date:
          formData.license_expiry_date,

        contact_number: formData.contact_number,

        safety_score: Number(formData.safety_score),

        status: formData.status,
      };

      await createDriver(driverData);

      closeModal();

      setSuccess("Driver registered successfully.");

      await loadDrivers();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to register driver."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // UPDATE STATUS
  // =========================

  const handleStatusChange = async (driver, status) => {
    try {
      setUpdatingId(driver.id);

      setError("");
      setSuccess("");

      await updateDriver(driver.id, {
        status,
      });

      setSuccess(
        `${driver.name} status changed to ${status}.`
      );

      await loadDrivers();
    } catch (error) {
      console.log(error);

      setError(
        error.response?.data?.message ||
          "Failed to update driver status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // LICENSE
  // =========================

  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);

    const today = new Date();

    expiry.setHours(23, 59, 59, 999);

    return expiry < today;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN");
  };

  // =========================
  // FILTER
  // =========================

  const filteredDrivers = drivers.filter((driver) => {
    const searchValue = search.toLowerCase();

    const searchMatch =
      driver.name
        ?.toLowerCase()
        .includes(searchValue) ||
      driver.license_number
        ?.toLowerCase()
        .includes(searchValue) ||
      driver.contact_number
        ?.toLowerCase()
        .includes(searchValue);

    const statusMatch =
      statusFilter === "All" ||
      driver.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700";

      case "On Trip":
        return "bg-blue-100 text-blue-700";

      case "Off Duty":
        return "bg-slate-200 text-slate-600";

      case "Suspended":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getSafetyStyle = (score) => {
    if (score >= 90) {
      return "text-emerald-600";
    }

    if (score >= 70) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  return (
    <>
      <div className="w-full">
        {/* ALERT */}

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

        {/* FILTERS */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search driver..."
                className="w-72 rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-600 outline-none transition placeholder:text-slate-400 focus:border-[#10bfa8]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-48 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-[#10bfa8]"
            >
              <option value="All">
                Status: All
              </option>

              <option value="Available">
                Available
              </option>

              <option value="On Trip">
                On Trip
              </option>

              <option value="Off Duty">
                Off Duty
              </option>

              <option value="Suspended">
                Suspended
              </option>
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#10bfa8] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0da892]"
          >
            <Plus size={18} />

            Add Driver
          </button>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-semibold">
                    Driver
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    License No.
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Expiry
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Contact
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Safety
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

                        Loading drivers...
                      </div>
                    </td>
                  </tr>
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center text-sm text-slate-500"
                    >
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => {
                    const expired = isLicenseExpired(
                      driver.license_expiry_date
                    );

                    return (
                      <tr
                        key={driver.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-5">
                          <div className="text-sm font-semibold text-[#10233f]">
                            {driver.name}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {driver.license_number}
                        </td>

                        <td className="px-5 py-5">
                          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {driver.license_category}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                expired
                                  ? "font-semibold text-red-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {formatDate(
                                driver.license_expiry_date
                              )}
                            </span>

                            {expired && (
                              <span className="rounded bg-red-100 px-2 py-1 text-[10px] font-bold text-red-600">
                                EXPIRED
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-500">
                          {driver.contact_number || "-"}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <ShieldCheck
                              size={17}
                              className={getSafetyStyle(
                                driver.safety_score
                              )}
                            />

                            <span
                              className={`text-sm font-semibold ${getSafetyStyle(
                                driver.safety_score
                              )}`}
                            >
                              {driver.safety_score}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          {updatingId === driver.id ? (
                            <LoaderCircle
                              size={19}
                              className="animate-spin text-[#10bfa8]"
                            />
                          ) : (
                            <select
                              value={driver.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  driver,
                                  e.target.value
                                )
                              }
                              className={`min-w-32 cursor-pointer rounded-full border-none px-4 py-2 text-xs font-semibold outline-none ${getStatusStyle(
                                driver.status
                              )}`}
                            >
                              <option value="Available">
                                Available
                              </option>

                              <option value="On Trip">
                                On Trip
                              </option>

                              <option value="Off Duty">
                                Off Duty
                              </option>

                              <option value="Suspended">
                                Suspended
                              </option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BUSINESS RULE */}

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">
              Business Rule:
            </span>{" "}
            Drivers with expired licenses or Suspended status
            cannot be assigned to trips. Drivers already On Trip
            cannot be assigned to another trip.
          </p>
        </div>
      </div>

      {/* ADD DRIVER MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-5">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#10233f]">
                  Add Driver
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Register a new driver in TransitOps.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Driver Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                {/* LICENSE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    License Number
                  </label>

                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="DL-88213"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-[#10bfa8]"
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    License Category
                  </label>

                  <select
                    name="license_category"
                    value={formData.license_category}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  >
                    <option value="LMV">LMV</option>

                    <option value="HMV">HMV</option>

                    <option value="MCWG">MCWG</option>

                    <option value="Transport">
                      Transport
                    </option>
                  </select>
                </div>

                {/* EXPIRY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    License Expiry Date
                  </label>

                  <input
                    type="date"
                    name="license_expiry_date"
                    value={formData.license_expiry_date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                {/* CONTACT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Contact Number
                  </label>

                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                {/* SAFETY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Safety Score
                  </label>

                  <input
                    type="number"
                    name="safety_score"
                    value={formData.safety_score}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  />
                </div>

                {/* STATUS */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[#10233f]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#10bfa8]"
                  >
                    <option value="Available">
                      Available
                    </option>

                    <option value="Off Duty">
                      Off Duty
                    </option>

                    <option value="Suspended">
                      Suspended
                    </option>
                  </select>
                </div>
              </div>

              {/* ACTION */}

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

                      Add Driver
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

export default Drivers;