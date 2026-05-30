

const BASE = '/api';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  
  getAnalytics: () => request('/analytics'),

  
  getReviews: (params = {}) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    const qs = search.toString();
    return request(`/reviews${qs ? `?${qs}` : ''}`);
  },
  getReview: (id) => request(`/reviews/${id}`),
  triggerManualReview: (data) => request('/reviews/manual', { method: 'POST', body: data }),

  
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),
  testConnection: (platform) => request('/settings/test-connection', { method: 'POST', body: { platform } }),

  
  getHealth: () => request('/health'),
};
