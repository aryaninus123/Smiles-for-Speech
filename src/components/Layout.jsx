import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
    return (
        <div style={{background: '#f5f5f5' }}>
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    );
}

export default Layout; 