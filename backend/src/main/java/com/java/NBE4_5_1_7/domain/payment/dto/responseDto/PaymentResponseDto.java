package com.java.NBE4_5_1_7.domain.payment.dto.responseDto;

import com.java.NBE4_5_1_7.domain.member.entity.Member;
import com.siot.IamportRestClient.response.Payment;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentResponseDto {
    private String impUid;        // 아임포트 결제 고유번호
    private String merchantUid;   // 주문번호
    private String buyerName;     // 구매자 이름
    private String buyerEmail;    // 구매자 이메일
    private BigDecimal amount;           // 결제 금액
    private String status;        // 결제 상태 (paid, cancelled 등)
    private String pay_method;
    private boolean success;
    private String card_name;
    private String item_name;

    public PaymentResponseDto(Payment payment, Member member) {
        this.impUid = payment.getImpUid();
        this.merchantUid = payment.getMerchantUid();
        this.buyerName = member.getNickname();
        this.buyerEmail = payment.getBuyerEmail();
        this.amount = payment.getAmount();
        this.status = payment.getStatus();
        this.pay_method = payment.getPayMethod();
        this.success = true;
        this.card_name = payment.getCardName();
        this.item_name = payment.getName();
    }
}

