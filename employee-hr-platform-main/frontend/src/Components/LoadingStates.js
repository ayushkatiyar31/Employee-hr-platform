import React from 'react';

export const ButtonLoading = ({ loading, children, ...props }) => (
    <button {...props} disabled={loading || props.disabled}>
        {loading ? (
            <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                Loading...
            </>
        ) : children}
    </button>
);

export const TableLoading = () => (
    <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading data...</p>
        </div>
    </div>
);

export const PageLoading = ({ message = "Loading..." }) => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">{message}</p>
        </div>
    </div>
);

export const InlineLoading = ({ size = "sm" }) => (
    <div className={`spinner-border spinner-border-${size} text-primary`} role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
);