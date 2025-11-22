import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    try {
      await api.post('/auth/register', { name, email, phone, password });
      setMessage('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError('Registration failed.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4 pt-20">
      <div className="bg-white shadow-large rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-dark mb-6 text-center">Create Account</h1>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-3 text-center">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg bg-light focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg bg-light focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg bg-light focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg bg-light focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-3 border rounded-lg bg-light focus:outline-none focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-accent transition"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-dark">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}