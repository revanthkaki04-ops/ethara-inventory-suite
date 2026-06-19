import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, Bell } from 'lucide-react';
import { api } from './utils/api';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Notification from './components/Notification';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // High-level navigation helper to open details modal in Orders tab
  const [orderToView, setOrderToView] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodData, custData, ordData, statsData] = await Promise.all([
        api.getProducts(),
        api.getCustomers(),
        api.getOrders(),
        api.getStats()
      ]);
      setProducts(prodData);
      setCustomers(custData);
      setOrders(ordData);
      setStats(statsData);
    } catch (err) {
      setNotification({ message: `Failed to sync data: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // --- Product Handler Actions ---
  const handleCreateProduct = async (productData) => {
    try {
      const newProd = await api.createProduct(productData);
      triggerNotification(`Product "${newProd.name}" successfully created.`, 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateProduct = async (id, productData) => {
    try {
      const updated = await api.updateProduct(id, productData);
      triggerNotification(`Product "${updated.name}" successfully updated.`, 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      triggerNotification('Product successfully deleted from catalog.', 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  // --- Customer Handler Actions ---
  const handleCreateCustomer = async (customerData) => {
    try {
      const newCust = await api.createCustomer(customerData);
      triggerNotification(`Customer "${newCust.name}" successfully registered.`, 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await api.deleteCustomer(id);
      triggerNotification('Customer account deleted successfully.', 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  // --- Order Handler Actions ---
  const handleCreateOrder = async (orderData) => {
    try {
      const newOrder = await api.createOrder(orderData);
      triggerNotification(`Order #ORD-${newOrder.id} placed successfully. Stock reduced.`, 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await api.deleteOrder(id);
      triggerNotification(`Order #ORD-${id} cancelled. Product stock restored.`, 'success');
      await fetchData();
    } catch (err) {
      triggerNotification(err.message, 'error');
      throw err;
    }
  };

  // Open order details directly from Dashboard click
  const handleViewOrderFromDashboard = (orderId) => {
    const matchedOrder = orders.find(o => o.id === orderId);
    if (matchedOrder) {
      setOrderToView(matchedOrder);
      setCurrentTab('orders');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">💎</div>
          <div className="brand-info">
            <span className="brand-name">Ethara.AI</span>
            <span className="brand-tag">Inventory Suite</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentTab(item.id);
                // Reset order view override when switching tabs manually
                if (item.id !== 'orders') setOrderToView(null);
              }}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="user-name">Admin Console</span>
              <span className="user-role">System Operator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="app-main">
        {/* Top Header */}
        <header className="app-header glass-panel">
          <div className="header-search">
            <span className="header-status-indicator">
              <span className="dot online"></span>
              Live Sync Active
            </span>
          </div>
          <div className="header-actions">
            <button 
              className="btn-icon-secondary btn-header-reload" 
              title="Force Database Sync"
              onClick={fetchData}
              disabled={loading}
            >
              <Bell size={16} className={loading ? 'pulse-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="app-content-body">
          {loading && !stats ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Establishing database handshake...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard 
                  stats={stats} 
                  onNavigate={setCurrentTab} 
                  onViewOrder={handleViewOrderFromDashboard} 
                />
              )}
              {currentTab === 'products' && (
                <Products 
                  products={products} 
                  onCreate={handleCreateProduct} 
                  onUpdate={handleUpdateProduct} 
                  onDelete={handleDeleteProduct} 
                  setNotification={setNotification} 
                />
              )}
              {currentTab === 'customers' && (
                <Customers 
                  customers={customers} 
                  onCreate={handleCreateCustomer} 
                  onDelete={handleDeleteCustomer} 
                  setNotification={setNotification} 
                />
              )}
              {currentTab === 'orders' && (
                <Orders 
                  orders={orders} 
                  products={products} 
                  customers={customers} 
                  onCreate={handleCreateOrder} 
                  onDelete={handleDeleteOrder} 
                  setNotification={setNotification} 
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </div>
  );
}
