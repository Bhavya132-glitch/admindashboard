const SummaryCard = ({ items, onClear }) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueProducts = items.length;
    const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleClear = () => {
        if (window.confirm('Are you sure you want to clear the cart?')) {
            onClear();
        }
    };

    return (
        <div className="glass-card" style={{ padding: '20px', marginTop: '20px', background: 'white' }}> {/* White background as requested */}
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Summary</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-gray)' }}>Total Items</span>
                <span style={{ fontWeight: '600' }}>{totalItems}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-gray)' }}>Unique Products</span>
                <span style={{ fontWeight: '600' }}>{uniqueProducts}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>Total Price</span>
                <span>₹{totalPrice.toLocaleString()}</span>
            </div>

            <button
                onClick={handleClear}
                style={{
                    width: '100%',
                    padding: '12px',
                    background: 'white',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.target.style.background = 'var(--danger)'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = 'var(--danger)'; }}
            >
                Clear All
            </button>
        </div>
    );
};

export default SummaryCard;
