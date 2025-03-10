package com.java.NBE4_5_1_7.domain.payment.service;

import com.java.NBE4_5_1_7.domain.payment.entity.KakaoReadyResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KakaoPayService {
    private final RestTemplate restTemplate = new RestTemplate();
    private KakaoReadyResponse kakaoReadyResponse;

    @Value("${kakaoPay.secretKey}")
    private String secretKey;

    @Value("${kakaoPay.cid}")
    private String cid;

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = "SECRET_KEY " + secretKey;
        headers.set("Authorization", auth);
        headers.set("Content-Type", "application/json");
        return headers;
    }
    /**
     * 결제 완료 요청
     */
    public KakaoReadyResponse kakaoPayReady() {
        Map<String, Object> parameters = new HashMap<>();

        parameters.put("cid", cid);
        parameters.put("partner_order_id", "ORDER_ID"); // 실제 주문 번호로 교체
        parameters.put("partner_user_id", "USER_ID");   // 실제 사용자 ID로 교체
        parameters.put("item_name", "ITEM_NAME");       // 실제 상품명으로 교체
        parameters.put("quantity", "1");                 // 수량, 숫자는 문자열로 전달
        parameters.put("total_amount", "2200");          // 총 금액, 숫자는 문자열로 전달
        parameters.put("vat_amount", "200");             // 부가세, 숫자는 문자열로 전달
        parameters.put("tax_free_amount", "0");          // 비과세 금액, 숫자는 문자열로 전달
        parameters.put("approval_url", "Web에서 등록한 URL/success");
        parameters.put("fail_url", "Web에서 등록한 URL/fail");
        parameters.put("cancel_url", "Web에서 등록한 URL/cancel");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(parameters, this.getHeaders());


        // 외부에 보낼 url
        RestTemplate restTemplate = new RestTemplate();

        kakaoReadyResponse = restTemplate.postForObject(
                "https://open-api.kakaopay.com/online/v1/payment/ready",
                requestEntity,
                KakaoReadyResponse.class);
        return kakaoReadyResponse;
    }
}