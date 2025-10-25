async function fetchBookings(status = 'available') {
    try {
        const res = await fetch(`/php/get_bookings.php?status=${status}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const bookings = await res.json();
        
        const container = document.querySelector('.bookings-grid');
        container.innerHTML = bookings.map(booking => `
            <div class="booking-card ${status !== 'available' ? booking.status.toLowerCase() : ''}" id="details-btn">
                <div class="booking-header">
                    ${status === 'available' ? `
                        <div class="distance-info">
                            <span class="iconify" data-icon="material-symbols:route"></span>
                            <span>${booking.distance} km from you</span>
                        </div>
                    ` : `
                        <div class="status-info ${booking.status.toLowerCase()}">
                            <span class="iconify" data-icon="${getStatusIcon(booking.status)}"></span>
                            <span class="status-text">${booking.status}</span>
                        </div>
                    `}
                    <p class="time">${formatDate(booking.created_at)}</p>
                </div>

                <div class="client-info">
                    <span class="iconify" data-icon="iconamoon:profile-fill"></span>
                    <span class="client-name">${booking.customer_name}</span>
                </div>

                <div class="route-container">
                    <div class="route-point pickup">
                        <div class="route-icon pickup-icon">
                            <span class="iconify" data-icon="ic:outline-circle"></span>
                        </div>
                        <div class="route-details">
                            <div class="route-address">${booking.pickup_location}</div>
                        </div>
                    </div>

                    <div class="route-point dropoff">
                        <div class="route-icon dropoff-icon">
                            <span class="iconify" data-icon="mdi:location"></span>
                        </div>
                        <div class="route-details">
                            <div class="route-address">${booking.dropoff_location}</div>
                        </div>
                    </div>
                </div>

                <div class="booking-note">
                    <p class="note-text">${booking.note || 'No note provided'}</p>
                </div>

                <div class="booking-fare">
                    <span>₱${parseFloat(booking.amount).toFixed(2)}</span>
                </div>

                ${status === 'available' ? `
                    <div class="booking-action">
                        <button class="accept-btn" onclick="acceptBooking('${booking.id}')">Accept</button>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching bookings:', err);
    }
}

async function acceptBooking(id) {
    try {
        const res = await fetch('/php/update_booking.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id,
                status: 'accepted',
                driver_id: 1 // Replace with actual driver ID from auth
            })
        });

        if (!res.ok) throw new Error('Failed to accept booking');
        
        openModal('bookingAccepted');
        await fetchBookings(); // Refresh the list
    } catch (err) {
        console.error('Error accepting booking:', err);
    }
}

function getStatusIcon(status) {
    return {
        'accepted': 'material-symbols:directions-car',
        'pickup': 'material-symbols:directions-car',
        'inprogress': 'material-symbols:directions-car',
        'completed': 'material-symbols:check-circle',
        'cancelled': 'material-symbols:cancel'
    }[status.toLowerCase()] || 'material-symbols:question-mark';
}

function formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    if (diff < 3600000) return 'Now';
    if (diff < 86400000) return `${Math.floor(diff/3600000)} hours ago`;
    return d.toLocaleDateString();
}

// Wire up tab switching
document.addEventListener('DOMContentLoaded', () => {
    fetchBookings('available');

    document.querySelectorAll('input[name="schedule-tab"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const status = e.target.value;
            fetchBookings(status === 'bookings' ? 'available' : status);
        });
    });
});