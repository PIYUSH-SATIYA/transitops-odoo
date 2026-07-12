import React, { useState, useEffect } from 'react';
import { Truck, User, MapPin, Navigation, AlertCircle, CheckCircle, Play, X, CircleStop } from 'lucide-react';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicle_id: '',
    driver_id: '',
    cargo_weight: '',
    planned_distance: ''
  });

  // Modal State for Complete
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingTripId, setCompletingTripId] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');

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
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/trips', { headers: getHeaders() }),
        fetch('/api/vehicles', { headers: getHeaders() }),
        fetch('/api/drivers', { headers: getHeaders() })
      ]);

      if (tripsRes.ok) {
        const tripsData = await tripsRes.json();
        setTrips(tripsData);
      }
      
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        // The API returns { vehicles: [...] } or just [...] ? Let's assume the array.
        // Actually, many times it's directly the array. If it's an object, we'd need to adapt.
        // Let's assume it returns the array directly or a common wrapper. We'll handle both.
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.vehicles || []);
      }

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        setDrivers(Array.isArray(driversData) ? driversData : driversData.drivers || []);
      }
    } catch (err) {
      setError('Failed to load data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => d.status === 'Available');

  // Validation
  const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicle_id);
  const isCapacityExceeded = selectedVehicle && Number(formData.cargo_weight) > selectedVehicle.max_load_capacity;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (isCapacityExceeded) return;

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          source: formData.source,
          destination: formData.destination,
          vehicle_id: formData.vehicle_id,
          driver_id: formData.driver_id,
          cargo_weight: Number(formData.cargo_weight),
          planned_distance: Number(formData.planned_distance)
        })
      });

      if (res.ok) {
        setFormData({
          source: '',
          destination: '',
          vehicle_id: '',
          driver_id: '',
          cargo_weight: '',
          planned_distance: ''
        });
        fetchData(); // Refresh all
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to create trip'}`);
      }
    } catch (err) {
      alert('Error creating trip');
    }
  };

  const handleAction = async (tripId, action, extraPayload = {}) => {
    try {
      const res = await fetch(`/api/trips/${tripId}/${action}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: Object.keys(extraPayload).length > 0 ? JSON.stringify(extraPayload) : undefined
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || `Failed to ${action} trip`}`);
      }
    } catch (err) {
      alert(`Error trying to ${action} trip`);
    }
  };

  const openCompleteModal = (tripId) => {
    setCompletingTripId(tripId);
    setFinalOdometer('');
    setIsCompleteModalOpen(true);
  };

  const submitCompleteTrip = async () => {
    if (!finalOdometer) {
      alert("Final odometer is required");
      return;
    }
    await handleAction(completingTripId, 'complete', { final_odometer: Number(finalOdometer) });
    setIsCompleteModalOpen(false);
    setCompletingTripId(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Dispatched': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-[#10bfa8]/10 text-[#0da892] border-[#10bfa8]/20';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10bfa8] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#10233f]">Trip Dispatcher</h1>
        <p className="text-slate-500 mt-1">Create and manage transport operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-[#10233f] mb-6 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#10bfa8]" />
              Create Trip
            </h2>

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <input
                  required
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="e.g. Gandhinagar Depot"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                <input
                  required
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g. Ahmedabad Hub"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle (Available Only)</label>
                <select
                  required
                  name="vehicle_id"
                  value={formData.vehicle_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8] bg-white"
                >
                  <option value="">Select a vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.registration_number}) - {v.max_load_capacity} kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver (Available Only)</label>
                <select
                  required
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8] bg-white"
                >
                  <option value="">Select a driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.license_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo (kg)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="cargo_weight"
                    value={formData.cargo_weight}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    name="planned_distance"
                    value={formData.planned_distance}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8]"
                  />
                </div>
              </div>

              {selectedVehicle && formData.cargo_weight && isCapacityExceeded && (
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium">Capacity Exceeded</h3>
                    <p className="mt-1 text-sm">
                      Vehicle limit: {selectedVehicle.max_load_capacity} kg.<br/>
                      Exceeded by {Number(formData.cargo_weight) - selectedVehicle.max_load_capacity} kg.<br/>
                      Dispatch is blocked.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isCapacityExceeded || !formData.vehicle_id || !formData.driver_id}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#10bfa8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0da892] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation size={18} />
                  Create Draft Trip
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Board */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full min-h-[600px]">
            <h2 className="text-lg font-semibold text-[#10233f] mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#10bfa8]" />
              Live Board
            </h2>

            {trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Navigation className="w-12 h-12 mb-4 opacity-20" />
                <p>No trips found. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map(trip => (
                  <div key={trip.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-slate-500">#{trip.id.substring(0, 8)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-[#10233f] flex items-center gap-2">
                          {trip.source} <ArrowRightIcon /> {trip.destination}
                        </h3>
                      </div>
                      
                      {/* Action Buttons based on status */}
                      <div className="flex gap-2">
                        {trip.status === 'Draft' && (
                          <>
                            <button
                              onClick={() => handleAction(trip.id, 'dispatch')}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 transition"
                            >
                              <Play size={16} /> Dispatch
                            </button>
                            <button
                              onClick={() => handleAction(trip.id, 'cancel')}
                              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 transition"
                            >
                              <X size={16} /> Cancel
                            </button>
                          </>
                        )}

                        {trip.status === 'Dispatched' && (
                          <>
                            <button
                              onClick={() => openCompleteModal(trip.id)}
                              className="px-4 py-2 text-sm font-medium text-white bg-[#10bfa8] rounded-lg hover:bg-[#0da892] flex items-center gap-1.5 transition"
                            >
                              <CheckCircle size={16} /> Complete
                            </button>
                            <button
                              onClick={() => handleAction(trip.id, 'cancel')}
                              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 flex items-center gap-1.5 transition"
                            >
                              <X size={16} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 border-t border-slate-100 pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-slate-400" />
                        <span className="truncate" title={trip.vehicle?.name}>{trip.vehicle?.name || trip.vehicle_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <span className="truncate" title={trip.driver?.name}>{trip.driver?.name || trip.driver_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Cargo:</span> {trip.cargo_weight} kg
                      </div>
                      <div>
                        <span className="text-slate-400">Distance:</span> {trip.planned_distance} km
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Odometer Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
              <h3 className="font-semibold text-[#10233f] flex items-center gap-2">
                <CircleStop className="w-5 h-5 text-[#10bfa8]" />
                Complete Trip
              </h3>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Please enter the final odometer reading for the vehicle to complete this trip. This will be logged for maintenance tracking.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Final Odometer</label>
                <input
                  autoFocus
                  type="number"
                  min="0"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  placeholder="e.g. 45200"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#10bfa8] focus:outline-none focus:ring-1 focus:ring-[#10bfa8]"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsCompleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={submitCompleteTrip}
                disabled={!finalOdometer}
                className="px-4 py-2 text-sm font-medium text-white bg-[#10bfa8] rounded-lg hover:bg-[#0da892] disabled:opacity-50 transition"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for the arrow
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mx-1">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

export default Trips;
