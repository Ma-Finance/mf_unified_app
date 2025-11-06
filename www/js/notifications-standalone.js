// Standalone notification service (no ES6 modules)
window.NotificationService = class {
  constructor() {
    this.isInitialized = false;
    this.notificationId = 1;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Check if Capacitor is available
      if (!window.Capacitor || !window.Capacitor.Plugins.LocalNotifications) {
        console.warn('LocalNotifications plugin not available');
        return false;
      }

      const { LocalNotifications } = window.Capacitor.Plugins;

      // Request permissions
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Listen for notification actions
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed:', notification);
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async scheduleDailyMorningNotification() {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return;
    }

    try {
      const { LocalNotifications } = window.Capacitor.Plugins;

      // Cancel existing daily notifications
      await this.cancelDailyNotifications();

      // Schedule daily notifications at 8 AM for the next 30 days
      const notifications = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const scheduleTime = new Date();
        scheduleTime.setDate(now.getDate() + i);
        scheduleTime.setHours(8, 0, 0, 0); // 8:00 AM
        
        // If today's 8 AM has passed, start from tomorrow
        if (i === 0 && scheduleTime <= now) {
          scheduleTime.setDate(now.getDate() + 1);
        }
        
        notifications.push({
          title: 'Good Morning!',
          body: 'Start your day with Madhav Finance - Check your financial updates',
          id: this.notificationId + i,
          schedule: { at: scheduleTime },
          sound: 'default',
          attachments: null,
          actionTypeId: '',
          extra: { type: 'daily' }
        });
      }

      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} daily morning notifications`);
      
      this.notificationId += notifications.length;
      
    } catch (error) {
      console.error('Failed to schedule daily notifications:', error);
    }
  }

  async cancelDailyNotifications() {
    try {
      const { LocalNotifications } = window.Capacitor.Plugins;
      const pending = await LocalNotifications.getPending();
      const dailyIds = pending.notifications
        .filter(n => n.extra?.type === 'daily')
        .map(n => n.id);
      
      if (dailyIds.length > 0) {
        await LocalNotifications.cancel({ notifications: dailyIds.map(id => ({ id })) });
        console.log(`Cancelled ${dailyIds.length} daily notifications`);
      }
    } catch (error) {
      console.error('Failed to cancel daily notifications:', error);
    }
  }

  async scheduleImmediateNotification(title, body) {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return;
    }

    try {
      const { LocalNotifications } = window.Capacitor.Plugins;
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: this.notificationId++,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
          sound: 'default',
          attachments: null,
          actionTypeId: '',
          extra: { type: 'immediate' }
        }]
      });
    } catch (error) {
      console.error('Failed to schedule immediate notification:', error);
    }
  }
};

// Create global instance
window.notificationService = new window.NotificationService();