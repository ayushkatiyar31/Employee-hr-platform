const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json'
    };
};

const getAuthHeadersForFormData = () => {
    return {};
};

const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

const sanitizeForLog = (input) => {
    if (typeof input !== 'string') return String(input);
    return input.replace(/[\r\n\t]/g, ' ').replace(/[<>]/g, '').substring(0, 200);
};

const retryApiCall = async (apiCall, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === retries - 1) throw error;
            if (error.message && error.message.includes('Failed to fetch')) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            } else {
                throw error;
            }
        }
    }
};

const handleApiError = (error, operation) => {
    console.error(`API Error in ${sanitizeForLog(operation)}:`, {
        message: sanitizeForLog(error.message || 'Unknown error'),
        status: error.status
    });
    if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if backend is running.');
    }
    throw error;
};

export const GetAllEmployees = async (search = '', page = 1, limit = 100) => {
    return retryApiCall(async () => {
        const url = `${BASE_URL}/api/employees?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.employees) {
            return {
                employees: result.data.employees,
                pagination: result.data.pagination || {
                    currentPage: 1,
                    pageSize: limit,
                    totalEmployees: result.data.employees.length,
                    totalPages: 1
                }
            };
        }
        
        return {
            employees: [],
            pagination: {
                currentPage: 1,
                pageSize: limit,
                totalEmployees: 0,
                totalPages: 0
            }
        };
    }).catch(error => {
        handleApiError(error, 'GetAllEmployees');
        return {
            employees: [],
            pagination: {
                currentPage: 1,
                pageSize: limit,
                totalEmployees: 0,
                totalPages: 0
            }
        };
    });
};

export const GetEmployeeDetailsById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || data;
    } catch (error) {
        handleApiError(error, 'GetEmployeeDetailsById');
        return null;
    }
};

export const DeleteEmployeeById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/api/employees/${id}`, { 
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        handleApiError(error, 'DeleteEmployeeById');
        throw error;
    }
};

export const CreateEmployee = async (empObj) => {
    try {
        const formData = new FormData();
        
        for (const key in empObj) {
            if (empObj[key] !== null && empObj[key] !== undefined) {
                formData.append(key, empObj[key]);
            }
        }
        
        const response = await fetch(`${BASE_URL}/api/employees`, {
            method: 'POST',
            headers: getAuthHeadersForFormData(),
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'CreateEmployee');
        throw error;
    }
};

export const UpdateEmployeeById = async (empObj, id) => {
    try {
        const formData = new FormData();
        
        for (const key in empObj) {
            if (empObj[key] !== null && empObj[key] !== undefined) {
                formData.append(key, empObj[key]);
            }
        }
        
        const response = await fetch(`${BASE_URL}/api/employees/${id}`, {
            method: 'PUT',
            headers: getAuthHeadersForFormData(),
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'UpdateEmployeeById');
        throw error;
    }
};

// Leave Management API Functions
export const GetAllLeaves = async (status = '', employeeId = '') => {
    try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (employeeId) params.append('employeeId', employeeId);
        
        const url = `${BASE_URL}/api/leaves?${params.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.leaves || [];
    } catch (error) {
        handleApiError(error, 'GetAllLeaves');
        return [];
    }
};

export const CreateLeave = async (leaveData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/leaves`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(leaveData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'CreateLeave');
        throw error;
    }
};

export const UpdateLeaveStatus = async (leaveId, status, approvedBy = '') => {
    try {
        const response = await fetch(`${BASE_URL}/api/leaves/${leaveId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, approvedBy })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'UpdateLeaveStatus');
        throw error;
    }
};

export const DeleteLeave = async (leaveId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/leaves/${leaveId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'DeleteLeave');
        throw error;
    }
};

// Department Management API Functions
export const GetAllDepartments = async () => {
    return retryApiCall(async () => {
        const response = await fetch(`${BASE_URL}/api/departments`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || result.departments || [];
    }).catch(error => {
        handleApiError(error, 'GetAllDepartments');
        return [];
    });
};

export const CreateDepartment = async (departmentData) => {
    try {
        const response = await fetch(`${BASE_URL}/api/departments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(departmentData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'CreateDepartment');
        throw error;
    }
};

export const DeleteDepartment = async (departmentId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/departments/${departmentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error, 'DeleteDepartment');
        throw error;
    }
};

export const GetDepartmentStats = async () => {
    return retryApiCall(async () => {
        const response = await fetch(`${BASE_URL}/api/departments/stats`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || result;
    }).catch(error => {
        handleApiError(error, 'GetDepartmentStats');
        return { totalDepartments: 0, totalEmployees: 0, totalBudget: 0 };
    });
};