const axios = require('axios');
const NotificationService = require('./notificationService');

class BookingService {
    constructor() {
        this.notificationService = new NotificationService();
    }

   


    async fetchBookingStatuses(params) {
        const url = process.env.BOOKING_URL;
        if (!url) throw new Error('BOOKING_URL is not defined in environment variables.');

        const filteredParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value != null)
        );

        try {
            const response = await axios.get(url, { params: filteredParams });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async _createBooking(bookingData) {
        const url = process.env.NEW_BOOKING_URL;
        if (!url) throw new Error('NEW_BOOKING_URL is not defined in environment variables.');

        try {
            const response = await axios.post(url, bookingData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async _updateBookingStatus(bookingId, newStatus) {
        const url = process.env.NEW_BOOKING_URL;
        if (!url) throw new Error('NEW_BOOKING_URL is not defined in environment variables.');

        try {
            const response = await axios.patch(`${url}/${bookingId}/status`, { status: newStatus });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    processBookingStatuses(bookingStatuses) {
        const bookingStatusMap = bookingStatuses.reduce((map, status) => {
            if (!map[status.entity_id]) {
                map[status.entity_id] = [];
            }
            map[status.entity_id].push(status);
            return map;
        }, {});

        Object.keys(bookingStatusMap).forEach(entityId => {
            const statusArray = bookingStatusMap[entityId];
            statusArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            bookingStatusMap[entityId] = {
                status: statusArray[0].status,
                details: statusArray
            };
        });

        return bookingStatusMap;
    }


    async getUserBookingHistory(userId) {
        return this.fetchBookingStatuses({ userIds: userId });
    }

    async getEntityBookingHistory(entityId) {
        return this.fetchBookingStatuses({ entityIds: entityId });
    }

    async createBooking(bookingData) {
        try {
            const booking = await this._createBooking(bookingData);
             await this.notificationService.sendBookingNotification(booking);
            return booking;
        } catch (error) {
            console.error('Error creating booking and sending notification:', error);
            throw error;
        }
    }

    async updateBookingStatus(bookingId, newStatus) {
        try {
            const booking = await this._updateBookingStatus(bookingId, newStatus);
             await this.notificationService.sendBookingNotification(booking);
            return booking;
        } catch (error) {
            console.error('Error updating booking status and sending notification:', error);
            throw error;
        }
    }
}

module.exports = BookingService;
