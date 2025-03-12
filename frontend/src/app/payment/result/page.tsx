"use client";

import { useRouter } from "next/navigation";
import { usePaymentStore } from "../store/paymentStroe";

export default function PaymentResultPage() {
    const router = useRouter();
    const paymentData = usePaymentStore().paymentData;

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">결제 완료 🎉</h1>
            <p className="text-lg">결제가 성공적으로 완료되었습니다!</p>
            <p className="text-md mt-2">결제 상품: <strong>{paymentData.name} </strong></p>
            <p className="text-md mt-2">결제 금액: <strong>{paymentData.amount} 원</strong></p>
            <p className="text-md">결제 상태: <strong>{paymentData.status}</strong></p>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4" onClick={() => router.push("/")}>
                홈으로 이동
            </button>
        </div>
    );
}
