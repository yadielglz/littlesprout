// LittleSprout Baby Tracker - Main Application

class BabyTracker {
    constructor() {
        this.state = {
            baby: {
                name: '',
                birthDate: null,
                age: ''
            },
            activities: [],
            timer: {
                isRunning: false,
                startTime: null,
                currentActivity: null,
                interval: null
            },
            stats: {
                today: {
                    feeds: 0,
                    diapers: 0,
                    sleep: 0
                }
            }
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateClock();
        this.render();
        this.startClock();
    }

    // Data Management
    saveData() {
        localStorage.setItem('littlesprout_data', JSON.stringify(this.state));
    }

    loadData() {
        const saved = localStorage.getItem('littlesprout_data');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    }

    // Clock Management
    startClock() {
        setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activity = e.currentTarget.dataset.activity;
                this.quickLogActivity(activity);
            });
        });

        // Setup button
        const setupBtn = document.getElementById('setup-btn');
        if (setupBtn) {
            setupBtn.addEventListener('click', () => this.showSetupModal());
        }

        // Add activity button
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => this.showAddActivityModal());
        }

        // Timer buttons
        const startTimerBtn = document.getElementById('start-timer-btn');
        const stopTimerBtn = document.getElementById('stop-timer-btn');
        
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => this.startTimer());
        }
        if (stopTimerBtn) {
            stopTimerBtn.addEventListener('click', () => this.stopTimer());
        }

        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
    }

    // Activity Management
    quickLogActivity(activityType) {
        const activity = {
            id: Date.now().toString(),
            type: activityType,
            timestamp: new Date().toISOString(),
            notes: ''
        };

        this.state.activities.unshift(activity);
        this.updateStats();
        this.saveData();
        this.render();
        this.showNotification(`${activityType} logged successfully!`);
    }

    addActivity(activityData) {
        const activity = {
            id: Date.now().toString(),
            ...activityData,
            timestamp: new Date().toISOString()
        };

        this.state.activities.unshift(activity);
        this.updateStats();
        this.saveData();
        this.render();
        this.showNotification('Activity logged successfully!');
    }

    updateStats() {
        const today = new Date().toDateString();
        const todayActivities = this.state.activities.filter(activity => {
            return new Date(activity.timestamp).toDateString() === today;
        });

        this.state.stats.today = {
            feeds: todayActivities.filter(a => a.type === 'feed').length,
            diapers: todayActivities.filter(a => a.type === 'diaper').length,
            sleep: todayActivities.filter(a => a.type === 'sleep' || a.type === 'nap').length
        };
    }

    // Timer Management
    startTimer() {
        if (this.state.timer.isRunning) return;

        this.state.timer.isRunning = true;
        this.state.timer.startTime = Date.now();
        this.state.timer.interval = setInterval(() => this.updateTimerDisplay(), 1000);

        this.updateTimerUI();
        this.showNotification('Timer started!');
    }

    stopTimer() {
        if (!this.state.timer.isRunning) return;

        this.state.timer.isRunning = false;
        clearInterval(this.state.timer.interval);
        this.state.timer.interval = null;

        const duration = Date.now() - this.state.timer.startTime;
        this.logTimerActivity(duration);

        this.updateTimerUI();
        this.showNotification('Timer stopped!');
    }

    updateTimerDisplay() {
        if (!this.state.timer.isRunning) return;

        const elapsed = Date.now() - this.state.timer.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.innerHTML = `
                <div class="text-3xl font-bold text-gray-900 mb-2">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
                <div class="text-sm text-gray-600 mb-4">Timer running</div>
            `;
        }
    }

    updateTimerUI() {
        const startBtn = document.getElementById('start-timer-btn');
        const stopBtn = document.getElementById('stop-timer-btn');
        const timerDisplay = document.getElementById('timer-display');

        if (this.state.timer.isRunning) {
            if (startBtn) startBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
            if (timerDisplay) timerDisplay.classList.add('timer-running');
        } else {
            if (startBtn) startBtn.classList.remove('hidden');
            if (stopBtn) stopBtn.classList.add('hidden');
            if (timerDisplay) {
                timerDisplay.classList.remove('timer-running');
                timerDisplay.innerHTML = `
                    <div class="text-3xl font-bold text-gray-900 mb-2">00:00</div>
                    <div class="text-sm text-gray-600 mb-4">No timer running</div>
                `;
            }
        }
    }

    logTimerActivity(duration) {
        const activity = {
            id: Date.now().toString(),
            type: 'timer',
            timestamp: new Date().toISOString(),
            duration: duration,
            notes: `Timer ran for ${Math.floor(duration / 60000)} minutes`
        };

        this.state.activities.unshift(activity);
        this.saveData();
        this.render();
    }

    // Rendering
    render() {
        this.renderBabyInfo();
        this.renderActivityLog();
        this.renderStats();
    }

    renderBabyInfo() {
        const babyName = document.getElementById('baby-name');
        const babyAge = document.getElementById('baby-age');

        if (babyName) {
            babyName.textContent = this.state.baby.name || 'Baby Name';
        }

        if (babyAge) {
            if (this.state.baby.birthDate) {
                const age = this.calculateAge(this.state.baby.birthDate);
                babyAge.textContent = `Age: ${age}`;
            } else {
                babyAge.textContent = 'Age: Not set';
            }
        }
    }

    renderActivityLog() {
        const activityLog = document.getElementById('activity-log');
        if (!activityLog) return;

        if (this.state.activities.length === 0) {
            activityLog.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-baby"></i>
                    <p>No activities logged yet</p>
                    <p class="text-sm">Start by logging your first activity!</p>
                </div>
            `;
            return;
        }

        const recentActivities = this.state.activities.slice(0, 10);
        activityLog.innerHTML = recentActivities.map(activity => this.renderActivityItem(activity)).join('');
    }

    renderActivityItem(activity) {
        const timeAgo = this.getTimeAgo(activity.timestamp);
        const icon = this.getActivityIcon(activity.type);
        const color = this.getActivityColor(activity.type);

        return `
            <div class="activity-item ${activity.type}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="${icon} text-${color} text-xl"></i>
                        <div>
                            <div class="font-medium text-gray-900">${this.capitalizeFirst(activity.type)}</div>
                            <div class="text-sm text-gray-600">${timeAgo}</div>
                        </div>
                    </div>
                    ${activity.notes ? `<div class="text-sm text-gray-500">${activity.notes}</div>` : ''}
                </div>
            </div>
        `;
    }

    renderStats() {
        const dailyStats = document.getElementById('daily-stats');
        if (!dailyStats) return;

        dailyStats.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-600">Feeds:</span>
                <span class="font-semibold">${this.state.stats.today.feeds}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Diapers:</span>
                <span class="font-semibold">${this.state.stats.today.diapers}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Sleep:</span>
                <span class="font-semibold">${this.state.stats.today.sleep}</span>
            </div>
        `;
    }

    // Utility Functions
    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const now = new Date();
        const diffTime = Math.abs(now - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `${years} year${years !== 1 ? 's' : ''}`;
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    getActivityIcon(type) {
        const icons = {
            feed: 'fas fa-utensils',
            diaper: 'fas fa-baby',
            sleep: 'fas fa-moon',
            nap: 'fas fa-bed',
            tummy: 'fas fa-child-reaching',
            mood: 'fas fa-heart',
            timer: 'fas fa-clock'
        };
        return icons[type] || 'fas fa-circle';
    }

    getActivityColor(type) {
        const colors = {
            feed: 'blue-500',
            diaper: 'amber-500',
            sleep: 'indigo-500',
            nap: 'purple-500',
            tummy: 'lime-500',
            mood: 'pink-500',
            timer: 'gray-500'
        };
        return colors[type] || 'gray-500';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Modal Management
    showSetupModal() {
        const modal = this.createModal('Setup Baby Info', `
            <form id="setup-form">
                <div class="form-group">
                    <label class="form-label">Baby Name</label>
                    <input type="text" id="baby-name-input" class="form-input" value="${this.state.baby.name}" placeholder="Enter baby's name">
                </div>
                <div class="form-group">
                    <label class="form-label">Birth Date</label>
                    <input type="date" id="birth-date-input" class="form-input" value="${this.state.baby.birthDate || ''}">
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Save', class: 'btn-primary', action: 'save' }
        ]);

        modal.querySelector('#setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBabyInfo();
            this.closeModal(modal);
        });
    }

    showAddActivityModal() {
        const modal = this.createModal('Add Activity', `
            <form id="add-activity-form">
                <div class="form-group">
                    <label class="form-label">Activity Type</label>
                    <select id="activity-type" class="form-select">
                        <option value="feed">Feed</option>
                        <option value="diaper">Diaper</option>
                        <option value="sleep">Sleep</option>
                        <option value="nap">Nap</option>
                        <option value="tummy">Tummy Time</option>
                        <option value="mood">Mood</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes (optional)</label>
                    <textarea id="activity-notes" class="form-input" rows="3" placeholder="Add any notes..."></textarea>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Add Activity', class: 'btn-primary', action: 'save' }
        ]);

        modal.querySelector('#add-activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveActivity();
            this.closeModal(modal);
        });
    }

    createModal(title, content, buttons) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="text-lg font-semibold">${title}</h3>
                    <button class="close-modal text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn ${btn.class}" data-action="${btn.action}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        buttons.forEach(btn => {
            const btnElement = modal.querySelector(`[data-action="${btn.action}"]`);
            if (btn.action === 'close') {
                btnElement.addEventListener('click', () => this.closeModal(modal));
            } else if (btn.action === 'save') {
                btnElement.addEventListener('click', () => {
                    // Handle save action in the specific modal
                });
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    closeModal(modal) {
        modal.remove();
    }

    saveBabyInfo() {
        const name = document.getElementById('baby-name-input')?.value || '';
        const birthDate = document.getElementById('birth-date-input')?.value || '';

        this.state.baby.name = name;
        this.state.baby.birthDate = birthDate;
        this.saveData();
        this.render();
        this.showNotification('Baby info saved!');
    }

    saveActivity() {
        const type = document.getElementById('activity-type')?.value || '';
        const notes = document.getElementById('activity-notes')?.value || '';

        if (type) {
            this.addActivity({ type, notes });
        }
    }

    // Notifications
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Dark Mode
    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const icon = document.querySelector('#dark-mode-toggle i');
        if (icon) {
            icon.className = document.documentElement.classList.contains('dark') 
                ? 'fas fa-sun' 
                : 'fas fa-moon';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BabyTracker();
}); 