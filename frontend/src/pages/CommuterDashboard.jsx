import { useState, useEffect } from 'react';
import { getStations, purchasePass, getTripHistory, getUserBalance, getAvailableVehicles } from '../services/api';
import { MapPin, Navigation, TrainFront, Bus, Car, CreditCard, History, Info, QrCode, Activity } from 'lucide-react';

export default function CommuterDashboard() {
  const currentUser = localStorage.getItem('urbanflow_user') || "user77"; 

  const [stations, setStations] = useState([]);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0); 
  const [availableVehicles, setAvailableVehicles] = useState([]); 
  
  const [startStation, setStartStation] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState('Metro');
  const [activePass, setActivePass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const modePrices = {
    'Metro': 30,
    'Bus': 15,
    'Cab': 140
  };

  // 1. Initial Load
  useEffect(() => {
    const loadData = async () => {
      const dbStations = await getStations();
      setStations(dbStations);
      if(dbStations.length > 0) {
        setStartStation(dbStations[0].name);
        setDestination(dbStations[1]?.name || dbStations[0].name);
      }
      
      const dbHistory = await getTripHistory(currentUser);
      setHistory(dbHistory);
      
      const dbBalance = await getUserBalance(currentUser);
      setBalance(dbBalance);
    };
    loadData();
  }, [currentUser]);

  // 2. Live Fleet Scanner
  useEffect(() => {
    const fetchVehicles = async () => {
      if (startStation && mode) {
        const vehicles = await getAvailableVehicles(mode, startStation);
        setAvailableVehicles(vehicles);
      }
    };
    fetchVehicles();
  }, [mode, startStation]);

  const handlePurchase = async () => {
    if(startStation === destination) {
      alert("Start point and destination cannot be the same.");
      return;
    }
    
    setIsLoading(true);
    const cost = modePrices[mode];

    try {
      const result = await purchasePass(currentUser, destination, cost);
      
      setActivePass(result.pass_id);
      setBalance(result.new_balance); 
      
      const updatedHistory = await getTripHistory(currentUser);
      setHistory(updatedHistory);
    } catch (error) {
      alert(error.message); 
    } finally {
      setIsLoading(false);
    }
  };

  const currentAmenities = stations.find(s => s.name === startStation)?.amenities.split(',') || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Urban<span className="text-cyan-400">Flow</span></h1>
        <div className="flex items-center gap-4 bg-[#111] p-3 rounded-xl border border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Digital Balance</p>
            <p className="text-cyan-400 font-bold font-mono">₹{balance.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg">
            <CreditCard size={20} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Journey Planner */}
        <div className="lg:col-span-8 space-y-8">
          
          <section className="bg-[#0d0d0d] rounded-3xl p-8 border border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Navigation size={120} /></div>
            
            <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
              <MapPin className="text-cyan-400" size={20}/> Plan Your Journey
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
              
              {/* Routing Dropdowns */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Starting Point</label>
                  <select 
                    value={startStation}
                    onChange={(e) => setStartStation(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-400 outline-none appearance-none cursor-pointer"
                  >
                    {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Destination</label>
                  <select 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:border-cyan-400 outline-none appearance-none cursor-pointer"
                  >
                    {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Transit Mode Selection */}
              <div className="space-y-3">
                <button onClick={() => setMode('Metro')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${mode === 'Metro' ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/5 hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3"><TrainFront size={18} className={mode==='Metro'?'text-cyan-400':'text-slate-400'}/> <span className="font-bold">Metro</span></div>
                  <div className="text-right"><span className="font-bold">₹{modePrices['Metro']}</span><p className="text-[9px] text-slate-500 uppercase tracking-widest">Fastest</p></div>
                </button>
                <button onClick={() => setMode('Bus')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${mode === 'Bus' ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/5 hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3"><Bus size={18} className={mode==='Bus'?'text-cyan-400':'text-slate-400'}/> <span className="font-bold">Bus</span></div>
                  <div className="text-right"><span className="font-bold">₹{modePrices['Bus']}</span><p className="text-[9px] text-green-500 uppercase tracking-widest">Cheapest</p></div>
                </button>
                <button onClick={() => setMode('Cab')} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${mode === 'Cab' ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/5 hover:bg-white/5'}`}>
                  <div className="flex items-center gap-3"><Car size={18} className={mode==='Cab'?'text-cyan-400':'text-slate-400'}/> <span className="font-bold">Cab</span></div>
                  <div className="text-right"><span className="font-bold">₹{modePrices['Cab']}</span><p className="text-[9px] text-slate-500 uppercase tracking-widest">Private</p></div>
                </button>
              </div>
            </div>

            {/* LIVE VEHICLE TELEMETRY PANEL */}
            <div className="mb-8 p-4 bg-[#111] rounded-xl border border-white/5">
              <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity size={12} className="text-cyan-400 animate-pulse"/> 
                Active {mode}s at {startStation || 'Selected Node'}
              </h3>
              
              {availableVehicles.length === 0 ? (
                <p className="text-xs font-mono text-slate-500">Scanning network... No {mode.toLowerCase()}s currently available at this station.</p>
              ) : (
                <div className="space-y-2">
                  {availableVehicles.map(v => (
                    <div key={v.id} className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <span className="font-mono text-sm font-bold text-white">{v.id}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] uppercase text-slate-500 block">Current Occupancy</span>
                         <span className={`text-xs font-bold font-mono ${v.occupancy > 50 ? 'text-yellow-500' : 'text-green-400'}`}>
                           {v.occupancy} PAX
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase Button - Disables if no vehicles are available */}
            <button 
              onClick={handlePurchase}
              disabled={isLoading || availableVehicles.length === 0}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : availableVehicles.length === 0 ? 'Route Unavailable' : `Purchase Pass (₹${modePrices[mode]})`}
            </button>
          </section>

          {/* Bottom Row: Amenities & History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0d0d0d] rounded-3xl p-6 border border-white/5">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Info className="text-cyan-400" size={16}/> Station Amenities
               </h3>
               <div className="space-y-3">
                 {currentAmenities.map((amenity, idx) => (
                   <div key={idx} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                     <span className="text-sm">{amenity.trim()}</span>
                     <span className="text-[9px] bg-green-900/40 text-green-400 px-2 py-1 rounded font-bold tracking-widest">AVAILABLE</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-[#0d0d0d] rounded-3xl p-6 border border-white/5">
               <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
                 <History className="text-cyan-400" size={16}/> Trip History
               </h3>
               <div className="space-y-3">
                 {history.length === 0 ? (
                    <p className="text-xs text-slate-500 font-mono">No recent trips found.</p>
                 ) : (
                   history.map(trip => (
                    <div key={trip.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold uppercase block text-cyan-400">{trip.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">To: {trip.destination}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{trip.status}</span>
                    </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Pass */}
        <div className="lg:col-span-4">
          <div className="bg-[#0a0a0c] rounded-3xl border border-cyan-500/20 p-8 flex flex-col items-center justify-center min-h-[500px] shadow-[0_0_50px_rgba(34,211,238,0.05)]">
             <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-8">Live Transit Pass</p>
             
             <div className="w-56 h-56 bg-white rounded-3xl p-4 flex items-center justify-center mb-8 shadow-2xl relative">
                {activePass ? (
                  <QrCode size={180} className="text-black" />
                ) : (
                  <div className="text-center opacity-30">
                    <QrCode size={80} className="mx-auto text-black mb-2" />
                    <p className="text-xs text-black font-bold uppercase">Awaiting Purchase</p>
                  </div>
                )}
             </div>

             <h2 className="text-2xl font-mono font-bold tracking-widest mb-12">
               {activePass ? activePass : '------'}
             </h2>

             <div className="w-full flex justify-between border-t border-white/10 pt-6">
               <div>
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest">Trip Status</p>
                 <p className={`font-bold text-sm ${activePass ? 'text-green-400' : 'text-slate-600'}`}>
                   {activePass ? 'READY TO SCAN' : 'INACTIVE'}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-[9px] text-slate-500 uppercase tracking-widest">ETA Arrival</p>
                 <p className="font-bold text-sm">--:--</p>
               </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}