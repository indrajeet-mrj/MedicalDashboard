import React, { useState } from 'react';
import axios from 'axios';
import { FaClinicMedical, FaLock, FaEnvelope, FaUser, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Import Toast

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ storeName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const API_URL = 'https://medicaldashboard-2556.onrender.com/api/auth'; 

    try {
      const config = { timeout: 120000 };

      if (isRegister) {
        await axios.post(`${API_URL}/register`, formData, config);
        toast.success('🎉 Registration Successful! Please Login.');
        setIsRegister(false);
      } else {
        const res = await axios.post(`${API_URL}/login`, { email: formData.email, password: formData.password }, config);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('storeName', res.data.storeName);
        toast.success(`👋 Welcome back, ${res.data.storeName}!`);
        onLogin();
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.warning("Server is waking up. Please try again in 10s.");
      } else {
        toast.error(err.response?.data?.error || "Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
        <div className="text-center mb-8">
          <FaClinicMedical className="text-5xl text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">MediStock</h1>
          <p className="text-gray-400">Pharmacy Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="relative">
              <FaUser className="absolute left-3 top-4 text-gray-500"/>
              <input type="text" name="storeName" placeholder="Medical Store Name" value={formData.storeName} onChange={handleChange} className="w-full p-3 pl-10 glass-input rounded-lg outline-none text-white" required />
            </div>
          )}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-4 text-gray-500"/>
            <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-3 pl-10 glass-input rounded-lg outline-none text-white" required />
          </div>
          <div className="relative">
            <FaLock className="absolute left-3 top-4 text-gray-500"/>
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 pl-10 glass-input rounded-lg outline-none text-white" required />
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 font-bold rounded-lg transition shadow-[0_0_15px_#2563eb] flex justify-center items-center ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
            {loading ? <><FaSpinner className="animate-spin mr-2" /> Connecting...</> : (isRegister ? 'Register Store' : 'Login')}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          {isRegister ? "Already have an account?" : "New here?"} 
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-400 hover:text-blue-300 ml-2 underline font-bold">{isRegister ? "Login" : "Create Account"}</button>
        </p>
      </div>
    </div>
  );
};
export default Auth;