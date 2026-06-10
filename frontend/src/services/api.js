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

// ── Event calls ──────────────────────────────────────────

// Get all events
export const getAllEvents = () => api.get('/events');

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

// ── Health check ─────────────────────────────────────────

export const checkHealth = () => api.get('/health');

export default api;