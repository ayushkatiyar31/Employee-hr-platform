import React from 'react';

const ConfirmDialog = ({ show, title, message, onConfirm = () => {}, onCancel = () => {}, type = 'danger' }) => {
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return 'bi-exclamation-triangle text-danger';
            case 'warning': return 'bi-exclamation-circle text-warning';
            case 'info': return 'bi-info-circle text-info';
            default: return 'bi-question-circle text-primary';
        }
    };

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <div className="mb-4">
                    <i className={`bi ${getIcon()} mb-3`} style={{ fontSize: '4rem', filter: 'brightness(1.3)' }}></i>
                    <h4 className="mb-3">{title}</h4>
                    <p style={{ color: '#ffffff' }}>{message}</p>
                </div>
                <div className="d-flex justify-content-center gap-3">
                    <button 
                        className="btn btn-outline-secondary px-4"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        className={`btn btn-${type} px-4`}
                        onClick={onConfirm}
                    >
                        {type === 'danger' ? 'Delete' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
