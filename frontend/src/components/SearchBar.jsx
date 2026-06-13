import { useState } from 'react';

// SearchBar — searches events by keyword
const SearchBar = ({ onSearch, onClear }) => {
    const [keyword, setKeyword] = useState('');

    const handleSearch = () => {
        if (keyword.trim()) {
            onSearch(keyword.trim());
        }
    };

    const handleClear = () => {
        setKeyword('');
        onClear();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div style={styles.container}>
            <div style={styles.inputRow}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                    style={styles.input}
                    placeholder="Search events, venues, artists..."
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {keyword && (
                    <button style={styles.clearBtn} onClick={handleClear}>✕</button>
                )}
            </div>
            <button style={styles.searchBtn} onClick={handleSearch}>
                Search
            </button>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '24px',
    },
    inputRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '8px',
        padding: '10px 14px',
        flex: 1,
    },
    searchIcon: {
        fontSize: '16px',
        flexShrink: 0,
    },
    input: {
        flex: 1,
        border: 'none',
        outline: 'none',
        fontSize: '14px',
        color: '#3D2B1F',
        backgroundColor: 'transparent',
        fontFamily: 'inherit',
    },
    clearBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '14px',
        color: '#8B6A56',
        cursor: 'pointer',
        padding: '0',
        flexShrink: 0,
    },
    searchBtn: {
        backgroundColor: '#D85A30',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        flexShrink: 0,
    },
};

export default SearchBar;