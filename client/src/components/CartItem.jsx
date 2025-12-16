import { useState, useEffect } from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartItem = ({ item, onUpdate, onDelete }) => {
    const [price, setPrice] = useState(item.price);

    // Update local state when prop changes
    useEffect(() => {
        setPrice(item.price);
    }, [item.price]);

    const handlePriceChange = (e) => {
        const val = parseFloat(e.target.value);
        setPrice(val);
        onUpdate(item._id, { price: val });
    };

    const handleQtyChange = (delta) => {
        const newQty = item.quantity + delta;
        if (newQty > 0) {
            onUpdate(item._id, { quantity: newQty });
        }
    };

    return (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{item.name}</h3>
                <button
                    onClick={() => onDelete(item._id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1.1rem' }}
                    title="Remove Item"
                >
                    <FaTrash />
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', padding: '5px' }}>
                    <button
                        onClick={() => handleQtyChange(-1)}
                        style={{ border: 'none', background: 'var(--danger)', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaMinus size={10} />
                    </button>
                    <span style={{ margin: '0 15px', fontWeight: '600' }}>{item.quantity}</span>
                    <button
                        onClick={() => handleQtyChange(1)}
                        style={{ border: 'none', background: 'var(--success)', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaPlus size={10} />
                    </button>
                </div>

                {/* Price Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Price (₹)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={handlePriceChange}
                        className="input-field"
                        style={{ width: '80px', padding: '5px 10px' }}
                        min="0"
                    />
                </div>
            </div>

            {/* Item Total */}
            <div style={{ alignSelf: 'flex-end', fontWeight: '600', color: 'var(--primary)' }}>
                Item Total: ₹{(item.quantity * item.price).toLocaleString()}
            </div>
        </div>
    );
};

export default CartItem;
