class InactivityTimer {
    constructor(logoutCallback, timeoutMinutes = 60) {
        this.logoutCallback = logoutCallback;
        this.timeoutMinutes = timeoutMinutes;
        this.timeoutMs = timeoutMinutes * 60 * 1000; // Convert to milliseconds
        this.timer = null;
        this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    }

    start() {
        // Clear any existing timer
        this.reset();
        
        // Add event listeners
        this.events.forEach(event => {
            window.addEventListener(event, this.reset.bind(this));
        });
        
        // Start the initial timer
        this.setTimer();
    }

    reset() {
        // Clear existing timer
        if (this.timer) {
            clearTimeout(this.timer);
        }
        
        // Set new timer
        this.setTimer();
    }

    setTimer() {
        this.timer = setTimeout(() => {
            this.logout();
        }, this.timeoutMs);
    }

    logout() {
        // Remove event listeners
        this.events.forEach(event => {
            window.removeEventListener(event, this.reset.bind(this));
        });
        
        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
        }
        
        // Call logout callback
        if (this.logoutCallback) {
            this.logoutCallback();
        }
    }

    stop() {
        // Remove all event listeners
        this.events.forEach(event => {
            window.removeEventListener(event, this.reset.bind(this));
        });
        
        // Clear timer
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

export default InactivityTimer;