// Dynamic notification system with real-time updates
let notificationQueue = [];
let activeNotifications = [];
let notificationId = 0;

export const notify = (message, type = 'info') => {
    const id = ++notificationId;
    const timestamp = new Date();
    
    // Create notification data
    const notificationData = {
        id,
        message,
        type,
        timestamp,
        duration: type === 'info' ? 2000 : 4000
    };
    
    // Add to queue
    notificationQueue.push(notificationData);
    
    // Process queue
    processNotificationQueue();
};

const processNotificationQueue = () => {
    // Limit active notifications to 3
    while (notificationQueue.length > 0 && activeNotifications.length < 3) {
        const notification = notificationQueue.shift();
        showNotification(notification);
    }
};

const showNotification = (notificationData) => {
    const { id, message, type, timestamp, duration } = notificationData;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = `notification-${id}`;
    notification.className = `notification notification-${type}`;
    
    // Create content with timestamp
    const content = document.createElement('div');
    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
            <div style="flex: 1;">
                <div style="font-weight: 600; margin-bottom: 2px;">${message}</div>
                <div style="font-size: 11px; opacity: 0.8;" id="time-${id}">Just now</div>
            </div>
            <div style="font-size: 18px; opacity: 0.7;">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
        </div>
    `;
    
    notification.appendChild(content);
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: `${20 + activeNotifications.length * 80}px`,
        right: '20px',
        padding: '12px 16px',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '350px',
        minWidth: '280px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        backgroundColor: type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : 
                        type === 'warning' ? '#f59e0b' : '#3b82f6',
        border: '1px solid rgba(255,255,255,0.2)'
    });
    
    document.body.appendChild(notification);
    activeNotifications.push({ id, element: notification, timestamp });
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Update timestamp every second
    const timeInterval = setInterval(() => {
        const timeElement = document.getElementById(`time-${id}`);
        if (timeElement) {
            timeElement.textContent = getTimeAgo(timestamp);
        }
    }, 1000);
    
    // Remove notification
    setTimeout(() => {
        removeNotification(id, timeInterval);
    }, duration);
};

const removeNotification = (id, timeInterval) => {
    const notification = document.getElementById(`notification-${id}`);
    if (notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            // Remove from active notifications
            activeNotifications = activeNotifications.filter(n => n.id !== id);
            
            // Reposition remaining notifications
            repositionNotifications();
            
            // Process queue
            processNotificationQueue();
            
            // Clear interval
            clearInterval(timeInterval);
        }, 300);
    }
};

const repositionNotifications = () => {
    activeNotifications.forEach((notif, index) => {
        notif.element.style.top = `${20 + index * 80}px`;
    });
};

const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 5) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
};