import React, { useState, useEffect } from 'react';
import { Save, Check, Minus, Info } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    depotName: 'Gandhinagar Depot GJ4',
    currency: 'INR (₹)',
    distanceUnit: 'Kilometers'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('transitOpsSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch(e) {}
    }
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('transitOpsSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const rbacData = [
    { role: 'Fleet Manager', fleet: 'full', drivers: 'full', trips: 'full', fuelExp: 'full', analytics: 'full' },
    { role: 'Dispatcher', fleet: 'view', drivers: 'none', trips: 'full', fuelExp: 'none', analytics: 'none' },
    { role: 'Safety Officer', fleet: 'none', drivers: 'full', trips: 'view', fuelExp: 'none', analytics: 'none' },
    { role: 'Financial Analyst', fleet: 'view', drivers: 'none', trips: 'none', fuelExp: 'full', analytics: 'full' }
  ];

  const renderIcon = (status) => {
    if (status === 'full') return <Check className="w-5 h-5 text-[#10bfa8] mx-auto" />;
    if (status === 'view') return <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">view</span>;
    return <Minus className="w-5 h-5 text-slate-300 mx-auto" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10233f]">Settings & RBAC</h1>
        <p className="text-slate-500 mt-1">Manage global preferences and view system permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        
        {/* Left Column: General Settings */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-semibold text-[#10233f] uppercase tracking-wider">General</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Depot Name</label>
                <input 
                  type="text" 
                  name="depotName" 
                  value={settings.depotName} 
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <select 
                  name="currency" 
                  value={settings.currency} 
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1"
                >
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Distance Unit</label>
                <select 
                  name="distanceUnit" 
                  value={settings.distanceUnit} 
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1"
                >
                  <option value="Kilometers">Kilometers</option>
                  <option value="Miles">Miles</option>
                </select>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 shadow-sm"
                >
                  {saved ? (
                    <>
                      <Check size={18} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">These local settings are saved to your browser cache. They do not affect other users on the network.</p>
          </div>
        </div>

        {/* Right Column: RBAC Matrix */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-sm font-semibold text-[#10233f] uppercase tracking-wider">Role-Based Access (RBAC)</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead className="bg-white border-b border-slate-100">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 text-left border-r border-slate-50">Role</th>
                    <th className="px-4 py-4">Fleet</th>
                    <th className="px-4 py-4">Drivers</th>
                    <th className="px-4 py-4">Trips</th>
                    <th className="px-4 py-4">Fuel / Exp.</th>
                    <th className="px-4 py-4">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rbacData.map((row) => (
                    <tr key={row.role} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-[#10233f] text-left border-r border-slate-50">{row.role}</td>
                      <td className="px-4 py-4">{renderIcon(row.fleet)}</td>
                      <td className="px-4 py-4">{renderIcon(row.drivers)}</td>
                      <td className="px-4 py-4">{renderIcon(row.trips)}</td>
                      <td className="px-4 py-4">{renderIcon(row.fuelExp)}</td>
                      <td className="px-4 py-4">{renderIcon(row.analytics)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Access Key</h4>
              <div className="flex gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10bfa8]" />
                  <span>Full Access (Create/Edit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">view</span>
                  <span>Read-Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-slate-300" />
                  <span>No Access</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
