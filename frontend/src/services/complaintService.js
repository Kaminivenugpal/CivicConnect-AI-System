import api from './api';

export const complaintService = {
  // Pre-submission AI categorization & priority preview
  async analyzeComplaint(title, description) {
    const response = await api.post('/complaints/analyze', { title, description });
    return response.data;
  },

  // Submit new complaint with multipart file evidence
  async submitComplaint(formData) {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get logged-in citizen complaints with filters
  async getMyComplaints(params = {}) {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  // Get single complaint details
  async getComplaintById(id) {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Get complaint status audit history and remarks
  async getComplaintHistory(id) {
    const response = await api.get(`/complaints/${id}/history`);
    return response.data;
  },

  // Get citizen dashboard metrics
  async getCitizenDashboardStats() {
    const response = await api.get('/complaints/stats');
    return response.data;
  }
};
