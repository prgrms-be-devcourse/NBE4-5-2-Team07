package com.java.NBE4_5_1_7.domain.payment.controller;

import com.java.NBE4_5_1_7.domain.payment.entity.KakaoReadyResponse;
import com.java.NBE4_5_1_7.domain.payment.service.KakaoPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment")
public class KakaoPayController {
    private final KakaoPayService kakaoPayService;

    @PostMapping("/ready")
    public KakaoReadyResponse readyToKakaoPay() {
        return kakaoPayService.kakaoPayReady();
    }
}
