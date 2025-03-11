package com.java.NBE4_5_1_7.domain.payment.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.payment.dto.reqestDto.PaymentRequestDto;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import com.java.NBE4_5_1_7.domain.payment.entity.Order;
import com.java.NBE4_5_1_7.domain.payment.repository.OrderRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final OrderRepository orderRepository;
    private final MemberService memberService;
    private IamportClient iamportClient;

    @Value("${imp.key}")
    private String apiKey;

    @Value("${imp.secret_key}")
    private String apiSecret;

    @PostConstruct
    public void initialize() {
        iamportClient = new IamportClient(apiKey, apiSecret);
    }

    // 결제 검증
    public PaymentResponseDto verifyPayment(PaymentRequestDto requestDto) {
        Member member = memberService.getMemberFromRq();
        try {
            String impUid = requestDto.getImp_uid();

            IamportResponse<Payment> paymentResponse = iamportClient.paymentByImpUid(impUid);

            if (paymentResponse == null || paymentResponse.getResponse() == null) {
                throw new RuntimeException("결제 정보를 가져올 수 없습니다.");
            }

            Payment payment = paymentResponse.getResponse();
            PaymentResponseDto responseDto = new PaymentResponseDto(payment);
            if ("paid".equals(payment.getStatus())) {
                saveOrder(responseDto, member);
            }

            return responseDto;
        } catch (Exception e) {
            throw new RuntimeException("결제 검증 중 오류 발생: " + e.getMessage());
        }
    }

    // DB에 결제 정보 저장
    private void saveOrder(PaymentResponseDto paymentResponse, Member member) {
        // 주문 중복 검증
        Optional<Order> existingOrder = orderRepository.findByMerchantUid(paymentResponse.getMerchantUid());

        Order order = existingOrder.orElse(new Order());
        order.setMerchantUid(paymentResponse.getMerchantUid());
        order.setImpUid(paymentResponse.getImpUid());
        order.setAmount(paymentResponse.getAmount());
        order.setStatus(paymentResponse.getStatus());
        order.setMember(member);

        orderRepository.save(order);
    }
}
