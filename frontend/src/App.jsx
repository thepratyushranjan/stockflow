import { Routes, Route, NavLink } from 'react-router-dom';
import { FiGrid, FiBox, FiUsers, FiShoppingCart } from 'react-icons/fi';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">S<span>tockFlow</span></div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiGrid size={18} /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiBox size={18} /> <span>Products</span>
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiUsers size={18} /> <span>Customers</span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiShoppingCart size={18} /> <span>Orders</span>
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} StockFlow. All rights reserved. Developed by Pratyush.</p>
        </footer>
      </main>
    </div>
  );
}
