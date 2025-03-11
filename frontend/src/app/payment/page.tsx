"use client"; // Next.js 사용 시 필요

import { useEffect } from "react";

const PaymentPage = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const requestPay = () => {
        if (!window.IMP) {
            alert("아임포트 스크립트가 로드되지 않았습니다.");
            return;
        }

        const IMP = window.IMP;
        IMP.init("imp82187830"); // 아임포트 가맹점 식별코드 입력

        IMP.request_pay(
            {
                pg: "html5_inicis", // ✅ 올바른 PG 값 사용!
                pay_method: "card",
                merchant_uid: "order_" + new Date().getTime(), // 고유 주문번호
                name: "테스트 결제", // 상품명
                amount: 100, // 결제 금액
                buyer_email: "",
                buyer_name: "",
                buyer_tel: "",
                buyer_addr: "",
                buyer_postcode: "",
            },
            async (rsp: any) => {
                if (rsp.success) {
                    console.log("결제 응답 객체:", rsp); // 🔍 디버깅용 콘솔 로그 추가
                    alert("결제 성공! imp_uid: " + rsp.imp_uid);
                    try {
                        const response = await fetch("http://localhost:8080/api/v1/payments/verify", {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                imp_uid: rsp.imp_uid,
                            }),
                        });

                        const data = await response.json();
                        console.log("결제 검증 결과:", data);
                    } catch (error) {
                        console.error("결제 검증 실패:", error);
                    }
                } else {
                    alert("결제 실패: " + rsp.error_msg);
                }
            }
        );
    };

    return (
        <div>
            <button onClick={requestPay}>결제하기</button>
        </div>
    );
};

export default PaymentPage;
