import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';
import { showSuccess, showError, confirmDelete } from '../utils/alert';

const empty = { name: '', sku: '', price: '', stock_quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts().then((r) => setProducts(r.data)).catch(() => showError('Failed to load products')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || Number(form.price) <= 0) e.price = 'Price must be > 0';
    if (form.stock_quantity === '' || Number(form.stock_quantity) < 0) e.stock_quantity = 'Stock must be >= 0';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = { ...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity) };
    try {
      if (modal === 'edit') {
        await updateProduct(editId, payload);
        showSuccess('Product updated successfully');
      } else {
        await createProduct(payload);
        showSuccess('Product created successfully');
      }
      setModal(null);
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
      await deleteProduct(id);
      showSuccess('Product deleted');
      load();
    } catch (err) {
      showError(err.response?.data?.detail || 'Delete failed');
    }
  };

  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: p.price, stock_quantity: p.stock_quantity });
    setEditId(p.id);
    setErrors({});
    setModal('edit');
  };

  const openAdd = () => { setForm(empty); setEditId(null); setErrors({}); setModal('add'); };

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Product</button>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : products.length === 0 ? (
          <div className="empty"><div className="empty-icon">📦</div><p>No products yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-danger' : p.stock_quantity < 10 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><FiEdit2 /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'edit' ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label>SKU / Code</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. PRD-001" />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
                {errors.stock_quantity && <div className="form-error">{errors.stock_quantity}</div>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
