const BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchJSON(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Emails & Sales Inbox
  getEmails: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJSON(`/api/emails${q ? `?${q}` : ''}`);
  },
  getEmail: (id) => fetchJSON(`/api/emails/${id}`),
  ingestEmail: (data) => fetchJSON('/api/emails/ingest', { method: 'POST', body: JSON.stringify(data) }),
  syncEmails: () => fetchJSON('/api/emails/sync', { method: 'POST' }),
  analyzeEmail: (id) => fetchJSON(`/api/emails/${id}/analyze`, { method: 'POST' }),
  updatePriority: (id, lead_priority) =>
    fetchJSON(`/api/emails/${id}/priority`, { method: 'PUT', body: JSON.stringify({ lead_priority }) }),
  deleteEmail: (id) => fetchJSON(`/api/emails/${id}`, { method: 'DELETE' }),

  // Pricing Catalogue (₹ INR)
  getPricingCatalogue: () => fetchJSON('/api/pricing'),
  createPricingService: (data) => fetchJSON('/api/pricing', { method: 'POST', body: JSON.stringify(data) }),
  updatePricingService: (id, data) => fetchJSON(`/api/pricing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePricingService: (id) => fetchJSON(`/api/pricing/${id}`, { method: 'DELETE' }),
  matchPricing: (requirements, clientBudget, gstRate = 18.0, isInterstate = false) =>
    fetchJSON('/api/pricing/match', {
      method: 'POST',
      body: JSON.stringify({
        requirements,
        client_budget: clientBudget,
        gst_rate: gstRate,
        is_interstate: isInterstate,
      }),
    }),

  // Proposals & Revisions
  getProposals: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return fetchJSON(`/api/proposals${q ? `?${q}` : ''}`);
  },
  getProposal: (id) => fetchJSON(`/api/proposals/${id}`),
  createProposal: (data) => fetchJSON('/api/proposals', { method: 'POST', body: JSON.stringify(data) }),
  reviseProposal: (id) => fetchJSON(`/api/proposals/${id}/revise`, { method: 'POST' }),
  updateProposal: (id, data) => fetchJSON(`/api/proposals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProposal: (id) => fetchJSON(`/api/proposals/${id}`, { method: 'DELETE' }),
  generatePDF: (id, template) =>
    fetchJSON(`/api/proposals/${id}/generate-pdf${template ? `?template=${template}` : ''}`, { method: 'POST' }),
  sendProposal: (id, data) => fetchJSON(`/api/proposals/${id}/send`, { method: 'POST', body: JSON.stringify(data) }),

  // Follow-Up Reminders
  getFollowUps: () => fetchJSON('/api/proposals/follow-ups'),
  sendFollowUp: (id) => fetchJSON(`/api/proposals/${id}/send-follow-up`, { method: 'POST' }),

  // AI Polish
  polishText: (text, action) => fetchJSON('/api/ai/polish', { method: 'POST', body: JSON.stringify({ text, action }) }),

  // Settings
  getSettings: () => fetchJSON('/api/settings'),
  updateSettings: (data) => fetchJSON('/api/settings', { method: 'POST', body: JSON.stringify(data) }),
};
