import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: true
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        const bootstrapAuth = async () => {
            if (storedUser && storedToken) {
                try {
                    JSON.parse(storedUser);
                    const response = await authApi.me();
                    localStorage.setItem('user', JSON.stringify(response.data));
                    dispatch({
                        type: 'LOGIN',
                        payload: {
                            user: response.data,
                            token: storedToken
                        }
                    });
                    return;
                } catch (error) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }

            dispatch({ type: 'SET_LOADING', payload: false });
        };

        bootstrapAuth();
    }, []);

    const login = (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        dispatch({
            type: 'LOGIN',
            payload: { user, token }
        });
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.clear();
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{
            ...state,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
