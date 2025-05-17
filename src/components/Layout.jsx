import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
}

export default Layout; 