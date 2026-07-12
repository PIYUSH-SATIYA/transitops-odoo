import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { LoaderCircle } from 'lucide-react';

const Analytics = () => {
  const [kpis, setKpis] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [costData, setCostData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const processMonthlyRevenue = (trips) => {
    const completedTrips = trips.filter(t => t.status === 'Completed' && t.revenue);
    const monthlyMap = {};

    completedTrips.forEach(trip => {
      // Use created_at or fallback to current date if missing for some reason
      const dateStr = trip.created_at || new Date().toISOString();
      const date = new Date(dateStr);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { name: month, rawDate: date, revenue: 0 };
      }
      monthlyMap[key].revenue += Number(trip.revenue);
    });

    return Object.values(monthlyMap)
      .sort((a, b) => a.rawDate - b.rawDate)
      .slice(-6); // Last 6 months
  };

  const processCostliestVehicles = (vehicles, fuelLogs, generalExpenses, maintenanceLogs) => {
    const costMap = {};

    // Initialize all vehicles
    vehicles.forEach(v => {
      costMap[v.id] = { name: v.registration_number, cost: 0 };
    });

    // Add fuel costs
    fuelLogs.forEach(log => {
      if (costMap[log.vehicle_id]) {
        costMap[log.vehicle_id].cost += Number(log.cost);
      }
    });

    // Add general expenses
    generalExpenses.forEach(exp => {
      if (costMap[exp.vehicle_id]) {
        costMap[exp.vehicle_id].cost += Number(exp.cost);
      }
    });

    // Add maintenance costs
    maintenanceLogs.forEach(m => {
      if (costMap[m.vehicle_id]) {
        costMap[m.vehicle_id].cost += Number(m.cost);
      }
    });

    return Object.values(costMap)
      .filter(item => item.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5); // Top 5 costliest
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        kpiRes, tripsRes, vehiclesRes, 
        fuelRes, generalRes, maintenanceRes
      ] = await Promise.all([
        fetch('/api/dashboard/kpis', { headers: getHeaders() }),
        fetch('/api/trips', { headers: getHeaders() }),
        fetch('/api/vehicles', { headers: getHeaders() }),
        fetch('/api/expenses/fuel', { headers: getHeaders() }),
        fetch('/api/expenses/general', { headers: getHeaders() }),
        fetch('/api/maintenance', { headers: getHeaders() })
      ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
      
      const tripsData = tripsRes.ok ? await tripsRes.json() : [];
      const trips = Array.isArray(tripsData) ? tripsData : tripsData.trips || [];
      
      const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : [];
      const vehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.vehicles || [];

      const fuelLogs = fuelRes.ok ? await fuelRes.json() : [];
      const generalExpenses = generalRes.ok ? await generalRes.json() : [];
      const maintenanceLogs = maintenanceRes.ok ? await maintenanceRes.json() : [];

      setRevenueData(processMonthlyRevenue(trips));
      setCostData(processCostliestVehicles(vehicles, fuelLogs, generalExpenses, maintenanceLogs));

    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#10bfa8]">
          <LoaderCircle className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  // Safely extract KPIs
  const fuelEff = kpis?.financialMetrics?.fuelEfficiencyKmPerLiter || "0.0";
  const utilization = kpis?.vehicleMetrics?.fleetUtilizationPercentage || "0";
  const opCost = kpis?.financialMetrics?.totalOperationalCost || 0;
  
  // Format ROI to percentage
  const roiRaw = Number(kpis?.financialMetrics?.fleetROI || 0);
  const roiPct = (roiRaw * 100).toFixed(1);

  // Colors for the horizontal bar chart
  const costColors = ['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10233f]">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">Deep dive into fleet performance and financial health.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#10233f] rounded-xl shadow-lg border-l-4 border-blue-400 p-6 flex flex-col justify-between">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">Fuel Efficiency</p>
          <h3 className="text-white text-3xl font-bold">{fuelEff} <span className="text-lg font-medium text-slate-400">km/l</span></h3>
        </div>

        <div className="bg-[#10233f] rounded-xl shadow-lg border-l-4 border-[#10bfa8] p-6 flex flex-col justify-between">
          <p className="text-[#10bfa8] text-xs font-semibold uppercase tracking-wider mb-2">Fleet Utilization</p>
          <h3 className="text-white text-3xl font-bold">{utilization}%</h3>
        </div>

        <div className="bg-[#10233f] rounded-xl shadow-lg border-l-4 border-orange-400 p-6 flex flex-col justify-between">
          <p className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2">Operational Cost</p>
          <h3 className="text-white text-3xl font-bold">{formatCurrency(opCost)}</h3>
        </div>

        <div className="bg-[#10233f] rounded-xl shadow-lg border-l-4 border-emerald-400 p-6 flex flex-col justify-between">
          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">Vehicle ROI</p>
          <h3 className="text-white text-3xl font-bold">{roiPct}%</h3>
        </div>

      </div>

      <p className="text-xs text-slate-400 font-mono italic">
        ROI = (Revenue - (Maintenance + Fuel + General)) / Acquisition Cost
      </p>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-[#10233f] uppercase tracking-wider mb-6">Monthly Revenue</h3>
          <div className="h-72 w-full">
            {revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No revenue data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}} 
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Costliest Vehicles Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-[#10233f] uppercase tracking-wider mb-6">Top Costliest Vehicles</h3>
          <div className="h-72 w-full">
            {costData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No expense data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis 
                    type="number" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 12}}
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#10233f', fontSize: 12, fontWeight: 500}}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [formatCurrency(value), 'Total Cost']}
                  />
                  <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={24}>
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={costColors[index % costColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
