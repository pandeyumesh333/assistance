
const mockNotifications = {
  scheduleNotificationAsync: (payload) => {
    console.log('--- NOTIFICATION SCHEDULED ---');
    console.log('Title:', payload.content.title);
    console.log('Sound:', payload.content.sound);
    console.log('Priority:', payload.content.priority);
    console.log('Channel:', payload.content.channelId);
    console.log('Vibration:', JSON.stringify(payload.content.vibrate));
    console.log('-------------------------------');
    return 'test-id';
  }
};

const mockTask = {
  _id: '123',
  title: 'Test Alarm',
  dueDate: new Date(Date.now() + 10000).toISOString(),
  reminderOffset: 0,
  reminderType: 'alarm'
};

function testLogic(task) {
  const type = task.reminderType || 'notification';
  const isAlarm = type === 'alarm' || type === 'both';
  
  const payload = {
    content: {
      title: isAlarm ? `⏰ ALARM: ${task.title}` : `🔔 Task Reminder: ${task.title}`,
      sound: true,
      vibrate: isAlarm ? [0, 1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000] : [0, 250, 250, 250],
      priority: isAlarm ? 'MAX' : 'HIGH',
      channelId: isAlarm ? 'alarm-channel' : 'default',
    }
  };

  mockNotifications.scheduleNotificationAsync(payload);
}

console.log('Testing Alarm Type:');
testLogic(mockTask);

console.log('\nTesting Notification Type:');
testLogic({...mockTask, reminderType: 'notification'});
