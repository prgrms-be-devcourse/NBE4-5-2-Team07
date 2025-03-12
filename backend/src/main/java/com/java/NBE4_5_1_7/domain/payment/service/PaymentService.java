package com.java.NBE4_5_1_7.domain.payment.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.payment.dto.reqestDto.PaymentRequestDto;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import com.java.NBE4_5_1_7.domain.payment.entity.Order;
import com.java.NBE4_5_1_7.domain.payment.repository.OrderRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
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

    // 결제 검증 (DB 저장은 하지 않음)
    public PaymentResponseDto verifyPayment(PaymentRequestDto requestDto) {
        Member member = memberService.getMemberFromRq();
        try {
            String impUid = requestDto.getImp_uid();

            IamportResponse<Payment> paymentResponse = iamportClient.paymentByImpUid(impUid);

            if (paymentResponse == null || paymentResponse.getResponse() == null) {
                throw new RuntimeException("결제 정보를 가져올 수 없습니다.");
            }

            Payment payment = paymentResponse.getResponse();
            PaymentResponseDto responseDto = new PaymentResponseDto(payment, member);
            saveOrder(responseDto, member);

            return responseDto;
        } catch (Exception e) {
            throw new RuntimeException("결제 검증 중 오류 발생: " + e.getMessage());
        }
    }

    public void saveOrder(PaymentResponseDto paymentResponseDto, Member member) {
        Order order = new Order(paymentResponseDto, member);
        orderRepository.save(order);
    }

    // 웹훅에서 결제 상태 처리
    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        String impUid = (String) payload.get("imp_uid");  // 웹훅에서 imp_uid 가져오기
        if (impUid == null) {
            throw new IllegalArgumentException("존재하지 않는 imp 번호 입니다.");
        }

        // 포트원 API를 호출해 결제 정보 조회
        IamportResponse<Payment> paymentResponse = getPaymentData(impUid);

        if (paymentResponse == null || paymentResponse.getResponse() == null) {
            throw new RuntimeException("결제 정보 조회 실패");
        }

        Payment payment = paymentResponse.getResponse();
        updatePaymentStatus(payment);  // 결제 상태 업데이트
    }

    // 결제 상태 업데이트
    @Transactional
    public void updatePaymentStatus(Payment payment) {
        Optional<Order> paymentEntityOptional = orderRepository.findByImpUid(payment.getImpUid());

        if (paymentEntityOptional.isPresent()) {
            Order paymentEntity = paymentEntityOptional.get();
            paymentEntity.setStatus(payment.getStatus());  // 결제 상태 업데이트
            paymentEntity.setAmount(payment.getAmount());
            orderRepository.save(paymentEntity);
        } else {
            log.error("결제 정보가 존재하지 않음: " + payment.getImpUid());
        }
    }

    // 아임포트 결제 정보 조회
    public IamportResponse<Payment> getPaymentData(String impUid) {
        try {
            return iamportClient.paymentByImpUid(impUid);
        } catch (IamportResponseException | IOException e) {
            log.error("아임포트 API 호출 실패: " + e.getMessage());
            return null;
        }
    }
}
