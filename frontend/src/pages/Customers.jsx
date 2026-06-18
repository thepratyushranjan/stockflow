import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { getCustomers, createCustomer, deleteCustomer } from '../api';
import { showSuccess, showError, confirmDelete } from '../utils/alert';

const empty = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers().then((r) => setCustomers(r.data)).catch(() => showError('Failed to load customers')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCustomer(form);
      showSuccess('Customer created successfully');
      setModal(false);
      load();
    } catch (err) {
      showError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await confirmDelete(name);
    if (!result.isConfirmed) return;
    try {
      await deleteCustomer(id);
      showSuccess('Customer deleted');
      load();
    } catch (err) {
      showError(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setErrors({}); setModal(true); }}><FiPlus /> Add Customer</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : customers.length === 0 ? (
          <div className="empty"><div className="empty-icon">👥</div><p>No customers yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td className="actions">
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.full_name)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label>Phone Number (optional)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
