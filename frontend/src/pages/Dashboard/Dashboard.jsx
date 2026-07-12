import React, { useState, useEffect } from 'react';
import { LoaderCircle, AlertCircle, TrendingUp, TrendingDown, Clock, Activity, CheckCircle, Navigation } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [kpis, setKpis] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [kpiRes, tripsRes, vehiclesRes] = await Promise.all([
        fetch('/api/dashboard/kpis', { headers: getHeaders() }),
        fetch('/api/trips', { headers: getHeaders() }),
        fetch('/api/vehicles', { headers: getHeaders() })
      ]);

      if (kpiRes.ok && tripsRes.ok && vehiclesRes.ok) {
        const kpiData = await kpiRes.json();
        const tripsData = await tripsRes.json();
        const vehiclesData = await vehiclesRes.json();

        setKpis(kpiData);
        
        // Ensure array and get top 5 latest trips
        const parsedTrips = Array.isArray(tripsData) ? tripsData : (tripsData.trips || []);
        setRecentTrips(parsedTrips.slice(0, 5));
        
        const parsedVehicles = Array.isArray(vehiclesData) ? vehiclesData : (vehiclesData.vehicles || []);
        setVehicles(parsedVehicles);
      } else {
        // Find which one failed
        if (!kpiRes.ok) throw new Error('Failed to load KPIs');
        if (!tripsRes.ok) throw new Error('Failed to load Trips');
        if (!vehiclesRes.ok) throw new Error('Failed to load Vehicles');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getTripStatusBadge = (status) => {
    switch (status) {
      case 'Draft': return <span className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold">Draft</span>;
      case 'Dispatched': return <span className="px-3 py-1 rounded bg-blue-400 text-white text-xs font-semibold">Dispatched</span>;
      case 'On Trip': return <span className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold">On Trip</span>;
      case 'Completed': return <span className="px-3 py-1 rounded bg-[#6bb721] text-white text-xs font-semibold">Completed</span>;
      case 'Cancelled': return <span className="px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold">Cancelled</span>;
      default: return <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin text-[#19c7bb]" />
      </div>
    );
  }

  // Calculate Vehicle Status Distribution
  const totalVehicles = vehicles.length || 1; // Prevent division by zero
  const availableCount = vehicles.filter(v => v.status === 'Available').length;
  const onTripCount = vehicles.filter(v => v.status === 'On Trip' || v.status === 'Dispatched').length;
  const inShopCount = vehicles.filter(v => v.status === 'In Maintenance').length;
  const retiredCount = vehicles.filter(v => v.status === 'Retired' || v.status === 'Inactive').length;

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#071b4a]">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your fleet and operations</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium">Data Loading Error</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Filters</span>
        <select className="bg-transparent border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-600 focus:outline-none focus:border-[#19c7bb]">
          <option>Vehicle Type: All</option>
          <option>Trucks</option>
          <option>Vans</option>
        </select>
        <select className="bg-transparent border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-600 focus:outline-none focus:border-[#19c7bb]">
          <option>Status: All</option>
          <option>Active</option>
          <option>Maintenance</option>
        </select>
        <select className="bg-transparent border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-600 focus:outline-none focus:border-[#19c7bb]">
          <option>Region: All</option>
          <option>North</option>
          <option>South</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-blue-500 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Vehicles</h3>
          <p className="text-3xl font-bold text-white">{kpis?.vehicleMetrics?.active || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-green-500 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Vehicles</h3>
          <p className="text-3xl font-bold text-white">{kpis?.vehicleMetrics?.available || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-orange-500 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicles in Maintenance</h3>
          <p className="text-3xl font-bold text-white">{kpis?.vehicleMetrics?.inMaintenance || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-blue-400 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Trips</h3>
          <p className="text-3xl font-bold text-white">{kpis?.tripMetrics?.active || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-slate-500 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Pending Trips</h3>
          <p className="text-3xl font-bold text-white">{kpis?.tripMetrics?.pending || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-slate-400 shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Drivers on Duty</h3>
          <p className="text-3xl font-bold text-white">{kpis?.driverMetrics?.onDuty || 0}</p>
        </div>
        <div className="bg-[#111827] rounded-xl p-5 border-t-4 border-[#19c7bb] shadow-sm flex flex-col justify-between">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Fleet Utilization</h3>
          <p className="text-3xl font-bold text-white">{(kpis?.vehicleMetrics?.fleetUtilizationPercentage || 0)}%</p>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT TRIPS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-semibold text-[#071b4a] uppercase tracking-wider">Recent Trips</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">Trip</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTrips.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No recent trips found.
                      </td>
                    </tr>
                  ) : (
                    recentTrips.map(trip => (
                      <tr key={trip.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-[#071b4a]">TR{trip.id.substring(0, 5).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{trip.vehicle?.name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{trip.driver?.name || '—'}</td>
                        <td className="px-6 py-4">{getTripStatusBadge(trip.status)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {trip.status === 'Completed' ? '—' : (trip.status === 'Draft' ? 'Awaiting dispatch' : 'In Transit')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* VEHICLE STATUS */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827] rounded-xl shadow-sm p-6 h-full">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-8">Vehicle Status</h2>
            
            <div className="space-y-6">
              {/* Available */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Available</span>
                  <span className="text-white font-medium">{availableCount}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(availableCount / totalVehicles) * 100}%` }}></div>
                </div>
              </div>

              {/* On Trip */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">On Trip</span>
                  <span className="text-white font-medium">{onTripCount}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(onTripCount / totalVehicles) * 100}%` }}></div>
                </div>
              </div>

              {/* In Shop */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">In Shop</span>
                  <span className="text-white font-medium">{inShopCount}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(inShopCount / totalVehicles) * 100}%` }}></div>
                </div>
              </div>

              {/* Retired */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Retired</span>
                  <span className="text-white font-medium">{retiredCount}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{ width: `${(retiredCount / totalVehicles) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
