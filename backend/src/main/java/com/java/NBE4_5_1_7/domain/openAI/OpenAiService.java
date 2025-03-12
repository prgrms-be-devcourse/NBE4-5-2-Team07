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
                    "당신은 신입 개발자를 대상으로 프로젝트 경험에 관한 기술 면접을 진행하는 면접관입니다. 면접자의 프로젝트 경험에 대해 면접을 진행합니다. " +
                            "경험했던 프로젝트 주제가 무엇였고, 해당 프로젝트에서 맡은 역할이 무엇 이였나요? 라고 질문하세요" +
                            "첫 질문은 간단 명료하게 질문하세요." + "이상하거나 부적절한 단어를 붙이지 마세요" + "대화 주제와 내용에 상관없는 질문은 절대 하지 마십시오."
                            );
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
                    "면접자의 답변을 참고하여, " +
                            "먼저 프로젝트에서 맡은 역할과 개발한 기능에 대해 설명한 내용 중, " +
                            "해당 기능을 개발하는 과정에서 겪은 어려움과 그 해결 방안에 대해 구체적으로 질문해 주세요. " +
                            "또한, 만약 새로운 기술이나 방법을 도입하여 사용하셨다면, 그 선택 이유에 대해서도 후속 질문으로 추가할 수 있도록 해주세요. " +
                            "단, 후속 질문은 총 3개를 넘지 않아야 합니다.");
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
