import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Home from './pages/Home';
import Registration from './pages/Registration';
import RemarkScanner from './pages/RemarkScanner';
import History from './pages/History';
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
        <Route path="/remark" element={<Layout><RemarkPage /></Layout>} />
        <Route path="/registration" element={<Layout><Registration /></Layout>} />
        <Route path="/remark-scanner" element={<Layout><RemarkScanner /></Layout>} />
        <Route path="/history" element={<Layout><History /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
