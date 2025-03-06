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
     * 인터뷰 시작 프롬프트를 구성하여 초기 질문 생성
     */
    public String askStartInterview(String interviewType) {
        Message systemMessage;
        if ("CS".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 신입 개발자를 대상으로 CS 지식에 관한 기술 면접을 진행하는 면접관입니다. " +
                            "무작위로 CS 관련 질문을 해주세요.");
        } else if ("프로젝트".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 면접관입니다. 면접자의 프로젝트 경험에 대해 면접을 진행합니다. " +
                            "프로젝트 주제, 맡은 역할, 개발 기능, 어려움, 해결 방법 등을 질문하고, " +
                            "답변이 부족할 경우 추가 질문을 해주세요.");
        } else {
            systemMessage = new Message("system", "면접을 시작합니다.");
        }

        // 사용자가 인터뷰 주제를 선택했으므로 초기 프롬프트에 대한 user 메시지가 필요없고, system 메시지만 전송
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
     * 면접 진행 중 후속 질문을 구성
     */
    public String askNextInterview(String interviewType, String answer) {
        Message systemMessage;
        if ("CS".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 신입 개발자를 대상으로 CS 지식에 관한 기술 면접을 진행하는 면접관입니다. " +
                            "지원자의 답변을 평가하고, 후속 질문을 생성하세요." +
                            "동일하거나, 비슷한 질문에 대한 꼬리 질문은 최대 3번 입니다. 3번이 넘어가면 다른 주제에 대한 질문을 다시 시작하세요." +
                            "지원자의 답변에 대해 충분한 답이 된 것 같다면 다른 주제로 질문하여 면접을 이어가세요."
                    );
        } else if ("프로젝트".equalsIgnoreCase(interviewType)) {
            systemMessage = new Message("system",
                    "당신은 면접관입니다. 면접자의 프로젝트 경험에 대해 면접을 진행합니다. " +
                            "면접자의 답변을 바탕으로 추가 질문이나 피드백을 제공하세요. " +
                            "프로젝트 주제, 맡은 역할, 개발 기능, 어려움, 해결 방법 등에 대해 구체적으로 물어보세요." +
                            "동일하거나, 비슷한 질문에 대한 꼬리 질문은 최대 3번 입니다. 3번이 넘어가면 다른 주제에 대한 질문을 다시 시작하세요." +
                            "해당 프로젝트에서의 사용한 기술이나, 어려움을 극복한 경험 등 심화 질문에 대한 답이 충분히 진행되었다면 다른 질문을 하여 면접을 이어가세요."
            );
        } else {
            systemMessage = new Message("system", "면접을 진행합니다.");
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
        // 대화 기록을 문자열로 조합
        StringBuilder transcript = new StringBuilder();
        for (Message msg : conversation) {
            transcript.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }

        System.out.println(transcript);

        String evalPrompt = "아래는 면접 질문 및 답변 목록입니다:\n\n" + transcript.toString() +
                "\n위 대화 내용을 바탕으로, 각 질문별로 지원자의 답변에서 부족했던 부분과 보완해야 할 점을 분석하고, " +
                "모범 답변을 제시해주세요." +
                "특정 기술이나 용어를 제외하고 모든 답변은 한국어로 해야 합니다";

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
