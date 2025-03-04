package com.java.NBE4_5_1_7.domain.openAI.dto;

import com.java.NBE4_5_1_7.domain.openAI.Message;

import java.util.List;

public class InterviewEvaluationDto {
    private List<Message> conversation;

    public List<Message> getConversation() {
        return conversation;
    }

    public void setConversation(List<Message> conversation) {
        this.conversation = conversation;
    }
}
