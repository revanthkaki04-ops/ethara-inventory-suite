import React, { useState } from 'react';
import { Plus, Search, Eye, Trash2, X, PlusCircle, MinusCircle, ShoppingBag, User, Calendar, DollarSign } from 'lucide-react';

export default function Orders({ orders, products, customers, onCreate, onDelete, setNotification }) {
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([
    { product_id: '', quantity: 1, max_qty: 0, price: 0 }
  ]);

  const handleOpenCreate = () => {
    if (customers.length === 0) {
      setNotification({ message: 'You must register at least one customer first before placing an order.', type: 'warning' });
      return;
    }
    if (products.length === 0) {
      setNotification({ message: 'No products in inventory to order.', type: 'warning' });
      return;
    }
    
    setCustomerId(customers[0].id.toString());
    setOrderItems([{ product_id: products[0].id.toString(), quantity: 1, max_qty: products[0].quantity, price: products[0].price }]);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
  };

  const handleAddItemRow = () => {
    // Add default row with first product
    const firstProduct = products[0];
    setOrderItems(prev => [
      ...prev,
      { 
        product_id: firstProduct.id.toString(), 
        quantity: 1, 
        max_qty: firstProduct.quantity,
        price: firstProduct.price 
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (orderItems.length === 1) return;
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setOrderItems(prev => {
      const updated = [...prev];
      if (field === 'product_id') {
        const prod = products.find(p => p.id.toString() === value);
        updated[index] = {
          product_id: value,
          quantity: 1,
          max_qty: prod ? prod.quantity : 0,
          price: prod ? prod.price : 0
        };
      } else if (field === 'quantity') {
        const qtyVal = parseInt(value, 10);
        updated[index].quantity = isNaN(qtyVal) ? 1 : qtyVal;
      }
      return updated;
    });
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!customerId) {
      setNotification({ message: 'Please select a customer.', type: 'error' });
      return;
    }

    if (orderItems.length === 0) {
      setNotification({ message: 'Orders must contain at least 1 item.', type: 'error' });
      return;
    }

    // Verify stock and duplicates
    const itemMap = {};
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      if (!item.product_id) {
        setNotification({ message: 'Please select a product for all rows.', type: 'error' });
        return;
      }
      
      const prod = products.find(p => p.id.toString() === item.product_id);
      if (!prod) {
        setNotification({ message: 'Invalid product selected.', type: 'error' });
        return;
      }

      // Consolidate quantity if duplicate product rows added
      if (itemMap[item.product_id]) {
        itemMap[item.product_id].quantity += item.quantity;
      } else {
        itemMap[item.product_id] = {
          name: prod.name,
          quantity: item.quantity,
          available: prod.quantity
        };
      }
    }

    // Check consolidated stock availability
    for (const [prodId, data] of Object.entries(itemMap)) {
      if (data.quantity > data.available) {
        setNotification({ 
          message: `Insufficient stock for '${data.name}'. Requested total: ${data.quantity}, Available in inventory: ${data.available}`, 
          type: 'error' 
        });
        return;
      }
    }

    const payload = {
      customer_id: parseInt(customerId, 10),
      items: Object.keys(itemMap).map(pid => ({
        product_id: parseInt(pid, 10),
        quantity: itemMap[pid].quantity
      }))
    };

    try {
      await onCreate(payload);
      handleCloseCreate();
    } catch (err) {
      // Handled in parent
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to cancel order #ORD-${id}? Stock levels will be automatically restored.`)) {
      try {
        await onDelete(id);
      } catch (err) {
        // Handled in parent
      }
    }
  };

  // Search Filter
  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(search) ||
    o.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="orders-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Orders Management</h1>
          <p className="view-subtitle">Monitor orders, process sales, and coordinate stock levels.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Place Order
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-panel glass-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search orders by customer name or order number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="data-table-panel glass-panel">
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No orders recorded. Create an order to begin processing sales.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th className="number-col">Items</th>
                  <th className="number-col">Total Amount</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#ORD-{order.id}</strong></td>
                    <td>{order.customer.name}</td>
                    <td>{new Date(order.order_date).toLocaleString()}</td>
                    <td className="number-col font-mono">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="number-col font-mono text-emerald">${order.total_amount.toFixed(2)}</td>
                    <td className="actions-col">
                      <button 
                        className="btn-icon-secondary" 
                        title="View Order Details"
                        onClick={() => setSelectedOrderDetails(order)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn-icon-danger" 
                        title="Cancel/Delete Order"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Place Order Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel modal-lg animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">Create New Order</h2>
              <button className="modal-close-btn" onClick={handleCloseCreate}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder} className="modal-form">
              {/* Customer Selector */}
              <div className="form-group">
                <label htmlFor="customerSelect">Client / Customer</label>
                <select 
                  id="customerSelect" 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Section */}
              <div className="order-items-section">
                <div className="section-header">
                  <h3 className="section-subtitle">Order Items List</h3>
                  <button type="button" className="btn-text-primary" onClick={handleAddItemRow}>
                    <PlusCircle size={14} /> Add Product
                  </button>
                </div>

                <div className="items-list-container">
                  {orderItems.map((item, idx) => {
                    const selectedProduct = products.find(p => p.id.toString() === item.product_id);
                    const stock = selectedProduct ? selectedProduct.quantity : 0;
                    const price = selectedProduct ? selectedProduct.price : 0;
                    const stockAlert = item.quantity > stock;

                    return (
                      <div key={idx} className="order-item-row">
                        <div className="row-selector">
                          <select 
                            value={item.product_id} 
                            onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                            required
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} (${p.price.toFixed(2)}) - [{p.quantity} In Stock]
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="row-quantity">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            required
                          />
                          <span className="qty-helper">of {stock} units</span>
                        </div>

                        <div className="row-total">
                          <span>${(price * item.quantity).toFixed(2)}</span>
                        </div>

                        <button 
                          type="button" 
                          className="btn-icon-danger"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={orderItems.length === 1}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-form-summary">
                <div className="summary-row">
                  <span>Items Count:</span>
                  <strong>{orderItems.reduce((acc, it) => acc + it.quantity, 0)} units</strong>
                </div>
                <div className="summary-row grand-total">
                  <span>Grand Total:</span>
                  <strong>${calculateOrderTotal().toFixed(2)}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseCreate}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel modal-lg animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">Order Details: #ORD-{selectedOrderDetails.id}</h2>
              <button className="modal-close-btn" onClick={() => setSelectedOrderDetails(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body order-detail-modal">
              {/* Details grid */}
              <div className="detail-meta-grid">
                <div className="meta-card">
                  <User className="meta-card-icon" />
                  <div>
                    <span className="meta-label">Customer Info</span>
                    <strong className="meta-value">{selectedOrderDetails.customer.name}</strong>
                    <span className="meta-sub">{selectedOrderDetails.customer.email}</span>
                  </div>
                </div>

                <div className="meta-card">
                  <Calendar className="meta-card-icon" />
                  <div>
                    <span className="meta-label">Order Timestamp</span>
                    <strong className="meta-value">{new Date(selectedOrderDetails.order_date).toLocaleDateString()}</strong>
                    <span className="meta-sub">{new Date(selectedOrderDetails.order_date).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="meta-card emerald">
                  <DollarSign className="meta-card-icon" />
                  <div>
                    <span className="meta-label">Total Payment</span>
                    <strong className="meta-value">${selectedOrderDetails.total_amount.toFixed(2)}</strong>
                    <span className="meta-sub">Processed Successfully</span>
                  </div>
                </div>
              </div>

              {/* Item details table */}
              <h3 className="section-subtitle">Items in this Order</h3>
              <div className="table-responsive select-items-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th className="number-col">Unit Price</th>
                      <th className="number-col">Quantity</th>
                      <th className="number-col">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetails.items.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.product.name}</strong></td>
                        <td><code>{item.product.sku}</code></td>
                        <td className="number-col font-mono">${item.unit_price.toFixed(2)}</td>
                        <td className="number-col font-mono">{item.quantity}</td>
                        <td className="number-col font-mono text-emerald">${(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setSelectedOrderDetails(null)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
