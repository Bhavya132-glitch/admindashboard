import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ name: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await login(formData.name, formData.password);
        if (res.success) {
            navigate('/cart');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="glass-card container" style={{ maxWidth: '400px', padding: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Username</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your username"
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-gray)' }}>Password</label>
                    <input
                        type="password"
                        className="input-field"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" className="button-primary" style={{ marginTop: '10px' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
