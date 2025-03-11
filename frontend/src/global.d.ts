interface Iamport {
    init: (code: string) => void;
    request_pay: (
        params: {
            pg: string; // PG사
            pay_method: string; // 결제 수단
            merchant_uid: string; // 주문번호
            name: string; // 상품명
            amount: number; // 결제 금액
            buyer_email: string; // 구매자 이메일
            buyer_name: string; // 구매자 이름
            buyer_tel: string; // 구매자 전화번호
            buyer_addr: string; // 구매자 주소
            buyer_postcode: string; // 구매자 우편번호
        },
        callback: (rsp: any) => void
    ) => void;
}

interface Window {
    IMP?: Iamport;
}
