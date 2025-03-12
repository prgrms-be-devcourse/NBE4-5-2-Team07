package com.java.NBE4_5_1_7.domain.openAI;

import com.java.NBE4_5_1_7.domain.openAI.dto.ChatRequest;
import com.java.NBE4_5_1_7.domain.openAI.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Arrays;
import java.util.List;

@Service
public class OpenAiService {

    private final WebClient webClient;

    @Value("${openai.api.key}")
    private String apiKey;

    public OpenAiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.openai.com/v1").build();
    }

    /**
     * CS 인터뷰 시작 시 초기 질문 생성 (꼬리질문 규칙 포함)
     */
    public String askStartInterview(String interviewType) {
        Message systemMessage;
        if ("CS".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 신입 개발자를 대상으로 CS 지식에 관한 기술 면접을 진행하는 면접관입니다. " +
                            "지원자의 기초 CS 지식과 논리적 사고를 평가할 수 있는 구체적이고 현실적인 질문을 생성하세요. " +
                            "한 주제에 대해서는 최초 질문에 대한 후속(꼬리) 질문을 지원자의 답변을 듣고 하나씩 순차적으로 생성하며, " +
                            "최대 3개까지만 허용됩니다. 만약 지원자의 답변이 충분하다면 꼬리 질문 없이 바로 새로운 주제로 전환해 주세요. " +
                            "이상하거나 부적절한 질문은 절대 하지 마십시오.");
        } else if ("프로젝트".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 면접관입니다. 면접자의 프로젝트 경험에 대해 면접을 진행합니다. " +
                            "프로젝트 주제, 맡은 역할, 개발 기능, 어려움, 해결 방법 등을 바탕으로 구체적이고 현실적인 질문을 생성하며, " +
                            "답변이 부족할 경우 추가 질문을 하세요.");
        } else {
            systemMessage = new Message("system", "면접을 시작합니다. 구체적이고 현실적인 질문만 생성하세요.");
        }

        List<Message> messages = Arrays.asList(systemMessage);
        ChatRequest chatRequest = new ChatRequest("gpt-3.5-turbo", messages);

        ChatResponse chatResponse = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .block();

        if (chatResponse != null && !chatResponse.getChoices().isEmpty()) {
            return chatResponse.getChoices().get(0).getMessage().getContent();
        }
        return "죄송합니다. 초기 질문을 생성하는 중 오류가 발생했습니다.";
    }

    /**
     * CS 인터뷰 진행 중 후속(꼬리) 질문 생성 (답변에 따라 꼬리 질문을 하나씩 생성하며, 최대 3개까지 허용)
     */
    public String askNextInterview(String interviewType, String answer) {
        Message systemMessage;
        if ("CS".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 신입 개발자를 대상으로 CS 지식에 관한 기술 면접을 진행하는 면접관입니다. " +
                            "지금은 지원자의 답변을 바탕으로 후속 질문(꼬리 질문)을 하나 생성해 주세요. " +
                            "단, 최초 질문에 대해 생성되는 꼬리 질문은 총 3개를 넘지 않아야 하며, " +
                            "지원자의 답변이 충분할 경우에는 꼬리 질문 없이 바로 새로운 주제로 전환할 수 있습니다. " +
                            "각 꼬리 질문은 답변 내용을 심도 있게 검증할 수 있도록 구체적이고 현실적으로 작성해 주세요. " +
                            "이상하거나 엉뚱한 질문은 하지 마십시오.");
        } else if ("프로젝트".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 면접관입니다. 면접자의 프로젝트 경험에 대해 면접을 진행합니다. " +
                            "지원자의 답변을 바탕으로 추가 질문이나 피드백을 제공할 때, 구체적이고 현실적인 질문을 생성하세요.");
        } else {
            systemMessage = new Message("system", "면접을 진행합니다. 구체적이고 현실적인 후속 질문만 생성하세요.");
        }

        Message userMessage = new Message("user", "지원자의 답변: " + answer);
        List<Message> messages = Arrays.asList(systemMessage, userMessage);
        ChatRequest chatRequest = new ChatRequest("gpt-3.5-turbo", messages);

        ChatResponse chatResponse = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .block();

        if (chatResponse != null && !chatResponse.getChoices().isEmpty()) {
            return chatResponse.getChoices().get(0).getMessage().getContent();
        }
        return "죄송합니다. 후속 질문을 생성하는 중 오류가 발생했습니다.";
    }

    public String evaluateInterview(List<Message> conversation) {
        StringBuilder transcript = new StringBuilder();
        for (Message msg : conversation) {
            transcript.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }
        String evalPrompt = "아래는 면접 질문 및 답변 목록입니다:\n\n" + transcript.toString() +
                "\n위 대화 내용을 바탕으로, 각 질문별로 지원자의 답변에서 부족했던 부분과 보완해야 할 점을 구체적이고 현실적으로 분석하고, " +
                "모범 답변을 제시해주세요. 단, 분석과 모범 답변은 불필요하게 추상적이거나 이상한 내용이 없도록 작성해야 합니다. " +
                "특정 기술이나 용어를 제외하고 모든 답변은 한국어로 해야 합니다.";

        Message systemMessage = new Message("system", evalPrompt);
        List<Message> messages = Arrays.asList(systemMessage);
        ChatRequest chatRequest = new ChatRequest("gpt-3.5-turbo", messages);

        ChatResponse chatResponse = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .block();

        if (chatResponse != null && !chatResponse.getChoices().isEmpty()) {
            return chatResponse.getChoices().get(0).getMessage().getContent();
        }
        return "죄송합니다. 평가 결과를 생성하는 중 오류가 발생했습니다.";
    }
}
