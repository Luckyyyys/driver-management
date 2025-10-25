let currentUserId = 1; // Replace with actual logged in user ID
let currentChatUserId = null;

async function loadConversations() {
    try {
        const res = await fetch('/php/get_conversations.php');
        if (!res.ok) throw new Error('Failed to load conversations');
        const conversations = await res.json();
        
        const container = document.querySelector('.messages-categories');
        container.innerHTML = '<p class="category-title">All messages</p>';
        
        conversations.forEach(conv => {
            container.innerHTML += `
                <div class="message-item ${conv.unread ? 'unread' : ''}" 
                     onclick="openChat(${conv.user_id}, '${conv.first_name} ${conv.last_name}')">
                    <div class="avatar">${conv.avatar_initials}</div>
                    <div class="message-info">
                        <div class="message-top">
                            <h4>${conv.first_name} ${conv.last_name}</h4>
                            <span class="time">${formatTime(new Date(conv.last_message_time))}</span>
                        </div>
                        <p class="message-preview">${conv.last_message}</p>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error('Error loading conversations:', err);
    }
}

function formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 48 * 60 * 60 * 1000) {
        return 'Yesterday';
    }
    return date.toLocaleDateString();
}

document.addEventListener('DOMContentLoaded', loadConversations);