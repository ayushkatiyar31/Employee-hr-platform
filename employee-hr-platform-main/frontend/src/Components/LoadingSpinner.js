import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="loading-container d-flex flex-column justify-content-center align-items-center">
            <div className="modern-spinner mb-3">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <p className="loading-text text-white">{message}</p>
        </div>
    );
};

export const TableSkeleton = () => {
    return (
        <div className="modern-table">
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead>
                        <tr>
                            {['Name', 'Email', 'Phone', 'Department', 'Actions'].map((header, i) => (
                                <th key={i} className="text-center">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td className="text-center">
                                    <div className="d-flex align-items-center">
                                        <div className="skeleton-avatar me-3"></div>
                                        <div className="skeleton-text" style={{ width: '120px' }}></div>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="skeleton-text" style={{ width: '150px', margin: '0 auto' }}></div>
                                </td>
                                <td className="text-center">
                                    <div className="skeleton-text" style={{ width: '100px', margin: '0 auto' }}></div>
                                </td>
                                <td className="text-center">
                                    <div className="skeleton-badge" style={{ width: '80px', margin: '0 auto' }}></div>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-2">
                                        <div className="skeleton-button"></div>
                                        <div className="skeleton-button"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoadingSpinner;