import React from 'react';
import { Package, Users, ShoppingCart, AlertTriangle, ArrowRight, Eye } from 'lucide-react';

export default function Dashboard({ stats, onNavigate, onViewOrder }) {
  if (!stats) {
    return <div className="loading-container"><div className="spinner"></div><p>Loading Dashboard...</p></div>;
  }

  const {
    total_products,
    total_customers,
    total_orders,
    low_stock_products_count,
    low_stock_products = [],
    recent_orders = []
  } = stats;

  const kpis = [
    {
      title: 'Total Products',
      value: total_products,
      icon: <Package className="kpi-icon" />,
      color: 'cyan',
      tab: 'products'
    },
    {
      title: 'Total Customers',
      value: total_customers,
      icon: <Users className="kpi-icon" />,
      color: 'purple',
      tab: 'customers'
    },
    {
      title: 'Total Orders',
      value: total_orders,
      icon: <ShoppingCart className="kpi-icon" />,
      color: 'emerald',
      tab: 'orders'
    },
    {
      title: 'Low Stock Items',
      value: low_stock_products_count,
      icon: <AlertTriangle className="kpi-icon" />,
      color: 'amber',
      warning: low_stock_products_count > 0,
      tab: 'products'
    }
  ];

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="view-header">
        <div>
          <h1 className="view-title">Enterprise Dashboard</h1>
          <p className="view-subtitle">Real-time overview of products, orders, and customer activity.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className={`kpi-card ${kpi.color} ${kpi.warning ? 'pulse-warning' : ''}`}
            onClick={() => onNavigate(kpi.tab)}
          >
            <div className="kpi-card-content">
              <span className="kpi-title">{kpi.title}</span>
              <span className="kpi-value">{kpi.value}</span>
            </div>
            <div className="kpi-icon-wrapper">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sections Grid */}
      <div className="dashboard-grid">
        {/* Low Stock Panel */}
        <div className="dashboard-panel glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <AlertTriangle className="panel-title-icon text-warning" size={18} />
              Low Stock Warnings (<span className="text-warning">{low_stock_products_count}</span>)
            </h2>
            <button className="panel-header-action" onClick={() => onNavigate('products')}>
              Manage Stock <ArrowRight size={14} />
            </button>
          </div>
          <div className="panel-body">
            {low_stock_products.length === 0 ? (
              <div className="empty-panel-state">
                <p>All products are sufficiently stocked. Nice job!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {low_stock_products.map((product) => (
                      <tr key={product.id} className="low-stock-row">
                        <td><strong>{product.name}</strong></td>
                        <td><code>{product.sku}</code></td>
                        <td className="stock-level warning">
                          {product.quantity} left
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Panel */}
        <div className="dashboard-panel glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <ShoppingCart className="panel-title-icon text-emerald" size={18} />
              Recent Orders
            </h2>
            <button className="panel-header-action" onClick={() => onNavigate('orders')}>
              All Orders <ArrowRight size={14} />
            </button>
          </div>
          <div className="panel-body">
            {recent_orders.length === 0 ? (
              <div className="empty-panel-state">
                <p>No orders have been placed yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_orders.map((order) => (
                      <tr key={order.id}>
                        <td>#ORD-{order.id}</td>
                        <td>{order.customer_name}</td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="amount-col">${order.total_amount.toFixed(2)}</td>
                        <td>
                          <button 
                            className="btn-icon-secondary"
                            title="View Details"
                            onClick={() => onViewOrder(order.id)}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
