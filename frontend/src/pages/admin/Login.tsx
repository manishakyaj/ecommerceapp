import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [secret, setSecret] = useState('');
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem('ADMIN_SECRET', secret);
    navigate('/admin/categories');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Admin Login</h1>
      <input value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Admin Secret" className="border p-2 mr-2" />
      <button onClick={login} className="bg-blue-600 text-white px-3 py-2">Login</button>
    </div>
  );
};

export default AdminLogin;
