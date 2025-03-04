package com.java.NBE4_5_1_7.domain.openAI.dto;

import com.java.NBE4_5_1_7.domain.openAI.Message;

import java.util.List;

public class ChatResponse {
    private List<Choice> choices;

    // getters & setters
    public List<Choice> getChoices() {
        return choices;
    }
    public void setChoices(List<Choice> choices) {
        this.choices = choices;
    }

    public static class Choice {
        private Message message;

        // getters & setters
        public Message getMessage() {
            return message;
        }
        public void setMessage(Message message) {
            this.message = message;
        }
    }
}
