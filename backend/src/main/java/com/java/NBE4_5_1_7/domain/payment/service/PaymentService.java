package com.java.NBE4_5_1_7.domain.payment.service;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.member.entity.SubscriptionPlan;
import com.java.NBE4_5_1_7.domain.member.service.MemberService;
import com.java.NBE4_5_1_7.domain.payment.dto.reqestDto.PaymentRequestDto;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import com.java.NBE4_5_1_7.domain.payment.entity.Order;
import com.java.NBE4_5_1_7.domain.payment.repository.OrderRepository;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.request.PrepareData;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import com.siot.IamportRestClient.response.Prepare;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@Transactional
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
    @Transactional
    public PaymentResponseDto verifyPayment(PaymentRequestDto requestDto) {
        Member member = memberService.getMemberFromRq();
        try {
            String impUid = requestDto.getImp_uid();
            IamportResponse<Prepare> prepareIamportResponse = iamportClient.postPrepare(new PrepareData(impUid, BigDecimal.valueOf(100)));
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

    @Transactional
    public void saveOrder(PaymentResponseDto paymentResponseDto, Member member) {
        Optional<Order> order = orderRepository.findByMemberAndStatus(member, "cancelled");
        if (order.isPresent()) {
            order.get().setCreatedAt(LocalDateTime.now());  // 결제 검증 시간
            order.get().setMerchantUid(paymentResponseDto.getMerchantUid());
            order.get().setImpUid(paymentResponseDto.getImpUid());
            orderRepository.save(order.get());
        } else {
            orderRepository.save(new Order(paymentResponseDto, member));
        }
    }

    // 웹훅에서 결제 상태 처리
    public void handleWebhook(Map<String, Object> payload) throws InterruptedException {
        Thread.sleep(3000);
        String impUid = (String) payload.get("imp_uid");  // 웹훅에서 imp_uid 가져오기
        if (impUid == null) {
            throw new IllegalArgumentException("존재하지 않는 imp 번호 입니다.");
        }

        // 포트원 API를 호출해 결제 정보 조회
        IamportResponse<Payment> paymentResponse = getPaymentData(impUid);

        if (paymentResponse == null || paymentResponse.getResponse() == null) {
            throw new RuntimeException("결제 정보 조회 실패");
        }
        updatePaymentStatus(paymentResponse.getResponse());
    }

    // 결제 상태 업데이트
    public void updatePaymentStatus(Payment payment) {
        Optional<Order> orderOptional = orderRepository.findByImpUid(payment.getImpUid());

        if (orderOptional.isPresent()) {
            Order orderEntity = orderOptional.get();
            Member member = orderEntity.getMember();

            // 주문 상태 업데이트
            orderEntity.setStatus(payment.getStatus());
            orderEntity.setAmount(payment.getAmount());

            // 결제 상품이 "PREMIUM"이면 Member의 구독 플랜 변경
            if ("PREMIUM".equals(payment.getName())) {
                log.info("PREMIUM 상품 결제 확인됨. 회원 {} 의 구독 상태를 PREMIUM으로 변경합니다.", member.getUsername());
                member.setSubscriptionPlan(SubscriptionPlan.PREMIUM);
                member.setSubscribeEndDate(LocalDateTime.now().plusDays(30));
            }

            orderRepository.save(orderEntity);
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

    // 구독 취소 기능
    public void cancelSubscription() {
        // 1. 회원 정보 조회
        Member member = memberService.getMemberFromRq();

        if (member == null) {
            throw new IllegalArgumentException("존재하지 않는 회원입니다.");
        }

        // 2. 회원의 현재 구독 플랜 상태 확인
        if (SubscriptionPlan.FREE.equals(member.getSubscriptionPlan())) {
            throw new IllegalArgumentException("무료 플랜은 취소할 수 없습니다.");
        }

        // 3. 구독 플랜을 취소 처리
        member.setSubscriptionPlan(SubscriptionPlan.FREE);  // FREE로 설정 (구독 취소)
        memberService.saveMember(member); // 회원 정보 업데이트

        // 4. 회원이 결제한 주문을 찾아서 취소 처리
        Optional<Order> orderOptional = orderRepository.findByMemberAndStatus(member, "paid");  // 결제 완료된 주문을 조회
        if (orderOptional.isPresent()) {
            Order order = orderOptional.get();
            order.setStatus("cancelled");  // 주문 상태를 '취소'로 업데이트
            orderRepository.save(order);  // 취소된 주문 저장
            log.info("회원 {} 의 PREMIUM 구독 취소 처리 완료", member.getUsername());

        } else {
            log.error("결제된 주문을 찾을 수 없습니다. 회원: {}", member.getUsername());
        }
    }
}
