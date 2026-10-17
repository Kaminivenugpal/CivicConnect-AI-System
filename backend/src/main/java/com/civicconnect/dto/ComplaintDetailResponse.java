package com.civicconnect.dto;

import java.util.ArrayList;
import java.util.List;

public class ComplaintDetailResponse extends ComplaintResponse {

    private List<StatusHistoryDto> statusHistory = new ArrayList<>();
    private List<RemarkDto> remarks = new ArrayList<>();

    public ComplaintDetailResponse() {
    }

    public List<StatusHistoryDto> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<StatusHistoryDto> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public List<RemarkDto> getRemarks() {
        return remarks;
    }

    public void setRemarks(List<RemarkDto> remarks) {
        this.remarks = remarks;
    }
}
