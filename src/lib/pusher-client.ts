import Pusher from 'pusher-js';

// Hardcoded Pusher credentials for testing - will move to .env later
const PUSHER_KEY = '2d5b5b5b3ac70f656fe8';
const PUSHER_CLUSTER = 'us2';

// Client-side Pusher instance
export const pusherClient = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
});

// Helper function to subscribe to a channel
export const subscribeToChannel = (channelName: string) => {
  return pusherClient.subscribe(channelName);
};

// Helper function to unsubscribe from a channel
export const unsubscribeFromChannel = (channelName: string) => {
  pusherClient.unsubscribe(channelName);
};

// Helper function to bind to an event
export const bindToEvent = (
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) => {
  const channel = pusherClient.subscribe(channelName);
  channel.bind(eventName, callback);
  return channel;
};



