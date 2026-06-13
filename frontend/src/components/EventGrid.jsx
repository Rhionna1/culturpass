import { useState, useEffect } from 'react';
import EventCard from './EventCard.jsx';
import SearchBar from './SearchBar.jsx';
import { getUpcomingEvents, getUpcomingEventsByCategory } from '../services/api.js';
import api from '../services/api.js';

// Categories available for filtering events
const CATEGORIES = ['All', 'Music', 'Art', 'Food', 'Fashion', 'Culture', 'Dance', 'Film'];

// EventGrid — Pinterest-style discovery grid with category filters and search
const EventGrid = () => {
    // State for the list of events to display
    const [events, setEvents] = useState([]);
    // State for loading indicator
    const [loading, setLoading] = useState(true);
    // State for the currently selected category filter
    const [activeCategory, setActiveCategory] = useState('All');
    // State for search results — null means no search has been performed
    const [searchResults, setSearchResults] = useState(null);
    // State to track whether the user is in search mode
    const [isSearching, setIsSearching] = useState(false);

    // Fetch events whenever the active category changes
    useEffect(() => {
        fetchEvents(activeCategory);
    }, [activeCategory]);

    // Fetches events based on the selected category
    const fetchEvents = (category) => {
        setLoading(true);
        // If All is selected fetch all upcoming events, otherwise filter by category
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

    // Handles keyword search — calls the search endpoint and stores results
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

    // Clears the search and returns to the normal category view
    const handleClear = () => {
        setIsSearching(false);
        setSearchResults(null);
        fetchEvents(activeCategory);
    };

    return (
        <div style={styles.container}>

            {/* Search bar — sits above category filters */}
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
                        onClick={() => {
                            setActiveCategory(cat);
                            // Clear search when switching categories
                            setIsSearching(false);
                            setSearchResults(null);
                        }}
                        style={{
                            ...styles.pill,
                            ...(activeCategory === cat && !isSearching ? styles.pillActive : {}),
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Event grid — shows search results or category filtered events */}
            {loading ? (
                <p style={styles.loading}>Loading events...</p>
            ) : isSearching && searchResults !== null ? (
                // Show search results
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
                // Show category filtered events
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
        fontFamily: 'inherit',
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