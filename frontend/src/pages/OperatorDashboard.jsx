import { useState, useEffect } from 'react';
import { Power, Users, Clock, AlertCircle, Scan, MapPin, Download } from 'lucide-react';
import { getOperatorVehicles, getVehicleStats, getManifest, scanCommuterPass } from '../services/api';

export default function OperatorDashboard() {
  const currentOperator = localStorage.getItem('urbanflow_user') || "OP-8821";

  // --- STATE ---
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [shiftActive, setShiftActive] = useState(false);
  
  const [vehicleData, setVehicleData] = useState(null);
  const [manifest, setManifest] = useState([]);
  
  // Scanner State
  const [scanInput, setScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState(null); // { type: 'success'|'error', msg: '' }

  // 1. Load available vehicles on mount
  useEffect(() => {
    const loadVehicles = async () => {
      const v = await getOperatorVehicles();
      setVehicles(v);
      if(v.length > 0) setSelectedVehicle(v[0].id);
    };
    loadVehicles();
  }, []);

  // 2. Poll live data when shift is active
  useEffect(() => {
    let interval;
    if (shiftActive && selectedVehicle) {
      const fetchLiveData = async () => {
        const stats = await getVehicleStats(selectedVehicle);
        setVehicleData(stats);
        
        const passengers = await getManifest(selectedVehicle);
        setManifest(passengers);
      };
      
      fetchLiveData(); // Initial fetch
      interval = setInterval(fetchLiveData, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [shiftActive, selectedVehicle]);

  // --- HANDLE SCANNING ---
  const handleScan = async (e) => {
    e.preventDefault();
    if(!scanInput.trim()) return;

    try {
      setScanStatus(null);
      const res = await scanCommuterPass(scanInput.trim(), selectedVehicle);
      setScanStatus({ type: 'success', msg: `AUTHORIZED: Route to ${res.destination}` });
      setScanInput(''); // Clear input for next scan
      
      // Instantly refresh data instead of waiting 5 seconds
      const stats = await getVehicleStats(selectedVehicle);
      setVehicleData(stats);
      const passengers = await getManifest(selectedVehicle);
      setManifest(passengers);

    } catch (error) {
      setScanStatus({ type: 'error', msg: error.message });
      setScanInput('');
    }
  };

  // --- EXPORT MANIFEST LOG TO CSV ---
  const handleExportLog = () => {
    if (manifest.length === 0) {
      alert("No active passengers to export.");
      return;
    }

    // 1. Create CSV Headers
    const headers = ["Pass ID", "Passenger Name", "Destination", "Time Scanned"];
    
    // 2. Map data into CSV rows
    const rows = manifest.map(p => {
      const scanTime = new Date(p.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      return `"${p.pass_id}","${p.passenger_name}","${p.destination}","${scanTime}"`;
    });

    // 3. Combine headers and rows
    const csvContent = [headers.join(","), ...rows].join("\n");

    // 4. Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.setAttribute("download", `UrbanFlow_Manifest_${selectedVehicle}_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-purple-500/30">
      
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Urban<span className="text-purple-500">Flow</span></h1>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">Operator Terminal</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Operator ID</p>
             <p className="text-purple-400 font-bold">{currentOperator}</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-black text-white">OP</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shift Status */}
          <section className="bg-[#0d0d0d] rounded-3xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Shift Status</h2>
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${shiftActive ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></div>
            </div>

            {!shiftActive ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 block">Assign Vehicle</label>
                  <select 
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white focus:border-purple-400 outline-none appearance-none cursor-pointer"
                  >
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} - {v.type.toUpperCase()}</option>)}
                  </select>
                </div>
                <button 
                  onClick={() => setShiftActive(true)}
                  className="w-full py-5 rounded-2xl bg-green-500 text-black font-black uppercase tracking-widest text-lg hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Power size={24} /> Start Route Shift
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="bg-[#111] border border-white/5 rounded-xl p-4 flex justify-between items-center">
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Vehicle</p>
                     <p className="font-bold text-lg text-purple-400">{selectedVehicle}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest">Station</p>
                     <p className="font-bold text-sm">{vehicleData?.current_station || 'In Transit'}</p>
                   </div>
                 </div>
                 <button 
                  onClick={() => setShiftActive(false)}
                  className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  End Shift
                </button>
              </div>
            )}
          </section>

          {/* Boarding Verification (Scanner) */}
          <section className="bg-[#0d0d0d] rounded-3xl p-6 border border-white/5 text-center min-h-[300px] flex flex-col relative overflow-hidden">
             <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 flex items-center justify-center gap-2">
               <Scan size={16}/> Boarding Verification
             </h2>

             {!shiftActive ? (
               <div className="m-auto opacity-30">
                 <Power size={48} className="mx-auto mb-4" />
                 <p className="text-xs uppercase font-bold tracking-widest">Scanner Offline</p>
               </div>
             ) : (
               <div className="m-auto w-full">
                 <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-6 transition-colors ${scanStatus?.type === 'success' ? 'border-green-500 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : scanStatus?.type === 'error' ? 'border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-white/10 text-white'}`}>
                   <Scan size={48} />
                 </div>
                 
                 {/* Mock Scanner Input */}
                 <form onSubmit={handleScan}>
                   <input 
                     type="text"
                     value={scanInput}
                     onChange={(e) => setScanInput(e.target.value)}
                     placeholder="Type Pass ID (e.g. UF-992-AZ)"
                     className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-center font-mono text-sm focus:border-purple-500 outline-none mb-4 uppercase"
                   />
                   <button type="submit" className="hidden">Submit</button>
                 </form>

                 {scanStatus && (
                   <p className={`text-xs font-bold uppercase ${scanStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                     {scanStatus.msg}
                   </p>
                 )}
               </div>
             )}
          </section>
        </div>

        {/* RIGHT COLUMN: Telemetry & Manifest */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Users size={24}/></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Live Occupancy</p>
                <p className="text-2xl font-black font-mono">
                  {vehicleData ? vehicleData.occupancy : '--'} <span className="text-sm text-slate-600 font-sans">PAX</span>
                </p>
              </div>
            </div>
            <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Clock size={24}/></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Avg Speed</p>
                <p className="text-2xl font-black font-mono">
                  {shiftActive ? '42' : '--'} <span className="text-sm text-slate-600 font-sans">km/h</span>
                </p>
              </div>
            </div>
            <div className="bg-[#0d0d0d] p-6 rounded-3xl border border-white/5 flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><MapPin size={24}/></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">ETA Next Node</p>
                <p className="text-2xl font-black font-mono">
                  {shiftActive ? '4' : '--'} <span className="text-sm text-slate-600 font-sans">mins</span>
                </p>
              </div>
            </div>
          </div>

          {/* Passenger Manifest */}
          <section className="bg-[#0d0d0d] rounded-3xl p-8 border border-white/5 min-h-[500px]">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="text-slate-400" size={20}/> Live Passenger Manifest
              </h2>
              <button 
                onClick={handleExportLog}
                disabled={!shiftActive || manifest.length === 0} 
                className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={14}/> Export Log
              </button>
            </div>

            {!shiftActive ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-30 text-center">
                <AlertCircle size={48} className="mb-4" />
                <p className="uppercase tracking-widest font-bold text-xs">Start shift to view manifest</p>
              </div>
            ) : manifest.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="font-mono text-slate-500 text-sm">No active passengers on board.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-slate-600 border-b border-white/5">
                      <th className="pb-4 font-bold">Pass ID</th>
                      <th className="pb-4 font-bold">Passenger Name</th>
                      <th className="pb-4 font-bold">Destination</th>
                      <th className="pb-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {manifest.map((p) => (
                      <tr key={p.pass_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 text-purple-400 font-bold">{p.pass_id}</td>
                        <td className="py-4 text-white uppercase">{p.passenger_name}</td>
                        <td className="py-4 text-slate-400">{p.destination}</td>
                        <td className="py-4 text-right">
                          <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] tracking-widest font-bold font-sans">
                            ONBOARD
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}