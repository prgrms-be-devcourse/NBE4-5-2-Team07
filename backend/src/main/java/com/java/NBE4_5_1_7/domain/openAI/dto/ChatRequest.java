package com.java.NBE4_5_1_7.domain.openAI.dto;

import com.java.NBE4_5_1_7.domain.openAI.Message;

import java.util.List;

public class ChatRequest {
    private String model;
    private List<Message> messages;

    public ChatRequest() {}

    public ChatRequest(String model, List<Message> messages) {
        this.model = model;
        this.messages = messages;
    }

    // getters & setters
    public String getModel() {
        return model;
    }
    public void setModel(String model) {
        this.model = model;
    }
    public List<Message> getMessages() {
        return messages;
    }
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }
}