const GTAG_URL = 'https://www.googletagmanager.com/gtag/js';
const GA_ID = 'G-G3DB3NVECG';

// Intercept GA requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  if (url.href.startsWith(GTAG_URL)) {
    event.respondWith(
      // Check cache first
      caches.match(event.request)
        .then(response => {
          if (response) return response;
          
          // If not in cache, fetch and cache
          return fetch(event.request)
            .then(response => {
              const clonedResponse = response.clone();
              caches.open('ga-cache')
                .then(cache => cache.put(event.request, clonedResponse));
              return response;
            });
        })
    );
  }
});

// Handle analytics data
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GA_DATA') {
    // Queue analytics data if offline
    if (!self.navigator.onLine) {
      saveDataToQueue(event.data.payload);
      return;
    }
    
    // Send analytics data
    sendAnalyticsData(event.data.payload);
  }
});

// Store offline analytics data
const saveDataToQueue = async (payload) => {
  const queue = await getAnalyticsQueue();
  queue.push({
    timestamp: Date.now(),
    payload
  });
  await saveAnalyticsQueue(queue);
};

// Process queued data when online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(sendQueuedAnalytics());
  }
});

// Send queued analytics data
const sendQueuedAnalytics = async () => {
  const queue = await getAnalyticsQueue();
  if (!queue.length) return;
  
  for (const item of queue) {
    await sendAnalyticsData(item.payload);
  }
  
  await saveAnalyticsQueue([]);
};

// Helper function to send analytics data
const sendAnalyticsData = async (payload) => {
  try {
    await fetch(`https://www.google-analytics.com/g/collect?${new URLSearchParams(payload)}`);
  } catch (error) {
    console.error('Failed to send analytics:', error);
  }
};

// IndexedDB helpers for queue management
const getAnalyticsQueue = async () => {
  // Implementation depends on your storage method
  // This is a simple example using localStorage
  const queue = localStorage.getItem('analytics-queue');
  return queue ? JSON.parse(queue) : [];
};

const saveAnalyticsQueue = async (queue) => {
  localStorage.setItem('analytics-queue', JSON.stringify(queue));
}; 