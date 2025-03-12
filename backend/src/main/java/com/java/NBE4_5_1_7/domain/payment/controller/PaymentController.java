package com.java.NBE4_5_1_7.domain.payment.controller;

import com.java.NBE4_5_1_7.domain.payment.dto.reqestDto.PaymentRequestDto;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import com.java.NBE4_5_1_7.domain.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) throws InterruptedException {
        paymentService.handleWebhook(payload);
        return ResponseEntity.ok("웹훅 조회 성공");
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancelledPayments() {
        paymentService.cancelSubscription();
        Map<String, String> response = new HashMap<>();
        response.put("message", "구독 취소 성공");
        return ResponseEntity.ok(response);
    }
}