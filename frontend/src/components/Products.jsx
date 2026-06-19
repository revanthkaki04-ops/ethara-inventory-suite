import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

export default function Products({ products, onCreate, onUpdate, onDelete, setNotification }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: ''
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', price: '', quantity: '0' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validations
    if (!formData.name.trim() || !formData.sku.trim()) {
      setNotification({ message: 'Name and SKU are required fields.', type: 'error' });
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setNotification({ message: 'Price must be a valid positive number.', type: 'error' });
      return;
    }

    const qtyNum = parseInt(formData.quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setNotification({ message: 'Stock quantity must be a non-negative integer.', type: 'error' });
      return;
    }

    const data = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      price: priceNum,
      quantity: qtyNum
    };

    try {
      if (editingProduct) {
        await onUpdate(editingProduct.id, data);
      } else {
        await onCreate(data);
      }
      handleCloseModal();
    } catch (err) {
      // Errors are handled in parents or via exceptions, but we handle it gracefully here
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await onDelete(id);
      } catch (err) {
        // Error already surfaced
      }
    }
  };

  // Search Filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Product Inventory</h1>
          <p className="view-subtitle">Manage catalog items, monitor levels, and track pricing.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-panel glass-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="data-table-panel glass-panel">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Add products to populate the catalog.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th className="number-col">Price</th>
                  <th className="number-col">In Stock</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isLow = product.quantity < 10;
                  return (
                    <tr key={product.id} className={isLow ? 'low-stock-row' : ''}>
                      <td>
                        <div className="product-info-cell">
                          <span className="product-name">{product.name}</span>
                          <span className="product-id">ID: #{product.id}</span>
                        </div>
                      </td>
                      <td><code>{product.sku}</code></td>
                      <td className="number-col font-mono">${product.price.toFixed(2)}</td>
                      <td className="number-col font-mono">{product.quantity}</td>
                      <td>
                        {product.quantity === 0 ? (
                          <span className="badge badge-danger">Out of Stock</span>
                        ) : isLow ? (
                          <span className="badge badge-warning">
                            <AlertTriangle size={12} style={{ marginRight: '4px' }} /> Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-success">Healthy</span>
                        )}
                      </td>
                      <td className="actions-col">
                        <button 
                          className="btn-icon-secondary" 
                          title="Edit Product"
                          onClick={() => handleOpenEdit(product)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-icon-danger" 
                          title="Delete Product"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder='e.g., UltraWide curved Monitor 34"'
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="sku">SKU Code</label>
                <input 
                  type="text" 
                  id="sku" 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleInputChange} 
                  placeholder="e.g., MN-UW-004"
                  required
                  disabled={!!editingProduct} // Disable SKU edits to prevent DB violations
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input 
                    type="number" 
                    id="price" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantity in Stock</label>
                  <input 
                    type="number" 
                    id="quantity" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleInputChange} 
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
