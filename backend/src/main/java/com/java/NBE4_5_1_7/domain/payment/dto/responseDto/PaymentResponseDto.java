package com.java.NBE4_5_1_7.domain.payment.dto.responseDto;

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

    public PaymentResponseDto(Payment payment) {
        this.impUid = payment.getImpUid();
        this.merchantUid = payment.getMerchantUid();
        this.buyerName = payment.getBuyerName();
        this.buyerEmail = payment.getBuyerEmail();
        this.amount = payment.getAmount();
        this.status = payment.getStatus();
        this.pay_method = payment.getPayMethod();
    }
}

