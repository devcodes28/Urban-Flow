import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import CommuterDashboard from './pages/CommuterDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminDashboard from './pages/AdminDashboard'; // <-- Import added

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/commuter" element={<CommuterDashboard />} />
        <Route path="/operator" element={<OperatorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* <-- Route updated */}
      </Routes>
    </Router>
  );
}

export default App;