import { useState, useEffect } from 'react';
import EventCard from './EventCard.jsx';
import { getUpcomingEvents, getUpcomingEventsByCategory } from '../services/api.js';
import SearchBar from './SearchBar.jsx';
import api from '../services/api.js';

// Categories for the filter pills
const CATEGORIES = ['All', 'Music', 'Art', 'Food', 'Culture', 'Dance', 'Film', 'Fashion'];

// EventGrid — Pinterest-style discovery grid with category filters
const EventGrid = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchEvents(activeCategory);
    }, [activeCategory]);

    const fetchEvents = (category) => {
        setLoading(true);
        const call = category === 'All'
            ? getUpcomingEvents()
            : getUpcomingEventsByCategory(category);

        call
            .then(res => {
                setEvents(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const handleSearch = (keyword) => {
        setIsSearching(true);
        setLoading(true);
        api.get(`/events/search?keyword=${keyword}`)
            .then(res => {
                setSearchResults(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleClear = () => {
        setIsSearching(false);
        setSearchResults(null);
        fetchEvents(activeCategory);
    };

    return (
        <div style={styles.container}>

            <SearchBar onSearch={handleSearch} onClear={handleClear} />

            {/* Section header */}
            <div style={styles.header}>
                <h2 style={styles.title}>Discover near you</h2>
                <p style={styles.subtitle}>Handpicked events happening in Dallas</p>
            </div>

            {/* Category filter pills */}
            <div style={styles.filters}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        style={{
                            ...styles.pill,
                            ...(activeCategory === cat ? styles.pillActive : {}),
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={styles.loading}>Loading events...</p>
            ) : isSearching && searchResults !== null ? (
                searchResults.length === 0 ? (
                    <p style={styles.loading}>No events found for your search.</p>
                ) : (
                    <div style={styles.grid}>
                        {searchResults.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )
            ) : events.length === 0 ? (
                <p style={styles.loading}>No events found in this category.</p>
            ) : (
                <div style={styles.grid}>
                    {events.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}

        </div>
    );
};

const styles = {
    container: {
        padding: '28px 32px',
        backgroundColor: '#F5EBE0',
    },
    header: {
        marginBottom: '20px',
    },
    title: {
        fontSize: '18px',
        fontWeight: '500',
        color: '#3D2B1F',
        marginBottom: '4px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#8B6A56',
    },
    filters: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '24px',
    },
    pill: {
        backgroundColor: '#FFFFFF',
        border: '0.5px solid #D4B8A8',
        borderRadius: '20px',
        padding: '6px 16px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6B4F3A',
        cursor: 'pointer',
    },
    pillActive: {
        backgroundColor: '#1A0F0A',
        borderColor: '#1A0F0A',
        color: '#F5EBE0',
    },
    grid: {
        columns: '4',
        columnGap: '16px',
    },
    loading: {
        fontSize: '13px',
        color: '#8B6A56',
    },
};

export default EventGrid;