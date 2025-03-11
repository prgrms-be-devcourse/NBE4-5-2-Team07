"use client";
import React, { useEffect } from "react";

// 아임포트 스크립트 로드
declare global {
    interface Window {
        IMP?: Iamport;
    }
}

const PaymentPage: React.FC = () => {
    // 아임포트 코드 (환경 변수로 관리)
    const impCode = "imp82187830";

    // 결제 처리 함수
    const handlePayment = (pg: string, payMethod: string) => {
        if (!window.IMP) {
            alert("아임포트 스크립트가 로드되지 않았습니다.");
            return;
        }

        console.log("handlePayment");
        console.log(pg);
        console.log(payMethod);

        const order = {
            productId: 1,
            productName: "상품1",
            price: 3000,
            quantity: 1,
        };

        // 결제 요청
        window.IMP.init(impCode);
        window.IMP.request_pay(
            {
                pg: "kakaopay", // 올바른 카카오페이 PG사 사용
                pay_method: payMethod,
                merchant_uid: `mid_${new Date().getTime()}`, // 주문번호 생성
                name: "상품1",
                amount: 3000, // 결제 금액
                buyer_email: "test@example.com", // 구매자 이메일
                buyer_name: "김민규", // 구매자 이름
                buyer_tel: "010-1234-5678", // 구매자 전화번호
                buyer_addr: "서울특별시 강남구 역삼동", // 구매자 주소
                buyer_postcode: "123-456", // 구매자 우편번호
            },
            (rsp: any) => {
                if (rsp.success) {
                    // 결제 성공 시
                    fetch(`api/v1/payment/validation/${rsp.imp_uid}`, {
                        method: "POST",
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            if (order.price === data.response.amount) {
                                // order.impUid = rsp.imp_uid;
                                // order.merchantUid = rsp.merchant_uid;

                                fetch("api/v1/payment/order", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(order),
                                })
                                    .then((res) => res.json())
                                    .then(() => {
                                        const msg = `결제가 완료되었습니다.\n고유ID: ${rsp.imp_uid}\n상점 거래ID: ${rsp.merchant_uid}\n결제 금액: ${rsp.paid_amount}\n카드 승인번호: ${rsp.apply_num}`;
                                        alert(msg);
                                    })
                                    .catch(() => {
                                        alert("주문정보 저장을 실패 했습니다.");
                                    });
                            }
                        })
                        .catch(() => {
                            alert("결제에 실패하였습니다. " + rsp.error_msg);
                        });
                } else {
                    alert(rsp.error_msg);
                }
            }
        );
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
        script.async = true;
        document.body.appendChild(script);

        // 클린업: 스크립트 제거
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            <h1>결제 페이지</h1>
            <div className="card text-center">
                <div className="card-body">
                    <h5 className="card-title mb-4">결제하기😎😎</h5>
                    <button
                        id="cardPay"
                        onClick={() => handlePayment("html5_inicis.INIpayTest", "card")}
                    >
                        카드 결제
                    </button>
                    <button
                        id="kakaoPay"
                        onClick={() => handlePayment("kakaopay", "card")}
                    >
                        카카오페이 결제
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
