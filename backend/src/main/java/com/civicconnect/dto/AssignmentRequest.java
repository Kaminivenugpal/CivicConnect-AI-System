package com.civicconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignmentRequest {

    @NotBlank(message = "Department is required")
    private String department;

    private String assignedOfficer;

    public AssignmentRequest() {
    }

    public AssignmentRequest(String department, String assignedOfficer) {
        this.department = department;
        this.assignedOfficer = assignedOfficer;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }
}
