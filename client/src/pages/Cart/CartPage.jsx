import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CartItem from '../../components/CartItem';
import SummaryCard from '../../components/SummaryCard';
import { FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

const CartPage = () => {
    const { user, logout } = useAuth();
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');

    // Setup Axios defaults for token
    useEffect(() => {
        if (user?.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
    }, [user]);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/api/cart');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch items', err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []); // Run once on mount

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;
        try {
            const res = await axios.post('/api/cart', {
                name: newItemName,
                quantity: 1,
                price: 0
            });
            setItems([...items, res.data]);
            setNewItemName('');
        } catch (err) {
            console.error('Failed to add item', err);
        }
    };

    const handleUpdateItem = async (id, updates) => {
        try {
            // Optimistic update
            setItems(items.map(item => item._id === id ? { ...item, ...updates } : item));

            await axios.put(`/api/cart/${id}`, updates);
        } catch (err) {
            console.error('Failed to update item', err);
            fetchItems(); // Revert on error
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`/api/cart/${id}`);
            setItems(items.filter(item => item._id !== id));
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    const handleClearAll = async () => {
        try {
            await axios.delete('/api/cart');
            setItems([]);
        } catch (err) {
            console.error('Failed to clear cart', err);
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <header className="glass-card" style={{ padding: '15px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaShoppingCart size={24} color="var(--primary)" />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Shopping Cart</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Welcome, {user?.username}</span>
                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Logout">
                        <FaSignOutAlt size={18} />
                    </button>
                </div>
            </header>

            {/* Add Item Row */}
            <div className="glass-card" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Enter item name..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button className="button-primary" onClick={handleAddItem} style={{ whiteSpace: 'nowrap' }}>
                    Add Item
                </button>
            </div>

            {/* Item List */}
            <div style={{ marginBottom: '100px' }}> {/* Space for summary if fixed, but summary is inline here for mobile flow */}
                {items.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-dark)' }}>Your cart is empty</h3>
                        <p style={{ color: 'var(--text-gray)' }}>Add items to get started</p>
                    </div>
                ) : (
                    items.map(item => (
                        <CartItem
                            key={item._id}
                            item={item}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteItem}
                        />
                    ))
                )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
                <SummaryCard items={items} onClear={handleClearAll} />
            )}
        </div>
    );
};

export default CartPage;
