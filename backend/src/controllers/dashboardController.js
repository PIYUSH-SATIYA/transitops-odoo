import { supabaseAdmin } from '../config/supabase.js';

export const getDashboardKPIs = async (req, res) => {
  try {
    // 1. Vehicle KPIs
    const { data: vehicles, error: vError } = await supabaseAdmin.from('vehicles').select('*');
    if (vError) throw vError;

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
    const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'In Shop').length;
    const fleetUtilization = totalVehicles === 0 ? 0 : ((activeVehicles / totalVehicles) * 100).toFixed(2);

    // 2. Trip KPIs
    const { data: trips, error: tError } = await supabaseAdmin.from('trips').select('status, revenue');
    if (tError) throw tError;

    const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips = trips.filter(t => t.status === 'Draft').length;


    const totalRevenue = trips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);

    // 3. Driver KPIs
    const { data: drivers, error: dError } = await supabaseAdmin.from('drivers').select('*');
    if (dError) throw dError;

    const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;

    // 4. Operational Costs (Fuel + Maintenance + General)
    const { data: fuelLogs } = await supabaseAdmin.from('fuel_logs').select('cost, liters');
    const { data: maintenanceLogs } = await supabaseAdmin.from('maintenance_logs').select('cost');
    const { data: expenses } = await supabaseAdmin.from('expenses').select('cost');

    const totalFuelCost = fuelLogs?.reduce((sum, log) => sum + Number(log.cost), 0) || 0;
    const totalMaintenanceCost = maintenanceLogs?.reduce((sum, log) => sum + Number(log.cost), 0) || 0;
    const totalGeneralExpenses = expenses?.reduce((sum, exp) => sum + Number(exp.cost), 0) || 0;

    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalGeneralExpenses;

    // Fuel Efficiency (Total Odometer Distance / Total Fuel Liters)
    const totalDistance = vehicles.reduce((sum, v) => sum + Number(v.odometer), 0);
    const totalFuelLiters = fuelLogs?.reduce((sum, log) => sum + Number(log.liters), 0) || 0;
    const fuelEfficiency = totalFuelLiters === 0 ? 0 : (totalDistance / totalFuelLiters).toFixed(2);

    // Vehicle ROI = [Revenue - (Maintenance + Fuel)] / Acquisition Cost

    const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + Number(v.acquisition_cost), 0);
    const fleetROI = totalAcquisitionCost === 0 ? 0 :
      ((totalRevenue - totalOperationalCost) / totalAcquisitionCost).toFixed(4);

    res.status(200).json({
      vehicleMetrics: {
        total: totalVehicles,
        available: availableVehicles,
        active: activeVehicles,
        inMaintenance: maintenanceVehicles,
        fleetUtilizationPercentage: fleetUtilization
      },
      tripMetrics: {
        active: activeTrips,
        pending: pendingTrips,
        totalRevenue
      },
      driverMetrics: {
        onDuty: driversOnDuty
      },
      financialMetrics: {
        totalOperationalCost,
        fuelEfficiencyKmPerLiter: fuelEfficiency,
        fleetROI
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
  }
};
