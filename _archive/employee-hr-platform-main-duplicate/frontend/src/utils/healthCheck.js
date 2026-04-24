const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            return { status: 'healthy', data };
        } else {
            return { status: 'unhealthy', error: `HTTP ${response.status}` };
        }
    } catch (error) {
        return { 
            status: 'error', 
            error: error.message.includes('Failed to fetch') 
                ? 'Backend server is not running' 
                : error.message 
        };
    }
};

export const testAuthentication = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { status: 'no_token', error: 'No authentication token found' };
    }

    try {
        const response = await fetch(`${BASE_URL}/api/employees?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            return { status: 'invalid_token', error: 'Authentication token is invalid or expired' };
        }

        if (response.ok) {
            return { status: 'authenticated' };
        }

        return { status: 'error', error: `HTTP ${response.status}` };
    } catch (error) {
        return { status: 'error', error: error.message };
    }
};