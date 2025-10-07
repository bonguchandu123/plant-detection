import React, { useState } from 'react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import crop from '../assets/cropimg.png';

const AuthPage = () => {
  const { login, register, error: authError } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'farmer',
    language_preference: 'telugu',
    village: '',
    district: '',
    state: 'Andhra Pradesh',
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(loginForm.identifier, loginForm.password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      } else {
        setLoginForm({ identifier: '', password: '' });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (registerForm.phone.length < 10) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await register(registerForm);
      if (!result.success) {
        setError(result.error || 'Registration failed');
      } else {
        setRegisterForm({
          name: '',
          phone: '',
          email: '',
          password: '',
          role: 'farmer',
          language_preference: 'telugu',
          village: '',
          district: '',
          state: 'Andhra Pradesh',
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* 🌿 Left Section (Image) */}
     <div
  className="flex w-full lg:w-1/2 h-64 lg:h-auto bg-cover bg-center relative"
  style={{
    backgroundImage: `url(${crop})`,
  }}
>
  <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 to-emerald-800/70"></div>
  <div className="relative flex flex-col justify-center items-center text-white px-10 h-full">
    <Leaf className="w-20 h-20 mb-6 text-emerald-300" />
    <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-center">
      Tribal Organic Advisory
    </h1>
    <p className="text-lg text-center max-w-md">
      Empowering farmers with AI-driven crop analysis and traditional organic wisdom
    </p>
  </div>
</div>

      {/* 🌾 Right Section (Existing Auth Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tribal Organic Advisory
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {(error || authError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error || authError}</p>
            </div>
          )}

          {isLogin ? (
            // LOGIN FORM
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="text"
                name="identifier"
                placeholder="Phone Number or Email"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            // REGISTER FORM
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={registerForm.name}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={registerForm.phone}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email (Optional)"
                value={registerForm.email}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />

              <input
                type="password"
                name="password"
                placeholder="Password *"
                value={registerForm.password}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                minLength={6}
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="village"
                  placeholder="Village"
                  value={registerForm.village}
                  onChange={handleRegisterChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={registerForm.district}
                  onChange={handleRegisterChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <select
                name="state"
                value={registerForm.state}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Telangana">Telangana</option>
                <option value="Odisha">Odisha</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Jharkhand">Jharkhand</option>
              </select>

              <select
                name="language_preference"
                value={registerForm.language_preference}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="telugu">Telugu</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="oriya">Oriya</option>
              </select>

              <select
                name="role"
                value={registerForm.role}
                onChange={handleRegisterChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="farmer">Farmer</option>
                <option value="specialist">Agricultural Specialist</option>
              </select>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-green-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
