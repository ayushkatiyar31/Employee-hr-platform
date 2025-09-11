import React from 'react';

// Shimmer CSS styles
const shimmerStyles = `
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.shimmer-rect {
  border-radius: 8px;
}

.shimmer-circle {
  border-radius: 50%;
}

.shimmer-text {
  border-radius: 4px;
}
`;

// Inject styles
if (!document.getElementById('shimmer-styles')) {
  const style = document.createElement('style');
  style.id = 'shimmer-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}

// Dashboard Shimmer
export const DashboardShimmer = () => (
  <div>
    {/* Stats Grid Shimmer */}
    <div className="stats-grid">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="shimmer-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="shimmer shimmer-text" style={{ width: '60%', height: '16px' }}></div>
            <div className="shimmer shimmer-circle" style={{ width: '48px', height: '48px' }}></div>
          </div>
          <div className="shimmer shimmer-text" style={{ width: '40%', height: '32px', marginBottom: '8px' }}></div>
          <div className="shimmer shimmer-text" style={{ width: '30%', height: '14px' }}></div>
        </div>
      ))}
    </div>

    {/* Quick Actions Shimmer */}
    <div className="quick-actions">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="shimmer-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div className="shimmer shimmer-circle mx-auto mb-3" style={{ width: '48px', height: '48px' }}></div>
          <div className="shimmer shimmer-text mx-auto" style={{ width: '70%', height: '16px' }}></div>
        </div>
      ))}
    </div>

    {/* Recent Activity Shimmer */}
    <div className="shimmer-card">
      <div className="shimmer shimmer-text mb-4" style={{ width: '30%', height: '20px' }}></div>
      {[1, 2, 3].map(i => (
        <div key={i} className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div className="shimmer shimmer-circle me-3" style={{ width: '40px', height: '40px' }}></div>
          <div style={{ flex: 1 }}>
            <div className="shimmer shimmer-text mb-2" style={{ width: '60%', height: '14px' }}></div>
            <div className="shimmer shimmer-text" style={{ width: '40%', height: '12px' }}></div>
          </div>
          <div className="shimmer shimmer-text" style={{ width: '80px', height: '12px' }}></div>
        </div>
      ))}
    </div>
  </div>
);

// Employee Table Shimmer
export const EmployeeTableShimmer = () => (
  <div className="table-container">
    <div className="table-header">
      <div>
        <div className="shimmer shimmer-text mb-2" style={{ width: '200px', height: '20px' }}></div>
        <div className="shimmer shimmer-text" style={{ width: '150px', height: '14px' }}></div>
      </div>
      <div className="d-flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shimmer shimmer-rect" style={{ width: '60px', height: '32px' }}></div>
        ))}
      </div>
    </div>
    
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            {['Name', 'Email', 'Phone', 'Department', 'Status', 'Actions'].map((header, i) => (
              <th key={i} className="text-center">
                <div className="shimmer shimmer-text mx-auto" style={{ width: '80px', height: '16px' }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(row => (
            <tr key={row} className="align-middle">
              <td>
                <div className="d-flex align-items-center">
                  <div className="shimmer shimmer-circle me-3" style={{ width: '40px', height: '40px' }}></div>
                  <div>
                    <div className="shimmer shimmer-text mb-1" style={{ width: '120px', height: '16px' }}></div>
                    <div className="shimmer shimmer-text" style={{ width: '80px', height: '12px' }}></div>
                  </div>
                </div>
              </td>
              <td>
                <div className="shimmer shimmer-text mx-auto" style={{ width: '150px', height: '14px' }}></div>
              </td>
              <td>
                <div className="shimmer shimmer-text mx-auto" style={{ width: '120px', height: '14px' }}></div>
              </td>
              <td>
                <div className="shimmer shimmer-rect mx-auto" style={{ width: '80px', height: '24px' }}></div>
              </td>
              <td>
                <div className="shimmer shimmer-rect mx-auto" style={{ width: '60px', height: '20px' }}></div>
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <div className="shimmer shimmer-rect" style={{ width: '32px', height: '32px' }}></div>
                  <div className="shimmer shimmer-rect" style={{ width: '32px', height: '32px' }}></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Generic Card Shimmer
export const CardShimmer = ({ rows = 3 }) => (
  <div className="shimmer-card">
    <div className="shimmer shimmer-text mb-4" style={{ width: '40%', height: '20px' }}></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="mb-3">
        <div className="shimmer shimmer-text mb-2" style={{ width: '100%', height: '16px' }}></div>
        <div className="shimmer shimmer-text" style={{ width: '70%', height: '14px' }}></div>
      </div>
    ))}
  </div>
);

// List Shimmer
export const ListShimmer = ({ items = 5 }) => (
  <div className="shimmer-card">
    <div className="shimmer shimmer-text mb-4" style={{ width: '30%', height: '20px' }}></div>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: i < items - 1 ? '1px solid #e2e8f0' : 'none' }}>
        <div className="shimmer shimmer-circle me-3" style={{ width: '32px', height: '32px' }}></div>
        <div style={{ flex: 1 }}>
          <div className="shimmer shimmer-text mb-1" style={{ width: '60%', height: '14px' }}></div>
          <div className="shimmer shimmer-text" style={{ width: '40%', height: '12px' }}></div>
        </div>
        <div className="shimmer shimmer-rect" style={{ width: '60px', height: '24px' }}></div>
      </div>
    ))}
  </div>
);
