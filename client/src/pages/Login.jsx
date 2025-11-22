import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data);

      const role = res.data.user.role;

      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor-dashboard');   // ⭐ تم الإصلاح هنا
      else navigate('/dashboard');

    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Login failed.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 pt-20">

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl p-10 w-full max-w-md border border-white/20">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block mb-1 font-medium text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg 
              bg-white/60 text-black focus:outline-none focus:border-white"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg 
              bg-white/60 text-black focus:outline-none focus:border-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-white">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-semibold underline">
            Register
          </Link>
        </p>

        <p className="mt-3 text-sm text-center">
          <Link to="/forgot-password" className="text-white underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}