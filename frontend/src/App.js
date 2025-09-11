import React from 'react';
import './App.css';
import './index.css';
import SimpleApp from './Components/SimpleApp';
import ErrorBoundary from './Components/ErrorBoundary';
import { AuthProvider } from './Components/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <div className="App">
          <SimpleApp />
        </div>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;