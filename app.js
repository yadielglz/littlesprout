// LittleSprout Baby Tracker - Main Application

// Global instance for onclick handlers
let babyTracker;

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
            // Show time without seconds
            timeElement.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activity = e.currentTarget.dataset.activity;
                this.handleQuickAction(activity);
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
            startTimerBtn.addEventListener('click', () => this.showTimerModal());
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

    // Quick Action Handler
    handleQuickAction(activityType) {
        switch(activityType) {
            case 'feed':
                this.showFeedModal();
                break;
            case 'diaper':
                this.showDiaperModal();
                break;
            case 'sleep':
            case 'nap':
            case 'tummy':
                this.startTimer(activityType);
                break;
            case 'mood':
                this.quickLogActivity(activityType);
                break;
            default:
                this.quickLogActivity(activityType);
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

    updateActivity(activityId, updatedData) {
        const index = this.state.activities.findIndex(a => a.id === activityId);
        if (index !== -1) {
            this.state.activities[index] = { ...this.state.activities[index], ...updatedData };
            this.updateStats();
            this.saveData();
            this.render();
            this.showNotification('Activity updated successfully!');
        }
    }

    deleteActivity(activityId) {
        this.state.activities = this.state.activities.filter(a => a.id !== activityId);
        this.updateStats();
        this.saveData();
        this.render();
        this.showNotification('Activity deleted successfully!');
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
    startTimer(activityType) {
        if (this.state.timer.isRunning) {
            this.showNotification('Timer is already running!');
            return;
        }

        this.state.timer.isRunning = true;
        this.state.timer.startTime = Date.now();
        this.state.timer.currentActivity = activityType;
        this.state.timer.interval = setInterval(() => this.updateTimerDisplay(), 1000);

        this.updateTimerUI();
        this.showNotification(`${activityType} timer started!`);
    }

    stopTimer() {
        if (!this.state.timer.isRunning) return;

        this.state.timer.isRunning = false;
        clearInterval(this.state.timer.interval);
        this.state.timer.interval = null;

        const duration = Date.now() - this.state.timer.startTime;
        const activityType = this.state.timer.currentActivity;
        
        // Log the timer activity
        const activity = {
            id: Date.now().toString(),
            type: activityType,
            timestamp: new Date().toISOString(),
            duration: duration,
            notes: `${activityType} session: ${Math.floor(duration / 60000)} minutes`
        };

        this.state.activities.unshift(activity);
        this.state.timer.currentActivity = null;
        this.state.timer.startTime = null;

        this.updateStats();
        this.saveData();
        this.updateTimerUI();
        this.render();
        this.showNotification(`${activityType} session logged!`);
    }

    updateTimerDisplay() {
        if (!this.state.timer.isRunning) return;

        const elapsed = Date.now() - this.state.timer.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            const activityName = this.state.timer.currentActivity || 'Activity';
            timerDisplay.innerHTML = `
                <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">${activityName} timer running</div>
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
                    <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">00:00</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">No timer running</div>
                `;
            }
        }
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

        let details = '';
        if (activity.feedType && activity.ounces) {
            details = `${activity.feedType} - ${activity.ounces} oz`;
        } else if (activity.diaperType) {
            details = activity.diaperType;
        } else if (activity.duration) {
            details = `${Math.floor(activity.duration / 60000)} minutes`;
        }

        return `
            <div class="activity-item ${activity.type}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="${icon} text-${color} text-xl"></i>
                        <div>
                            <div class="font-medium text-gray-900 dark:text-white">${this.capitalizeFirst(activity.type)}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">${timeAgo}</div>
                            ${details ? `<div class="text-sm text-gray-500 dark:text-gray-400">${details}</div>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${activity.notes ? `<div class="text-sm text-gray-500 dark:text-gray-400">${activity.notes}</div>` : ''}
                        <button onclick="babyTracker.editActivity('${activity.id}')" class="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="babyTracker.deleteActivity('${activity.id}')" class="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderStats() {
        const dailyStats = document.getElementById('daily-stats');
        if (!dailyStats) return;

        dailyStats.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Feeds:</span>
                <span class="font-semibold text-gray-900 dark:text-white">${this.state.stats.today.feeds}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Diapers:</span>
                <span class="font-semibold text-gray-900 dark:text-white">${this.state.stats.today.diapers}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Sleep:</span>
                <span class="font-semibold text-gray-900 dark:text-white">${this.state.stats.today.sleep}</span>
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

    showFeedModal() {
        const modal = this.createModal('Log Feeding', `
            <form id="feed-form">
                <div class="form-group">
                    <label class="form-label">Feed Type</label>
                    <select id="feed-type" class="form-select">
                        <option value="">Select type...</option>
                        <option value="Bottle (Formula)">Bottle (Formula)</option>
                        <option value="Breastfed">Breastfed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Ounces (optional)</label>
                    <input type="number" id="feed-ounces" class="form-input" min="0" step="0.5" placeholder="e.g., 4.5">
                </div>
                <div class="form-group">
                    <label class="form-label">Notes (optional)</label>
                    <textarea id="feed-notes" class="form-input" rows="3" placeholder="Add any notes..."></textarea>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Log Feed', class: 'btn-primary', action: 'save' }
        ]);

        modal.querySelector('#feed-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFeed();
            this.closeModal(modal);
        });
    }

    showDiaperModal() {
        const modal = this.createModal('Log Diaper Change', `
            <form id="diaper-form">
                <div class="form-group">
                    <label class="form-label">Diaper Type</label>
                    <select id="diaper-type" class="form-select">
                        <option value="">Select type...</option>
                        <option value="Wet">Wet</option>
                        <option value="Dirty">Dirty</option>
                        <option value="Wet & Dirty">Wet & Dirty</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Notes (optional)</label>
                    <textarea id="diaper-notes" class="form-input" rows="3" placeholder="Add any notes..."></textarea>
                </div>
            </form>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Log Diaper', class: 'btn-primary', action: 'save' }
        ]);

        modal.querySelector('#diaper-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveDiaper();
            this.closeModal(modal);
        });
    }

    showTimerModal() {
        const modal = this.createModal('Start Timer', `
            <div class="space-y-4">
                <p class="text-gray-600 dark:text-gray-400">Select an activity to start timing:</p>
                <div class="grid grid-cols-1 gap-3">
                    <button class="timer-option-btn" data-activity="sleep">
                        <i class="fas fa-moon text-indigo-500 text-xl mr-3"></i>
                        <span>Sleep</span>
                    </button>
                    <button class="timer-option-btn" data-activity="nap">
                        <i class="fas fa-bed text-purple-500 text-xl mr-3"></i>
                        <span>Nap</span>
                    </button>
                    <button class="timer-option-btn" data-activity="tummy">
                        <i class="fas fa-child-reaching text-lime-500 text-xl mr-3"></i>
                        <span>Tummy Time</span>
                    </button>
                </div>
            </div>
        `, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' }
        ]);

        // Add event listeners for timer options
        modal.querySelectorAll('.timer-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const activity = btn.dataset.activity;
                this.closeModal(modal);
                this.startTimer(activity);
            });
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

    editActivity(activityId) {
        const activity = this.state.activities.find(a => a.id === activityId);
        if (!activity) return;

        let formContent = `
            <form id="edit-activity-form">
                <div class="form-group">
                    <label class="form-label">Activity Type</label>
                    <select id="edit-activity-type" class="form-select">
                        <option value="feed" ${activity.type === 'feed' ? 'selected' : ''}>Feed</option>
                        <option value="diaper" ${activity.type === 'diaper' ? 'selected' : ''}>Diaper</option>
                        <option value="sleep" ${activity.type === 'sleep' ? 'selected' : ''}>Sleep</option>
                        <option value="nap" ${activity.type === 'nap' ? 'selected' : ''}>Nap</option>
                        <option value="tummy" ${activity.type === 'tummy' ? 'selected' : ''}>Tummy Time</option>
                        <option value="mood" ${activity.type === 'mood' ? 'selected' : ''}>Mood</option>
                    </select>
                </div>
        `;

        // Add specific fields based on activity type
        if (activity.type === 'feed') {
            formContent += `
                <div class="form-group">
                    <label class="form-label">Feed Type</label>
                    <select id="edit-feed-type" class="form-select">
                        <option value="Bottle (Formula)" ${activity.feedType === 'Bottle (Formula)' ? 'selected' : ''}>Bottle (Formula)</option>
                        <option value="Breastfed" ${activity.feedType === 'Breastfed' ? 'selected' : ''}>Breastfed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Ounces</label>
                    <input type="number" id="edit-feed-ounces" class="form-input" min="0" step="0.5" value="${activity.ounces || ''}" placeholder="e.g., 4.5">
                </div>
            `;
        } else if (activity.type === 'diaper') {
            formContent += `
                <div class="form-group">
                    <label class="form-label">Diaper Type</label>
                    <select id="edit-diaper-type" class="form-select">
                        <option value="Wet" ${activity.diaperType === 'Wet' ? 'selected' : ''}>Wet</option>
                        <option value="Dirty" ${activity.diaperType === 'Dirty' ? 'selected' : ''}>Dirty</option>
                        <option value="Wet & Dirty" ${activity.diaperType === 'Wet & Dirty' ? 'selected' : ''}>Wet & Dirty</option>
                    </select>
                </div>
            `;
        }

        formContent += `
                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea id="edit-activity-notes" class="form-input" rows="3" placeholder="Add any notes...">${activity.notes || ''}</textarea>
                </div>
            </form>
        `;

        const modal = this.createModal('Edit Activity', formContent, [
            { text: 'Cancel', class: 'btn-secondary', action: 'close' },
            { text: 'Update', class: 'btn-primary', action: 'save' }
        ]);

        modal.querySelector('#edit-activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateActivityFromForm(activityId);
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

    saveFeed() {
        const feedType = document.getElementById('feed-type')?.value || '';
        const ounces = document.getElementById('feed-ounces')?.value || '';
        const notes = document.getElementById('feed-notes')?.value || '';

        if (feedType) {
            this.addActivity({ 
                type: 'feed', 
                feedType, 
                ounces: ounces ? parseFloat(ounces) : null,
                notes 
            });
        }
    }

    saveDiaper() {
        const diaperType = document.getElementById('diaper-type')?.value || '';
        const notes = document.getElementById('diaper-notes')?.value || '';

        if (diaperType) {
            this.addActivity({ 
                type: 'diaper', 
                diaperType, 
                notes 
            });
        }
    }

    saveActivity() {
        const type = document.getElementById('activity-type')?.value || '';
        const notes = document.getElementById('activity-notes')?.value || '';

        if (type) {
            this.addActivity({ type, notes });
        }
    }

    updateActivityFromForm(activityId) {
        const type = document.getElementById('edit-activity-type')?.value || '';
        const notes = document.getElementById('edit-activity-notes')?.value || '';
        
        let updatedData = { type, notes };

        if (type === 'feed') {
            const feedType = document.getElementById('edit-feed-type')?.value || '';
            const ounces = document.getElementById('edit-feed-ounces')?.value || '';
            updatedData = { ...updatedData, feedType, ounces: ounces ? parseFloat(ounces) : null };
        } else if (type === 'diaper') {
            const diaperType = document.getElementById('edit-diaper-type')?.value || '';
            updatedData = { ...updatedData, diaperType };
        }

        this.updateActivity(activityId, updatedData);
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    babyTracker = new BabyTracker();
}); 