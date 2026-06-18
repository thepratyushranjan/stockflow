import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { getOrders, getOrder, createOrder, deleteOrder, getProducts, getCustomers } from '../api';
import { showSuccess, showError, confirmAction } from '../utils/alert';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getOrders().then((r) => setOrders(r.data)).catch(() => showError('Failed to load orders')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = async () => {
    try {
      const [c, p] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(c.data);
      setProducts(p.data);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      setErrors({});
      setModal('create');
    } catch { showError('Failed to load data'); }
  };

  const openDetail = async (id) => {
    try {
      const res = await getOrder(id);
      setDetail(res.data);
      setModal('detail');
    } catch { showError('Failed to load order details'); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] });

  const removeItem = (i) => {
    if (form.items.length <= 1) return;
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  };

  const updateItem = (i, field, value) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: field === 'quantity' ? Number(value) : value };
    setForm({ ...form, items });
  };

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    const itemErrors = form.items.some((it) => !it.product_id || it.quantity < 1);
    if (itemErrors) e.items = 'All items must have a product and quantity >= 1';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createOrder(form);
      showSuccess('Order created successfully');
      setModal(null);
      load();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmAction('Cancel Order?', 'This will restore the stock for all items in this order.');
    if (!result.isConfirmed) return;
    try {
      await deleteOrder(id);
      showSuccess('Order cancelled');
      load();
    } catch (err) {
      showError(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Create Order</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : orders.length === 0 ? (
          <div className="empty"><div className="empty-icon">🛒</div><p>No orders yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Order ID</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id.slice(0, 8)}...</td>
                    <td>{o.items.length} item(s)</td>
                    <td style={{ fontWeight: 600 }}>${Number(o.total_amount).toFixed(2)}</td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o.id)}><FiEye /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Select customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
                {errors.customer_id && <div className="form-error">{errors.customer_id}</div>}
              </div>

              <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>Order Items</label>
              {form.items.map((item, i) => (
                <div className="order-item-row" key={i}>
                  <div className="form-group">
                    <select value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ maxWidth: 100 }}>
                    <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}><FiX /></button>
                  )}
                </div>
              ))}
              {errors.items && <div className="form-error" style={{ marginBottom: 8 }}>{errors.items}</div>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 16 }}><FiPlus /> Add Item</button>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'detail' && detail && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order Details</h2>
            <div className="order-detail-grid">
              <div className="detail-item"><label>Order ID</label><p>{detail.id.slice(0, 8)}...</p></div>
              <div className="detail-item"><label>Date</label><p>{new Date(detail.created_at).toLocaleDateString()}</p></div>
              <div className="detail-item"><label>Customer ID</label><p>{detail.customer_id.slice(0, 8)}...</p></div>
              <div className="detail-item"><label>Total Amount</label><p style={{ color: 'var(--success)' }}>${Number(detail.total_amount).toFixed(2)}</p></div>
            </div>
            <h3 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Items</h3>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Product ID</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detail.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.product_id.slice(0, 8)}...</td>
                      <td>{it.quantity}</td>
                      <td>${Number(it.unit_price).toFixed(2)}</td>
                      <td>${(it.quantity * Number(it.unit_price)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
