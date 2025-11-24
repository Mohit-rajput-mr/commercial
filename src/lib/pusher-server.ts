import Pusher from 'pusher';

// Hardcoded Pusher credentials for testing - will move to .env later
const PUSHER_APP_ID = '2082273';
const PUSHER_KEY = '2d5b5b5b3ac70f656fe8';
const PUSHER_SECRET = '6f591d8634453ba4c23d';
const PUSHER_CLUSTER = 'us2';

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});

// Helper function to trigger an event
export const triggerPusherEvent = async (
  channel: string,
  event: string,
  data: any
) => {
  try {
    await pusherServer.trigger(channel, event, data);
    return { success: true };
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return { success: false, error };
  }
};

// Helper function to trigger multiple events
export const triggerPusherBatch = async (
  batch: Array<{ channel: string; name: string; data: any }>
) => {
  try {
    await pusherServer.triggerBatch(batch);
    return { success: true };
  } catch (error) {
    console.error('Pusher batch trigger error:', error);
    return { success: false, error };
  }
};



