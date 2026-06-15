import axios from 'axios';

// Base URL for our Spring Boot backend
const API_BASE_URL = 'http://localhost:8080/api';

// Create an Axios instance with our base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach JWT token to every request if one exists
api.interceptors.request.use(config => {
    const token = localStorage.getItem('culturpass_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Event calls ──────────────────────────────────────────

// Get all events
export const getAllEvents = () => api.get('/events');

// Get the featured hero event
export const getFeaturedEvent = () => api.get('/events/featured');

// Get upcoming events only
export const getUpcomingEvents = () => api.get('/events/upcoming');

// Get a single event by ID
export const getEventById = (id) => api.get(`/events/${id}`);

// Get events by category
export const getEventsByCategory = (category) =>
    api.get(`/events/category/${category}`);

// Get upcoming events by category
export const getUpcomingEventsByCategory = (category) =>
    api.get(`/events/category/${category}/upcoming`);

// Create a new event
export const createEvent = (eventData) => api.post('/events', eventData);

// ── RSVP calls ───────────────────────────────────────────

// RSVP to an event
export const createRsvp = (userId, eventId) =>
    api.post(`/rsvps/${userId}/${eventId}`);

// Cancel an RSVP
export const cancelRsvp = (userId, eventId) =>
    api.delete(`/rsvps/${userId}/${eventId}`);

// Get all RSVPs for a user
export const getUserRsvps = (userId) => api.get(`/rsvps/user/${userId}`);

// ── Saved event calls ────────────────────────────────────

// Get all saved events for a user
export const getSavedEvents = (userId) => api.get(`/saved/user/${userId}`);

// Check if an event is saved by a user
export const isEventSaved = (userId, eventId) => api.get(`/saved/check/${userId}/${eventId}`);

// Save an event
export const saveEvent = (userId, eventId) => api.post(`/saved/${userId}/${eventId}`);

// Unsave an event
export const unsaveEvent = (userId, eventId) => api.delete(`/saved/${userId}/${eventId}`);

// ── Category calls ────────────────────────────────────────

// Get all active categories
export const getCategories = () => api.get('/categories');

// Get all deleted categories — admin only
export const getDeletedCategories = () => api.get('/categories/deleted');

// Add a new category — admin only
export const addCategory = (name) => api.post('/categories', { name });

// Soft-delete a category — admin only
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Restore a deleted category — admin only
export const restoreCategory = (id) => api.put(`/categories/${id}/restore`);

// ── Health check ─────────────────────────────────────────

export const checkHealth = () => api.get('/health');

export default api;