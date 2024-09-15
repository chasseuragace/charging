const axios = require('axios');

class NotificationService {

    async sendBookingNotification(bookingDetail) {
        console.log(`Sending booking notification for booking ID: ${bookingDetail.booking_id}`);

        try {
            const bookingInfo = bookingDetail.booking_info;
            const receiverUserIds = [bookingInfo.user.id] || []; // Assuming bookingInfo.user.id is a single user ID
            const receiverBusinessIds = [bookingInfo.entity.id] || []; // Assuming bookingInfo.entity.id is a single business ID

            const notificationUrl = process.env.NOTIFICATION_URL;
            const authToken = process.env.AUTH_TOKEN; // Assuming the auth token is stored in environment variables

            if (!notificationUrl) {
                throw new Error('NOTIFICATION_URL is not defined in environment variables.');
            }

            if (!authToken) {
                throw new Error('AUTH_TOKEN is not defined in environment variables.');
            }

            const status = bookingDetail.status; // cancelled, new, scheduled, etc.

            // Define status to message mappings
            const genericCancelledMessage = {
                title: 'Booking Cancelled',
                message: 'The booking has been cancelled.',
            };

            const vendorMessages = {
                new: {
                    title: 'New Booking Request',
                    message: 'A new booking has been created. Please review and respond as soon as possible.',
                },
                scheduled: {
                    title: 'Booking Scheduled',
                    message: 'The booking has been scheduled. Please prepare for the upcoming appointment.',
                },
            };

            const userMessages = {
                scheduled: {
                    title: 'Booking Scheduled',
                    message: 'Your booking has been confirmed and scheduled. We look forward to serving you.',
                },
            };

            const senderUserId = bookingInfo.user.id; // Static sender user ID
            const senderBusinessId = bookingInfo.entity.id; // Static sender business ID, if applicable

            // Define additional meta data
            const metaData = {
                booking_id: bookingDetail.booking_id,
                booking_info: bookingDetail.booking_info,
                notification_type: "BOOKING",
                status: status
            };

            // Create common payload structure
            const createPayload = (title, message, receiverUserIds, receiverBusinessIds) => ({
                title,
                message,
                receiverUserIds,
                receiverBusinessIds,
                senderUserId,
                senderBusinessId,
                imageUrl: undefined, // Set as undefined if not used; adjust if imageUrl is available
                meta: metaData
            });

            // Define the Axios request configuration with headers
            const axiosConfig = {
                headers: {
                    'Authorization': `Bearer ${authToken}`, // Add your auth token here
                    'Content-Type': 'application/json' // Ensure the content type is set to JSON
                }
            };

            if (status === 'cancelled') {
                // Send cancellation message to both user and vendor
                const cancellationPayload = createPayload(
                    genericCancelledMessage.title,
                    genericCancelledMessage.message,
                    receiverUserIds,
                    receiverBusinessIds
                );

                await axios.post(notificationUrl, cancellationPayload, axiosConfig);
                await axios.post(notificationUrl, cancellationPayload, axiosConfig); // Assuming you need to send to both
            } else if (status === 'pending') {
                // Send new booking notification only to vendor
                const vendorPayload = createPayload(
                    vendorMessages.new.title,
                    vendorMessages.new.message,
                    [], // No user IDs for vendor notifications
                    receiverBusinessIds
                );

                await axios.post(notificationUrl, vendorPayload, axiosConfig);
            } else if (status === 'scheduled') {
                // Send scheduled notification to user only
                const userPayload = createPayload(
                    userMessages.scheduled.title,
                    userMessages.scheduled.message,
                    receiverUserIds,
                    [] // No business IDs for user notifications
                );

                await axios.post(notificationUrl, userPayload, axiosConfig);
            }

            console.log('Booking notifications sent successfully.');
        } catch (error) {
            console.error('Error sending booking notification:', error);
            
        }
    }
}

module.exports = NotificationService;
