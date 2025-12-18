import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CartItem from '../../components/CartItem';
import SummaryCard from '../../components/SummaryCard';
import { FaShoppingCart, FaSignOutAlt, FaHistory, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { user, logout } = useAuth();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const navigate = useNavigate();

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

    // Filter logic
    useEffect(() => {
        if (!searchFilter.trim()) {
            setFilteredItems(items);
        } else {
            const lowerFilter = searchFilter.toLowerCase();
            setFilteredItems(items.filter(item => item.name.toLowerCase().includes(lowerFilter)));
        }
    }, [searchFilter, items]);

    const parseQty = (token) => {
        // Handle fractions like "1/2"
        if (token.includes('/')) {
            const [num, den] = token.split('/');
            return parseFloat(num) / parseFloat(den);
        }
        // Handle "0.5kg", "2kg" - strip non-numeric suffix if present after number
        const numericPart = parseFloat(token);
        return isNaN(numericPart) ? null : numericPart;
    };

    const parseInput = (input) => {
        // Conversational Stop Words
        const STOP_WORDS = new Set(['bro', 'i', 'want', 'need', 'give', 'add', 'just', 'only', 'means', 'that', 'item', 'and', 'please', 'to', 'for', 'a', 'of']);

        // Normalize: lower case, remove punctuation (keeping / and .)
        const cleanInput = input.replace(/[^\w\s\/\.]/g, '').toLowerCase();
        const tokens = cleanInput.split(/\s+/).filter(t => t.trim().length > 0);

        const results = [];
        let currentName = [];
        let pendingQty = null;
        let currentId = null;

        const finalizeItem = () => {
            if (currentName.length > 0) {
                const qty = pendingQty !== null ? pendingQty : 1;

                // Do not add if name is just a stop word
                if (!STOP_WORDS.has(currentName.join(' '))) {
                    results.push({
                        name: currentName.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        quantity: qty,
                        historyId: currentId
                    });
                }

                currentName = [];
                pendingQty = null;
                currentId = null;
            }
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // 1. Check ID (5+ Digits)
            if (/^\d{5,8}$/.test(token)) {
                currentId = token;
                continue;
            }

            // 2. Check for "Name-Qty" hyphenated
            if (token.includes('-')) {
                finalizeItem();
                const parts = token.split('-');
                const possibleQty = parseQty(parts[parts.length - 1]);
                if (possibleQty !== null && parts.length > 1) {
                    const namePart = parts.slice(0, parts.length - 1).join(' ');
                    results.push({ name: namePart, quantity: possibleQty, historyId: currentId });
                    currentId = null;
                    continue;
                }
            }

            // 3. Check for Quantity (Number)
            const qtyVal = parseQty(token);

            if (qtyVal !== null) {
                if (currentName.length > 0) {
                    pendingQty = qtyVal;
                    finalizeItem();
                } else {
                    finalizeItem();
                    pendingQty = qtyVal;
                }
            } else {
                if (STOP_WORDS.has(token)) {
                    if (token === 'and' && currentName.length > 0) {
                        finalizeItem();
                    }
                    continue;
                }
                currentName.push(token);
            }
        }

        finalizeItem();
        return results;
    };

    const handleAddItem = async () => {
        if (!newItemName.trim()) return;

        const parsedItems = parseInput(newItemName);
        console.log('Parsed:', parsedItems);

        // History Logging
        const idsToLog = parsedItems.filter(i => i.historyId).map(i => i.historyId);
        const logContent = idsToLog.length > 0 ? idsToLog.join(', ') : newItemName;

        try {
            await axios.post('/api/history', { query: logContent });
        } catch (hErr) {
            console.error('Failed to save history', hErr);
        }

        const newItemsList = [...items];

        try {
            for (const item of parsedItems) {
                const existingItem = newItemsList.find(i => i.name.toLowerCase() === item.name.toLowerCase());

                if (existingItem) {
                    const newQty = existingItem.quantity + item.quantity;
                    await axios.put(`/api/cart/${existingItem._id}`, { quantity: newQty });
                    existingItem.quantity = newQty;
                } else {
                    const res = await axios.post('/api/cart', {
                        name: item.name,
                        quantity: item.quantity,
                        price: 0
                    });
                    newItemsList.push(res.data);
                }
            }

            setItems(newItemsList);
            await fetchItems();
            setNewItemName('');
        } catch (err) {
            console.error('Failed to process items', err);
            await fetchItems();
        }
    };

    // ...

    const handleUpdateItem = async (id, updates) => {
        try {
            setItems(items.map(item => item._id === id ? { ...item, ...updates } : item));
            await axios.put(`/api/cart/${id}`, updates);
        } catch (err) {
            console.error('Failed to update item', err);
            fetchItems();
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`/api/cart/${id}`);
            const newItems = items.filter(item => item._id !== id);
            setItems(newItems);
        } catch (err) {
            console.error('Failed to delete item', err);
        }
    };

    const handleClearAll = async () => {
        try {
            // Clear Cart
            await axios.delete('/api/cart');
            // Clear History
            await axios.delete('/api/history');
            setItems([]);
        } catch (err) {
            console.error('Failed to clear data', err);
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <header className="glass-card" style={{ padding: '15px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaShoppingCart size={24} color="var(--primary)" />
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Outdoor Delivery</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={() => navigate('/history')}
                        className="button-primary"
                        style={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(107, 70, 193, 0.4)'
                        }}
                    >
                        <FaHistory /> History
                    </button>

                    <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Logout">
                        <FaSignOutAlt size={20} />
                    </button>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>{user?.username}</span>
                </div>
            </header>

            {/* Controls Row: Search Filter & Add Item */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>

                {/* Search Filter Box */}
                <div className="glass-card" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaSearch color="var(--text-gray)" />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search items in cart..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: '0' }}
                    />
                </div>

                {/* Add Item Row */}
                <div className="glass-card" style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Add items (e.g. Rice 1/2kg, Milk 12345)..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                        style={{ flex: 1 }}
                    />
                    <button
                        className="button-primary"
                        onClick={handleAddItem}
                        title="Search & Add"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '50%', width: '40px', height: '40px', justifyContent: 'center', padding: 0 }}
                    >
                        <span style={{ fontSize: '1.5rem', lineHeight: '1' }}>+</span>
                    </button>
                </div>
            </div>

            {/* Item List */}
            <div style={{ marginBottom: '100px' }}>
                {filteredItems.length === 0 ? (
                    <div className="glass-card" style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white' }}>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-dark)' }}>
                            {items.length === 0 ? "Your cart is empty" : "No items match your search"}
                        </h3>
                        {items.length === 0 && <p style={{ color: 'var(--text-gray)' }}>Add items to get started</p>}
                    </div>
                ) : (
                    filteredItems.map(item => (
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
