package com.java.NBE4_5_1_7.domain.payment.controller;

import com.java.NBE4_5_1_7.domain.payment.dto.reqestDto.PaymentRequestDto;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import com.java.NBE4_5_1_7.domain.payment.service.PaymentService;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponseDto> verifyPayment(@RequestBody PaymentRequestDto requestDto) {
        return ResponseEntity.ok(paymentService.verifyPayment(requestDto));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        String impUid = (String) payload.get("imp_uid");  // 웹훅에서 imp_uid 가져오기
        if (impUid == null) {
            return ResponseEntity.badRequest().body("존재하지 않는 imp 번호 입니다.");
        }

        // 포트원 API를 호출해 결제 정보 조회
        IamportResponse<Payment> paymentResponse = paymentService.getPaymentData(impUid);

        if (paymentResponse == null || paymentResponse.getResponse() == null) {
            return ResponseEntity.badRequest().body("결제 정보 조회 실패");
        }

        Payment payment = paymentResponse.getResponse();

        // DB에 결제 상태 업데이트
        paymentService.updatePaymentStatus(payment);

        return ResponseEntity.ok("웹훅 조회 성공");
    }
}