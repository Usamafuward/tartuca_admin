import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';
import Gallery from './pages/Gallery';
import SpecialOffers from './pages/SpecialOffers';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/special-offers" element={<SpecialOffers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/settings" element={<Settings initialTab="preferences" />} />
          <Route path="/admin-options" element={<Settings initialTab="admin" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
