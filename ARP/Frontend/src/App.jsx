import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Home from './pages/Home';
import ScanOptions from './pages/ScanOptions';
import AttendanceScanner from './pages/AttendanceScanner';
import Registration from './pages/Registration';
import RemarkSearch from './pages/RemarkSearch';
import RemarkScanner from './pages/RemarkScanner';
import History from './pages/History';
import AttendancePage from './pages/AttendancePage';
import RemarkPage from './pages/RemarkPage';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/attendance" element={<Layout><AttendancePage /></Layout>} />
        <Route path="/remark" element={<Layout><RemarkPage /></Layout>} />
        <Route path="/scan-options" element={<Layout><ScanOptions /></Layout>} />
        <Route path="/attendance-scanner" element={<Layout><AttendanceScanner /></Layout>} />
        <Route path="/registration" element={<Layout><Registration /></Layout>} />
        <Route path="/remark-search" element={<Layout><RemarkSearch /></Layout>} />
        <Route path="/remark-scanner" element={<Layout><RemarkScanner /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
