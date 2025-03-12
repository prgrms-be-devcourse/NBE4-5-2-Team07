"use client"; // Next.js 사용 시 필요

import { useEffect, useState } from "react";

const SubscriptionPayment = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // 구독 플랜 Enum과 동일하게 설정
    const plans = [
        { name: "FREE", price: 0, durationDays: 0 },
        { name: "PREMIUM", price: 100, durationDays: 30 },
    ];

    const [selectedPlan, setSelectedPlan] = useState(plans[1]); // 기본값: PREMIUM

    const requestPay = () => {
        if (!window.IMP) {
            alert("아임포트 스크립트가 로드되지 않았습니다.");
            return;
        }

        const IMP = window.IMP;
        IMP.init("imp82187830"); // 아임포트 가맹점 식별코드 입력

        IMP.request_pay(
            {
                pg: "html5_inicis",
                pay_method: "card",
                merchant_uid: "order_1", // 고유 주문번호
                name: selectedPlan.name, // 선택한 구독 플랜 이름
                amount: selectedPlan.price, // 선택한 플랜 가격
                buyer_email: "user@example.com",
                buyer_name: "사용자",
                buyer_tel: "010-1234-5678",
                buyer_addr: "서울시 강남구",
                buyer_postcode: "12345",
            },
            async (rsp: any) => {
                if (rsp.success) {
                    try {
                        const response = await fetch("http://localhost:8080/api/v1/payments/verify", {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ imp_uid: rsp.imp_uid, plan: selectedPlan.name }),
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
            <label>구독 플랜 선택: </label>
            <select
                value={selectedPlan.name}
                onChange={(e) => {
                    const plan = plans.find((p) => p.name === e.target.value);
                    if (plan) setSelectedPlan(plan);
                }}
            >
                {plans.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                        {plan.name} - {plan.price}원
                    </option>
                ))}
            </select>
            <br/>
            <button onClick={requestPay} disabled={selectedPlan.price === 0}>
                {selectedPlan.price === 0 ? "무료 플랜" : "결제하기"}
            </button>
        </div>
    );
};

export default SubscriptionPayment;
