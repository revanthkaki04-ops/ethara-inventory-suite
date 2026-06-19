import React, { useState } from 'react';
import { Plus, Search, Trash2, X, Mail, Phone, User } from 'lucide-react';

export default function Customers({ customers, onCreate, onDelete, setNotification }) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', phone: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setNotification({ message: 'All fields are required.', type: 'error' });
      return;
    }

    // Validate email layout
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setNotification({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    const data = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim()
    };

    try {
      await onCreate(data);
      handleCloseModal();
    } catch (err) {
      // Handled in parent
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"? This will delete the account from records.`)) {
      try {
        await onDelete(id);
      } catch (err) {
        // Handled in parent
      }
    }
  };

  // Search Filter
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="customers-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Customers Directory</h1>
          <p className="view-subtitle">Manage client details, contact directories, and accounts.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-panel glass-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by customer name, email or phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="data-table-panel glass-panel">
        {filteredCustomers.length === 0 ? (
          <div className="empty-state">
            <p>No customers found. Register new clients to get started.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Customer ID</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-info-cell">
                        <User className="text-secondary" size={14} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }} />
                        <strong className="customer-name">{customer.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        <Mail className="text-muted" size={12} style={{ marginRight: '6px' }} />
                        <code>{customer.email}</code>
                      </div>
                    </td>
                    <td>
                      <div className="phone-cell">
                        <Phone className="text-muted" size={12} style={{ marginRight: '6px' }} />
                        <span>{customer.phone}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-secondary">#{customer.id}</span></td>
                    <td className="actions-col">
                      <button 
                        className="btn-icon-danger" 
                        title="Delete Customer"
                        onClick={() => handleDelete(customer.id, customer.name)}
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container glass-panel animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">Register New Customer</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Sarah Connor"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="e.g., sarah.connor@sky.net"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="text" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="e.g., +1 (555) 321-4567"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
