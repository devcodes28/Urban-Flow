import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Bus, MapPin, X, LogOut, Activity, Shield, AlertTriangle, Users } from 'lucide-react';
import { getAdminFleet, addVehicle, addStation, getStations } from '../services/api';

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Data State
  const [fleet, setFleet] = useState([]);
  const [stations, setStations] = useState([]);
  const [stats, setStats] = useState({ vehicles: 0, passengers: 0, health: 98.2, alerts: 0 });
  
  // UI State
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  // Form State
  const [newVehicle, setNewVehicle] = useState({ id: '', type: 'bus', current_station: '' });
  const [newStation, setNewStation] = useState({ name: '', amenities: '' });

  const loadData = async () => {
    try {
      const data = await getAdminFleet();
      const st = await getStations();
      setFleet(data.vehicles);
      setStations(st);
      setStats({
        vehicles: data.vehicles.length,
        passengers: data.total_live_passengers,
        health: 98.2,
        alerts: data.vehicles.filter(v => v.status === 'critical').length
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('urbanflow_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative font-sans">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Urban<span className="text-red-500">Flow</span></h1>
          <div className="flex gap-2">
            <button onClick={() => setShowVehicleModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all">
              <Plus size={14} className="text-red-500"/> Add Vehicle
            </button>
            <button onClick={() => setShowStationModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition-all">
              <Plus size={14} className="text-red-500"/> Add Route Node
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all">
          <LogOut size={16} /> Disconnect
        </button>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Bus size={24}/></div>
            <div><p className="text-[10px] text-slate-500 uppercase">Fleet Size</p><p className="text-2xl font-black font-mono">{stats.vehicles}</p></div>
          </div>
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={24}/></div>
            <div><p className="text-[10px] text-slate-500 uppercase">Live PAX</p><p className="text-2xl font-black font-mono">{stats.passengers}</p></div>
          </div>
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><Activity size={24}/></div>
            <div><p className="text-[10px] text-slate-500 uppercase">System Health</p><p className="text-2xl font-black font-mono">{stats.health}%</p></div>
          </div>
          <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><AlertTriangle size={24}/></div>
            <div><p className="text-[10px] text-slate-500 uppercase">Active Alerts</p><p className="text-2xl font-black font-mono">{stats.alerts}</p></div>
          </div>
        </div>

        {/* MAP & ALERTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* THE MAP */}
          <div className="lg:col-span-8 bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden h-[500px] shadow-2xl relative z-0">
            <MapContainer center={[8.8932, 76.6141]} zoom={14} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {fleet.map((v) => (
                <Marker key={v.id} position={[v.lat, v.lng]}>
                  <Popup>
                    <div className="text-black font-sans">
                      <p className="font-bold border-b pb-1 mb-1">{v.id}</p>
                      <p className="text-[10px] uppercase font-bold">Occupancy: {v.occupancy}</p>
                      <p className="text-[10px] uppercase font-bold">Station: {v.current_station}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* ALERTS PANEL */}
          <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/5 rounded-3xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500"/> Critical Alerts
            </h2>
            <div className="space-y-4">
              {fleet.filter(v => v.status === 'critical').map(v => (
                <div key={v.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                  <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Attention Required</p>
                  <p className="text-sm font-bold">Vehicle {v.id} reporting critical status.</p>
                </div>
              ))}
              {stats.alerts === 0 && <p className="text-center py-10 text-slate-600 text-xs italic">All systems nominal.</p>}
            </div>
          </div>
        </div>

        {/* FLEET LIST */}
        <div className="bg-[#0d0d0d] border border-white/5 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield size={20} className="text-red-500"/> Fleet Registry</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] uppercase text-slate-500 border-b border-white/5">
                            <th className="pb-4">Unit ID</th>
                            <th className="pb-4">Type</th>
                            <th className="pb-4">Node</th>
                            <th className="pb-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-mono">
                        {fleet.map(v => (
                            <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                <td className="py-4 font-bold text-red-500">{v.id}</td>
                                <td className="py-4 uppercase text-xs">{v.type}</td>
                                <td className="py-4 text-slate-400">{v.current_station}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.status === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {v.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>

      {/* VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowVehicleModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h2 className="text-2xl font-black uppercase italic mb-6 text-red-500">Commission Unit</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await addVehicle(newVehicle); setShowVehicleModal(false); loadData(); }} className="space-y-4">
              <input required placeholder="UNIT ID" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-500 uppercase" value={newVehicle.id} onChange={e => setNewVehicle({...newVehicle, id: e.target.value})}/>
              <select className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                <option value="bus">Bus</option>
                <option value="metro">Metro</option>
                <option value="cab">Cab</option>
              </select>
              <select required className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" value={newVehicle.current_station} onChange={e => setNewVehicle({...newVehicle, current_station: e.target.value})}>
                <option value="">Assign Base Station</option>
                {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
              <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-bold uppercase tracking-widest mt-4">Initialize Unit</button>
            </form>
          </div>
        </div>
      )}

      {/* STATION MODAL */}
      {showStationModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1001] flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setShowStationModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
            <h2 className="text-2xl font-black uppercase italic mb-6 text-red-500">Establish Node</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await addStation(newStation); setShowStationModal(false); loadData(); }} className="space-y-4">
              <input required placeholder="STATION NAME" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-500" value={newStation.name} onChange={e => setNewStation({...newStation, name: e.target.value})}/>
              <textarea required placeholder="AMENITIES" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none min-h-[100px]" value={newStation.amenities} onChange={e => setNewStation({...newStation, amenities: e.target.value})}/>
              <button type="submit" className="w-full py-4 bg-red-600 rounded-xl font-bold uppercase tracking-widest mt-4">Confirm Node</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}