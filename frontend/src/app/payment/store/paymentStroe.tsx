import { create } from "zustand";

interface PaymentState {
    paymentData: any;
    setPaymentData: (data: any) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
    paymentData: null,
    setPaymentData: (data) => set({ paymentData: data }),
}));