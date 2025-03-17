"use client"; // Next.js 사용 시 필요

import { useEffect, useState } from "react";
import { usePaymentStore } from "./store/paymentStroe";
import { useRouter } from "next/navigation";

const SubscriptionPayment = () => {
  const router = useRouter();
  const setPaymentData = usePaymentStore().setPaymentData;

  // 아임포트 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "httpss://cdn.iamport.kr/v1/iamport.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 구독 플랜 Enum과 동일하게 설정
  const plans = [
    {
      name: "FREE",
      price: 0,
      durationDays: 0,
      description: "무료로 제공되는 기본 플랜",
      features: ["기본 학습 콘텐츠 이용", "주간 퀴즈 참여", "커뮤니티 이용"],
    },
    {
      name: "PREMIUM",
      price: 100,
      durationDays: 30,
      description: "프리미엄 플랜, 더 많은 기능 제공",
      features: [
        "모든 학습 콘텐츠 무제한 이용",
        "AI 기반 맞춤형 학습 추천",
        "프리미엄 면접 시뮬레이션",
        "개인 학습 분석 리포트",
        "전문가 코드 리뷰",
      ],
      mostPopular: true,
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // 기본값: PREMIUM
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);

  // 결제 요청 함수: 선택한 pg 값을 인자로 받음
  const requestPay = (pgValue: string) => {
    if (!window.IMP) {
      alert("아임포트 스크립트가 로드되지 않았습니다.");
      return;
    }

    const IMP = window.IMP;
    IMP.init(process.env.NEXT_PUBLIC_USER_CODE || ""); // 아임포트 가맹점 식별코드 입력

    IMP.request_pay(
      {
        pg: pgValue, // 전달받은 pg 값 사용
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
            const response = await fetch(
              "https://devapi.store/api/v1/payments/verify",
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imp_uid: rsp.imp_uid }),
              }
            );

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
  const cancelSubscription = async () => {
    try {
      const response = await fetch(
        "https://devapi.store/api/v1/payments/cancel",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (data) {
        setShowCancelModal(false);
        setShowCancelSuccessModal(true);
      } else {
        alert("구독 취소 실패: " + data.message);
      }
    } catch (error) {
      console.error("구독 취소 실패:", error);
      alert("서버 오류로 구독 취소에 실패했습니다.");
    }
  };

  // 모달 내 결제 방식 선택 핸들러
  const handlePaymentMethod = (pgValue: string) => {
    setShowPaymentModal(false);
    requestPay(pgValue);
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* 배경 그라데이션 */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
        {/* 블러 배경 요소 */}
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-blue-300 dark:bg-blue-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-indigo-300 dark:bg-indigo-700 blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-300 dark:bg-purple-700 blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-3">
          DevPrep 구독 플랜
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          취업 역량 강화와 학습 효율을 높이는 최적의 구독 플랜을 선택하세요.
          언제든지 플랜을 변경하거나 취소할 수 있습니다.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${
                selectedPlan.name === plan.name
                  ? "ring-4 ring-indigo-500 dark:ring-indigo-400"
                  : ""
              } ${plan.mostPopular ? "relative" : ""}`}
              onClick={() => setSelectedPlan(plan)}
            >
              {plan.mostPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                  인기 플랜
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {plan.name === "FREE" ? "무료 플랜" : "프리미엄 플랜"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {plan.description}
                </p>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {plan.price}원
                  {plan.durationDays > 0 && (
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{plan.durationDays}일
                    </span>
                  )}
                </p>

                <div className="mt-6 mb-8">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    제공 혜택
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-indigo-500 mr-2 mt-0.5"
                          xmlns="https://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.price === 0) {
                      alert("무료 플랜은 결제가 필요하지 않습니다.");
                      return;
                    }
                    // 백엔드에 회원 정보 요청
                    fetch("https://devapi.store/member/me", {
                      method: "GET",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                    })
                      .then((res) => res.json())
                      .then((result) => {
                        // 응답 결과에서 RsData 내부의 MemberDto 추출 (예: result.data)
                        if (
                          result.data &&
                          result.data.subscriptPlan === "PREMIUM"
                        ) {
                          alert("이미 프리미엄 구독 중 입니다");
                        } else {
                          setShowPaymentModal(true);
                        }
                      })
                      .catch((error) => {
                        console.error("회원 정보 요청 실패:", error);
                      });
                  }}
                  className={`w-full rounded-full py-3 px-6 font-medium transition-all shadow-lg ${
                    plan.price === 0
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                  }`}
                >
                  {plan.price === 0 ? "무료 이용하기" : "구독하기"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={(e) => {
              // 백엔드에 회원 정보 요청
              fetch("https://devapi.store/member/me", {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              })
                .then((res) => res.json())
                .then((result) => {
                  // 응답 결과에서 RsData 내부의 MemberDto 추출 (예: result.data)
                  if (result.data && result.data.subscriptPlan === "FREE") {
                    alert("프리미엄 플랜 구독자가 아닙니다.");
                  } else {
                    setShowCancelModal(true);
                  }
                })
                .catch((error) => {
                  console.error("회원 정보 요청 실패:", error);
                });
            }}
            className="py-3 px-6 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors border border-red-200 dark:border-red-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            구독 취소
          </button>
        </div>
      </div>

      {/* 결제 방식 선택 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            {/* 모달 배경 효과 */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-blue-300 dark:bg-blue-800 opacity-20 blur-xl"></div>
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-purple-300 dark:bg-purple-800 opacity-20 blur-xl"></div>

            <div className="relative p-6">
              <h3 className="text-xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text mb-6">
                결제 수단 선택
              </h3>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <button
                  onClick={() => handlePaymentMethod("html5_inicis")}
                  className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    신용/체크카드
                  </span>
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handlePaymentMethod("kakaopay")}
                  className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    카카오페이
                  </span>
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.898 5.516 5 6.934V22l5.34-4.005C17.697 17.848 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.67 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 구독 취소 확인 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            <div className="relative p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
                정말 구독을 취소하시겠습니까?
              </h3>

              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                취소 버튼을 선택하시면 현재 이용중인 프리미엄 플랜 혜택을 더이상
                받지 못합니다.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={cancelSubscription}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  구독 유지하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 구독 취소 완료 모달 */}
      {showCancelSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            <div className="relative p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="https://www.w3.org/2000/svg"
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-4">
                프리미엄 플랜 구독 취소 되었습니다
              </h3>

              <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                구독 기간이 종료될 때까지 프리미엄 혜택을 계속 이용하실 수
                있습니다.
              </p>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowCancelSuccessModal(false)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full shadow-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPayment;
