import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bus, Shield } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

// --- MOTION INTEGRATION ---
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles"; 

export default function Onboarding() {
  const navigate = useNavigate();
  
  // App State
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('commuter'); // commuter, operator, admin
  
  // Base Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Commuter Specific State
  const [gender, setGender] = useState('Male');
  
  // Operator Specific State
  const [transportType, setTransportType] = useState('bus');
  const [employeeId, setEmployeeId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Status State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- PARTICLES ENGINE INIT ---
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  // Handle Role Change (Force Admin to Login Mode)
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setIsLogin(true); // Admins cannot register
    }
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const data = await loginUser(username, password);
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'operator') navigate('/operator');
        else navigate('/commuter');
        
      } else {
        // --- REGISTRATION LOGIC ---
        const registrationData = {
          username: username,
          password: password,
          full_name: fullName,
          role: role,
          ...(role === 'commuter' && { gender }),
          ...(role === 'operator' && { 
            transport_type: transportType, 
            employee_id: employeeId, 
            license: licenseNumber 
          })
        };

        await registerUser(registrationData);
        
        setSuccessMsg('Registration complete. You can now log in.');
        setIsLogin(true); // Switch back to login view
        setPassword('');  
      }
    } catch (error) {
      setErrorMsg(error.message || "Cannot connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- 🛰️ THE MOTION BACKGROUND (PARTICLES) --- */}
      <Particles
        className="absolute inset-0 z-0"
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false }, // Allows it to sit behind the UI properly
          background: {
            color: {
              value: "transparent", // Lets the #050505 show through
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: { enable: false },
              onHover: {
                enable: true,
                mode: "grab", 
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 140,
                line_linked: { opacity: 0.3 }
              }
            },
          },
          particles: {
            color: {
              value: "#FFFFFF", 
            },
            links: {
              color: "#FFFFFF",
              distance: 150,
              enable: true,
              opacity: 0.15,
              width: 1,
            },
            collisions: { enable: false },
            move: {
              directions: "none",
              enable: true,
              out_mode: "out",
              random: false,
              speed: 0.5, 
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 1200, 
              },
              value: 100, 
            },
            opacity: {
              value: 0.4, 
            },
            shape: {
              type: "circle",
            },
            size: {
              random: true,
              value: { min: 1, max: 2 },
            },
          },
          detectRetina: true,
        }}
      />

      {/* --- Main Auth Card --- */}
      {/* z-10 ensures the card stays above the particles */}
      <div className="w-full max-w-lg bg-[#0d0d0d]/95 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Back to Login Button */}
        {!isLogin && (
          <button 
            onClick={toggleMode}
            type="button"
            className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        )}

        {/* Header */}
        <div className="text-center mt-6 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest">
            {isLogin ? 'Login ' : 'Join '}
            <span className="text-cyan-400">UrbanFlow</span>
          </h1>
        </div>

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="w-full bg-red-950/30 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center font-medium mb-6">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="w-full bg-green-950/30 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg text-center font-medium mb-6">
            {successMsg}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="flex gap-3 mb-8">
          <button 
            type="button"
            onClick={() => handleRoleChange('commuter')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all ${
              role === 'commuter' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10' : 'border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <User size={16} /> Commuter
          </button>
          <button 
            type="button"
            onClick={() => handleRoleChange('operator')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all ${
              role === 'operator' ? 'border-purple-400 text-purple-400 bg-purple-400/10' : 'border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <Bus size={16} /> Operator
          </button>
          <button 
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all ${
              role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 text-slate-400 hover:bg-white/5'
            }`}
          >
            <Shield size={16} /> Admin
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* REGISTRATION ONLY: Full Name */}
          {!isLogin && (
            <div>
              <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sreedev Suresh"
                className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          )}

          {/* COMMON FIELDS: Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">User ID</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-cyan-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* DYNAMIC REGISTRATION FIELDS */}
          {!isLogin && role === 'commuter' && (
            <div>
              <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">Gender</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-cyan-400 outline-none transition-colors appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          )}

          {!isLogin && role === 'operator' && (
             <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
               <div>
                  <label className="text-[10px] text-purple-400 font-bold tracking-wider mb-2 block uppercase">Transport Division</label>
                  <select 
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors appearance-none"
                  >
                    <option value="bus">Municipal Bus</option>
                    <option value="train">Regional Train</option>
                    <option value="metro">City Metro</option>
                  </select>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">Employee ID</label>
                    <input 
                      type="text" 
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. OP-8821"
                      className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold tracking-wider mb-2 block uppercase">License Number</label>
                    <input 
                      type="text" 
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="e.g. KL-DL-993"
                      className="w-full bg-[#111] border border-white/5 rounded-lg p-3 text-white focus:border-purple-400 outline-none transition-colors"
                    />
                  </div>
               </div>
             </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 mt-6 font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 ${
              role === 'operator' ? 'bg-purple-500 text-white hover:bg-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]' :
              role === 'admin' ? 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]' :
              'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
            }`}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Complete Registration')}
          </button>
        </form>

        {/* Toggle Footer (Hidden if Admin) */}
        {isLogin && role !== 'admin' && (
          <div className="text-center mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={toggleMode}
                className={`${role === 'operator' ? 'text-purple-400' : 'text-cyan-400'} font-bold hover:underline`}
              >
                Register here
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}