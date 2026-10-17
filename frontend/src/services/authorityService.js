import api from './api';

export const authorityService = {
  // Get all complaints for municipal staff with filters & search
  async getAllComplaints(params = {}) {
    const response = await api.get('/authority/complaints', { params });
    return response.data;
  },

  // Get real-time authority statistics & category/status breakdown
  async getDashboardStats() {
    const response = await api.get('/authority/dashboard');
    return response.data;
  },

  // State machine status update
  async updateStatus(complaintId, status, remarks) {
    const response = await api.patch(`/authority/complaints/${complaintId}/status`, {
      status,
      remarks,
    });
    return response.data;
  },

  // Re-classify category or priority
  async updateClassification(complaintId, category, priority, rationale) {
    const response = await api.patch(`/authority/complaints/${complaintId}/classification`, {
      category,
      priority,
      rationale,
    });
    return response.data;
  },

  // Assign department or designated officer
  async assignDepartment(complaintId, department, assignedOfficer) {
    const response = await api.patch(`/authority/complaints/${complaintId}/assignment`, {
      department,
      assignedOfficer,
    });
    return response.data;
  },

  // Add official authority remark
  async addRemark(complaintId, remarkText) {
    const response = await api.post(`/authority/complaints/${complaintId}/remarks`, {
      remarkText,
    });
    return response.data;
  }
};
