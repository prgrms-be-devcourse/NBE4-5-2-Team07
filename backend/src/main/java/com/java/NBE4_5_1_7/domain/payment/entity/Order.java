package com.java.NBE4_5_1_7.domain.payment.entity;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.java.NBE4_5_1_7.domain.payment.dto.responseDto.PaymentResponseDto;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "orders")
@RequiredArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "merchant_uid")
    private String merchantUid; // 주문번호

    @Column(nullable = false, name = "imp_uid")
    private String impUid; // 결제 고유번호

    @Column(nullable = false, name = "item_name")
    private String itemName;

    @JoinColumn(name = "member_id")
    @OneToOne(cascade = CascadeType.ALL)
    private Member member;

    @Column(nullable = false)
    private BigDecimal amount; // 결제 금액

    @Column(nullable = false)
    private String status; // 결제 상태 (READY, PAID, CANCELLED 등)

    private LocalDateTime createdAt; // 결제 완료 시간

    public Order(PaymentResponseDto paymentResponseDto, Member member) {
        this.amount =  paymentResponseDto.getAmount();
        this.status = paymentResponseDto.getStatus();
        this.createdAt = LocalDateTime.now();
        this.member = member;
        this.impUid = paymentResponseDto.getImpUid();
        this.merchantUid = paymentResponseDto.getMerchantUid();
        this.itemName = paymentResponseDto.getItem_name();
    }
}
