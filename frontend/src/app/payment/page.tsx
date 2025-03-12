"use client"; // Next.js 사용 시 필요

import { useEffect, useState } from "react";
import { usePaymentStore } from "./store/paymentStroe";
import { useRouter } from "next/navigation";
import styles from "../styles/payment.module.css";

const SubscriptionPayment = () => {
    const router = useRouter();
    const setPaymentData = usePaymentStore().setPaymentData;
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.iamport.kr/v1/iamport.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    // 구독 플랜 Enum과 동일하게 설정
    const plans = [
        { name: "FREE", price: 0, durationDays: 0, description: "무료로 제공되는 기본 플랜" },
        { name: "PREMIUM", price: 100, durationDays: 30, description: "프리미엄 플랜, 더 많은 기능 제공" },
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
                merchant_uid: "order_" + new Date().getTime(), // 고유 주문번호
                name: selectedPlan.name, // 선택한 구독 플랜 이름
                amount: selectedPlan.price, // 선택한 플랜 가격
                buyer_email: "user@example.com",
                buyer_name: "사용자",
                buyer_tel: "010-1234-5678",
                buyer_addr: "서울시 강남구",
                buyer_postcode: "12345",
            },
            async (rsp) => {
                if (rsp.success) {
                    try {
                        const response = await fetch("http://localhost:8080/api/v1/payments/verify", {
                            method: "POST",
                            credentials: "include",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ imp_uid: rsp.imp_uid }),
                        });

                        const data = await response.json();
                        console.log("결제 검증 결과:", data);
                        setPaymentData(data);
                        router.push("/payment/result");
                    } catch (error) {
                        console.error("결제 검증 실패:", error);
                    }
                } else {
                    alert("결제 실패: " + rsp.error_msg);
                }
            }
        );
    };

    // 결제 취소 요청 함수
    const cancelPayment = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/v1/payments/cancel", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (data) {
                alert("결제가 취소되었습니다.");
            } else {
                alert("결제 취소 실패: " + data.message);
            }
        } catch (error) {
            console.error("결제 취소 실패:", error);
            alert("서버 오류로 결제 취소에 실패했습니다.");
        }
    };

    return (
        <div>
            <h2>구독 플랜을 선택하세요</h2>
            <div className={styles.subscriptionPlans}>
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={styles.planCard}
                        onClick={() => setSelectedPlan(plan)} // 카드 클릭 시 선택된 플랜 업데이트
                    >
                        <h3>{plan.name}</h3>
                        <p>{plan.description}</p> {/* 플랜 설명 */}
                        <p className={styles.price}>{plan.price}원</p>
                        <p>유효기간: {plan.durationDays}일</p>
                        <button
                            onClick={requestPay}
                            disabled={plan.price === 0}
                            className={`${styles.planButton} ${selectedPlan.name === plan.name ? styles.selected : ""}`}
                        >
                            {plan.price === 0 ? "무료 플랜" : "결제하기"}
                        </button>
                    </div>
                ))}
            </div>
            <div className={styles.cancelButtonContainer}>
                <button onClick={cancelPayment} className={styles.cancelButton}>
                    결제 취소
                </button>
            </div>
        </div>
    );
};

export default SubscriptionPayment;
