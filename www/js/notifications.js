import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.notificationId = 1;
  }

  async init() {
    if (this.isInitialized) return;

    try {
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

  async schedulePeriodicNotification() {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return;
    }

    try {
      // Cancel existing periodic notifications
      await this.cancelPeriodicNotifications();

      // Schedule notifications every 5 minutes for the next 24 hours
      const notifications = [];
      const now = new Date();
      
      for (let i = 1; i <= 288; i++) { // 24 hours * 60 minutes / 5 minutes = 288 notifications
        const scheduleTime = new Date(now.getTime() + (i * 5 * 60 * 1000)); // Every 5 minutes
        
        notifications.push({
          title: 'Madhav Finance',
          body: 'Check your financial updates',
          id: this.notificationId + i,
          schedule: { at: scheduleTime },
          sound: 'default',
          attachments: null,
          actionTypeId: '',
          extra: { type: 'periodic' }
        });
      }

      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} periodic notifications`);
      
      // Update notification ID counter
      this.notificationId += notifications.length;
      
    } catch (error) {
      console.error('Failed to schedule periodic notifications:', error);
    }
  }

  async cancelPeriodicNotifications() {
    try {
      const pending = await LocalNotifications.getPending();
      const periodicIds = pending.notifications
        .filter(n => n.extra?.type === 'periodic')
        .map(n => n.id);
      
      if (periodicIds.length > 0) {
        await LocalNotifications.cancel({ notifications: periodicIds.map(id => ({ id })) });
        console.log(`Cancelled ${periodicIds.length} periodic notifications`);
      }
    } catch (error) {
      console.error('Failed to cancel periodic notifications:', error);
    }
  }

  async scheduleImmediateNotification(title, body) {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) return;
    }

    try {
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
}

// Export singleton instance
export const notificationService = new NotificationService();