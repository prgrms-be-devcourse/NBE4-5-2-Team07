package com.java.NBE4_5_1_7.domain.openAI;


import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.openAI.dto.InterviewEvaluationDto;
import com.java.NBE4_5_1_7.domain.openAI.dto.InterviewNextDto;
import com.java.NBE4_5_1_7.domain.openAI.dto.InterviewStartDto;
import com.java.NBE4_5_1_7.global.customAnnotation.PremiumAccess;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewAIController {

    private final OpenAiService openAiService;
    private final MemberService memberService;

//    public InterviewAIController(OpenAiService openAiService) {
//        this.openAiService = openAiService;
//    }

    /**
     * 인터뷰 시작 엔드포인트
     * 요청 JSON 예: { "interviewType": "CS" } 또는 { "interviewType": "프로젝트" }
     */
    @PremiumAccess
    @PostMapping("/start")
    public ResponseEntity<String> startInterview(@RequestBody InterviewStartDto dto) {
        String response = openAiService.askStartInterview(dto.getInterviewType());
        return ResponseEntity.ok(response);
    }

    /**
     * 인터뷰 진행(후속 질문) 엔드포인트
     * 요청 JSON 예: { "answer": "사용자 답변", "interviewType": "CS" }
     */
    @PremiumAccess
    @PostMapping("/next")
    public ResponseEntity<String> nextInterview(@RequestBody InterviewNextDto dto) {
        String response = openAiService.askNextInterview(dto.getInterviewType(), dto.getAnswer());
        return ResponseEntity.ok(response);
    }

    @PremiumAccess
    @PostMapping("/evaluation")
    public ResponseEntity<String> evaluateInterview(@RequestBody InterviewEvaluationDto dto) {
        String evaluation = openAiService.evaluateInterview(dto.getConversation());
        return ResponseEntity.ok(evaluation);
    }

}

