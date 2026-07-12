import React, { useState, useEffect } from 'react';
import { Fuel, Receipt, Plus, X, LoaderCircle, DollarSign, Car, Calendar, Navigation } from 'lucide-react';

const Expenses = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [generalExpenses, setGeneralExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [fuelForm, setFuelForm] = useState({
    vehicle_id: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    vehicle_id: '',
    trip_id: '',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Determine user role for RBAC
  let userRole = localStorage.getItem('role') || '';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role) userRole = user.role;
    }
  } catch (e) {}

  // If no role is set yet (during hackathon testing), default to allowing it, 
  // or strictly enforce it. We will strictly enforce it, but fallback to Fleet Manager if completely empty 
  // to avoid blocking the demo if auth isn't wired.
  const effectiveRole = userRole || 'Fleet Manager'; 
  const canAddExpense = effectiveRole === 'Fleet Manager' || effectiveRole === 'Driver';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuelRes, generalRes, vehiclesRes, tripsRes, kpiRes] = await Promise.all([
        fetch('/api/expenses/fuel', { headers: getHeaders() }),
        fetch('/api/expenses/general', { headers: getHeaders() }),
        fetch('/api/vehicles', { headers: getHeaders() }),
        fetch('/api/trips', { headers: getHeaders() }),
        fetch('/api/dashboard/kpis', { headers: getHeaders() })
      ]);

      if (fuelRes.ok) setFuelLogs(await fuelRes.json());
      if (generalRes.ok) setGeneralExpenses(await generalRes.json());
      if (vehiclesRes.ok) {
        const vData = await vehiclesRes.json();
        setVehicles(Array.isArray(vData) ? vData : vData.vehicles || []);
      }
      if (tripsRes.ok) {
        const tData = await tripsRes.json();
        setTrips(Array.isArray(tData) ? tData : tData.trips || []);
      }
      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setTotalCost(kpiData.financialMetrics?.totalOperationalCost || 0);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFuelChange = (e) => {
    const { name, value } = e.target;
    setFuelForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setExpenseForm(prev => ({ ...prev, [name]: value }));
  };

  const submitFuel = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/expenses/fuel', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          vehicle_id: fuelForm.vehicle_id,
          liters: Number(fuelForm.liters),
          cost: Number(fuelForm.cost),
          date: fuelForm.date
        })
      });

      if (res.ok) {
        setShowFuelModal(false);
        setFuelForm({
          vehicle_id: '', liters: '', cost: '', date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to log fuel. Make sure you have permission.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Trip ID is optional
    const payload = {
      vehicle_id: expenseForm.vehicle_id,
      description: expenseForm.description,
      cost: Number(expenseForm.cost),
      date: expenseForm.date
    };
    if (expenseForm.trip_id) {
      payload.trip_id = expenseForm.trip_id;
    }

    try {
      const res = await fetch('/api/expenses/general', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseForm({
          vehicle_id: '', trip_id: '', description: '', cost: '', date: new Date().toISOString().split('T')[0]
        });
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add expense. Make sure you have permission.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id);
    return v ? v.registration_number : id;
  };

  const getTripName = (id) => {
    const t = trips.find(t => t.id === id);
    return t ? `#${t.id.substring(0,6)}` : '-';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#10233f]">Fuel & Expense Management</h1>
          <p className="text-slate-500 mt-1">Track fleet operational costs and toll expenses.</p>
        </div>
        
        {canAddExpense && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFuelModal(true)}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 shadow-sm"
            >
              <Fuel size={18} />
              Log Fuel
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#10bfa8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0da892] shadow-sm"
            >
              <Receipt size={18} />
              Add Expense
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10bfa8] border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Fuel Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Fuel className="text-orange-500 w-5 h-5" />
              <h2 className="text-lg font-semibold text-[#10233f]">Fuel Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Liters</th>
                    <th className="px-6 py-4 font-semibold">Cost (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fuelLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No fuel logs found.</td>
                    </tr>
                  ) : (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-[#10233f]">{getVehicleName(log.vehicle_id)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{log.liters} L</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">₹{Number(log.cost).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Receipt className="text-[#10bfa8] w-5 h-5" />
              <h2 className="text-lg font-semibold text-[#10233f]">Other Expenses (Toll / Misc)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-semibold">Trip ID</th>
                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generalExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No general expenses found.</td>
                    </tr>
                  ) : (
                    generalExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{getTripName(exp.trip_id)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#10233f]">{getVehicleName(exp.vehicle_id)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{exp.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">₹{Number(exp.cost).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* KPI Footer block */}
          <div className="bg-[#10233f] rounded-xl shadow-lg border border-[#10233f] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6">
            <div className="flex items-center gap-3 text-white/80">
              <DollarSign className="w-6 h-6 text-[#10bfa8]" />
              <span className="text-lg font-medium tracking-wide uppercase">Total Operational Cost (Auto)</span>
              <span className="text-sm opacity-70 ml-2 hidden md:inline">= Fuel + Maintenance + General</span>
            </div>
            <div className="text-3xl font-bold text-orange-400 mt-4 md:mt-0 tracking-tight">
              ₹{Number(totalCost).toLocaleString()}
            </div>
          </div>

        </div>
      )}

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-[#10233f] flex items-center gap-2">
                <Fuel className="w-5 h-5 text-orange-500" />
                Log Fuel
              </h3>
              <button onClick={() => setShowFuelModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitFuel} className="p-6 space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                <select required name="vehicle_id" value={fuelForm.vehicle_id} onChange={handleFuelChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1">
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.name})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Liters</label>
                  <input required type="number" min="0.1" step="0.1" name="liters" value={fuelForm.liters} onChange={handleFuelChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹)</label>
                  <input required type="number" min="1" name="cost" value={fuelForm.cost} onChange={handleFuelChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" name="date" value={fuelForm.date} onChange={handleFuelChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50">
                  {submitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : 'Save Fuel Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-[#10233f] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#10bfa8]" />
                Add Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={submitExpense} className="p-6 space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                <select required name="vehicle_id" value={expenseForm.vehicle_id} onChange={handleExpenseChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1">
                  <option value="">Select a vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.name})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                  <span>Linked Trip</span>
                  <span className="text-xs text-slate-400 font-normal">Optional</span>
                </label>
                <select name="trip_id" value={expenseForm.trip_id} onChange={handleExpenseChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1">
                  <option value="">No Trip Selected</option>
                  {trips.map(t => <option key={t.id} value={t.id}>#{t.id.substring(0,8)} - {t.source} to {t.destination}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input required type="text" placeholder="e.g. Toll booth, Parking" name="description" value={expenseForm.description} onChange={handleExpenseChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹)</label>
                  <input required type="number" min="1" name="cost" value={expenseForm.cost} onChange={handleExpenseChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" name="date" value={expenseForm.date} onChange={handleExpenseChange} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10bfa8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0da892] disabled:opacity-50">
                  {submitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Expenses;
