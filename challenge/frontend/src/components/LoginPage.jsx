/**
 * @fileoverview LoginPage component that handles user authentication for NYC Council Dashboard
 * @module components/LoginPage
 */
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import './../styles/LoginPage.css';

/**
 * Login format for council members:
 * Username format: {first_name_initial}{last_name} (e.g., jsmith)
 * Password format: {last_name}-{district_number} (e.g., smith-1)
 */

/**
 * LoginPage component provides a form interface for council member authentication.
 * On successful login, it stores the auth token in sessionStorage and redirects to dashboard.
 * @example
 * <Route path="/" exact component={LoginPage} />
 */
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  /**
   * Handles form submission for login authentication.
   * Makes a POST request to the login endpoint and handles the authentication response.
   * On success: Stores token in sessionStorage and redirects to dashboard
   * On failure: Displays error message to user
   * 
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   * @throws {Error} If server request fails or returns non-OK response
   * @returns {Promise<void>}
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        history.push('/dashboard');
      } else {
        setError(data.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">NYC Council Dashboard</h2>
          <p className="login-subtitle">
            Please sign in with your council credentials.
          </p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Username (e.g., jdoe)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Password (e.g., doe-1)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Display error message if login unsuccessful */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <p className="login-note">Disclaimer: This is a test demonstration only</p>
      </div>
    </div>
  );
};

export default LoginPage;