import { useState, useEffect } from 'react';
import { FiBox, FiUsers, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import { getDashboard } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  if (!data) return <div className="empty">Failed to load dashboard data.</div>;

  const stats = [
    { label: 'Total Products', value: data.total_products, icon: <FiBox />, color: 'purple' },
    { label: 'Total Customers', value: data.total_customers, icon: <FiUsers />, color: 'green' },
    { label: 'Total Orders', value: data.total_orders, icon: <FiShoppingCart />, color: 'orange' },
    { label: 'Low Stock Items', value: data.low_stock_products.length, icon: <FiAlertTriangle />, color: 'red' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Low Stock Products</h2>
        {data.low_stock_products.length === 0 ? (
          <div className="empty">{data.total_products === 0 ? 'No products added yet.' : 'All products are well stocked!'}</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td><span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>{p.stock_quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
