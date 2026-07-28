import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// --- 🔐 AUTHENTICATION ---
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login?username=${username}&password_input=${password}`);
    localStorage.setItem('urbanflow_user', response.data.username); 
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Could not connect to server");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Registration failed");
  }
};

// --- 🚉 COMMUTER SERVICES ---
export const getStations = async () => {
  try {
    const response = await axios.get(`${API_URL}/commuter/stations`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch stations", error);
    return [];
  }
};

export const getUserBalance = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/commuter/balance/${username}`);
    return response.data.balance;
  } catch (error) {
    return 0;
  }
};

export const getAvailableVehicles = async (type, station) => {
  try {
    const response = await axios.get(`${API_URL}/commuter/vehicles/${type}/${station}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const purchasePass = async (username, destination, cost) => {
  try {
    const response = await axios.post(`${API_URL}/commuter/book-pass`, {
      username,
      destination,
      cost
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to purchase pass"); 
  }
};

export const getTripHistory = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/commuter/history/${username}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// --- 🚌 OPERATOR SERVICES ---
export const getOperatorVehicles = async () => {
  try {
    const response = await axios.get(`${API_URL}/operator/vehicles`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getVehicleStats = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_URL}/operator/vehicle/${vehicleId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const scanCommuterPass = async (passId, vehicleId) => {
  try {
    const response = await axios.post(`${API_URL}/operator/scan?pass_id=${passId}&vehicle_id=${vehicleId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Scan Failed");
  }
};

export const getManifest = async (vehicleId) => {
  try {
    const response = await axios.get(`${API_URL}/operator/manifest/${vehicleId}`);
    return response.data;
  } catch (error) {
    return [];
  }
};

// --- 🛡️ ADMIN SERVICES ---
export const getAdminFleet = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/fleet`);
    return response.data;
  } catch (error) {
    console.error("Error fetching fleet:", error);
    return { vehicles: [], total_live_passengers: 0 };
  }
};

export const addVehicle = async (vehicleData) => {
  const response = await axios.post(`${API_URL}/admin/add-vehicle`, vehicleData);
  return response.data;
};

export const addStation = async (stationData) => {
  const response = await axios.post(`${API_URL}/admin/add-station`, stationData);
  return response.data;
};