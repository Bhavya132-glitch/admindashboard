import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { FaArrowLeft, FaHistory } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Setup Axios defaults for token
    useEffect(() => {
        if (user?.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/history');
            setHistory(res.data);
            setFilteredHistory(res.data);
        } catch (err) {
            console.error('Failed to fetch history', err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredHistory(history);
        } else {
            const lowerQ = searchQuery.toLowerCase();
            setFilteredHistory(history.filter(item => item.query.toLowerCase().includes(lowerQ)));
        }
    }, [searchQuery, history]);

    return (
        <div className="container">
            <header className="glass-card" style={{ padding: '15px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                    <FaArrowLeft size={20} />
                </button>
                <FaHistory size={24} color="var(--primary)" />
                <h1 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Search History</h1>
            </header>

            {/* Search Box */}
            <div className="glass-card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '0', flex: 1 }}
                />
            </div>

            <div className="glass-card" style={{ padding: '20px', minHeight: '300px' }}>
                {filteredHistory.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-gray)' }}>
                        {history.length === 0 ? "No history yet." : "No matching history found."}
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none' }}>
                        {filteredHistory.map((item) => (
                            <li key={item._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: '500' }}>{item.query}</span>
                                <span style={{ color: 'var(--text-gray)', fontSize: '0.85rem' }}>
                                    {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;
