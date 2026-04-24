export const testAuth = async () => {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    if (!token) {
        console.log('No token found - need to login');
        return false;
    }
    
    try {
        const response = await fetch('http://localhost:5000/api/employees?limit=1', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Auth test response:', response.status);
        
        if (response.status === 401) {
            console.log('Token is invalid - clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
        
        return response.ok;
    } catch (error) {
        console.log('Auth test error:', error.message);
        return false;
    }
};

// Run this in browser console to test
window.testAuth = testAuth;