import crypto from 'crypto';

export interface PayTRConfig {
    merchant_id: string;
    merchant_key: string;
    merchant_salt: string;
}

export interface PayTRPaymentData {
    merchant_id: string;
    user_ip: string;
    merchant_oid: string;
    email: string;
    payment_amount: string;
    paytr_token: string;
    user_basket: string;
    debug_on: string;
    no_installment: string;
    max_installment: string;
    user_name: string;
    user_address: string;
    user_phone: string;
    merchant_ok_url: string;
    merchant_fail_url: string;
    timeout_limit: string;
    currency: string;
    test_mode: string;
}

export class PayTRService {
    private config: PayTRConfig;

    constructor(config: PayTRConfig) {
        this.config = config;
    }

    // PayTR token oluştur
    generateToken(data: {
        merchant_oid: string;
        email: string;
        payment_amount: number;
        user_basket: string;
        no_installment: string;
        max_installment: string;
        user_name: string;
        user_address: string;
        user_phone: string;
        merchant_ok_url: string;
        merchant_fail_url: string;
        user_ip: string;
    }): string {
        const hashStr =
            this.config.merchant_id +
            data.user_ip +
            data.merchant_oid +
            data.email +
            (data.payment_amount * 100).toString() + // PayTR kuruş cinsinden çalışır
            data.user_basket +
            data.no_installment +
            data.max_installment +
            data.user_name +
            data.user_address +
            data.user_phone +
            data.merchant_ok_url +
            data.merchant_fail_url +
            "30" + // timeout_limit
            "TL" + // currency
            "0" + // test_mode (production)
            this.config.merchant_salt;

        const token = crypto.createHmac('sha256', this.config.merchant_key).update(hashStr).digest('base64');
        
        return token;
    }

    // Callback doğrulama
    verifyCallback(data: {
        merchant_oid: string;
        status: string;
        total_amount: string;
        hash: string;
    }): boolean {
        const hashStr = data.merchant_oid + this.config.merchant_salt + data.status + data.total_amount;
        const calculatedHash = crypto.createHmac('sha256', this.config.merchant_key).update(hashStr).digest('base64');

        return calculatedHash === data.hash;
    }

    // Ödeme formu verilerini hazırla
    preparePaymentData(orderData: {
        orderId: string;
        email: string;
        amount: number;
        items: Array<{ name: string; price: number; quantity: number }>;
        userName: string;
        userAddress: string;
        userPhone: string;
        userIp: string;
    }): PayTRPaymentData {
        const merchant_oid = `ORDER-${orderData.orderId}`;
        const payment_amount = (orderData.amount * 100).toString(); // Kuruş cinsinden

        // Sepet bilgilerini JSON formatında hazırla
        const user_basket = JSON.stringify(
            orderData.items.map(item => [
                item.name,
                (item.price * 100).toString(), // Kuruş cinsinden
                item.quantity
            ])
        );

        // Production/Development URL'lerini otomatik belirle
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? process.env.NEXTAUTH_URL || 'https://yourdomain.com'
            : 'http://localhost:3000';

        const tokenData = {
            merchant_oid,
            email: orderData.email,
            payment_amount: orderData.amount,
            user_basket,
            no_installment: "0",
            max_installment: "0",
            user_name: orderData.userName,
            user_address: orderData.userAddress,
            user_phone: orderData.userPhone,
            merchant_ok_url: `${baseUrl}/api/paytr/success`,
            merchant_fail_url: `${baseUrl}/api/paytr/fail`,
            user_ip: orderData.userIp
        };

        const paytr_token = this.generateToken(tokenData);

        const finalData = {
            merchant_id: this.config.merchant_id,
            user_ip: orderData.userIp,
            merchant_oid,
            email: orderData.email,
            payment_amount,
            paytr_token,
            user_basket,
            debug_on: "0", // Debug kapalı
            no_installment: "0",
            max_installment: "0",
            user_name: orderData.userName,
            user_address: orderData.userAddress,
            user_phone: orderData.userPhone,
            merchant_ok_url: tokenData.merchant_ok_url,
            merchant_fail_url: tokenData.merchant_fail_url,
            timeout_limit: "30",
            currency: "TL",
            test_mode: "0" // Production modu
        };
        
        return finalData;
    }
}

// PayTR instance

export const paytr = new PayTRService({
    merchant_id: process.env.PAYTR_MERCHANT_ID!,
    merchant_key: process.env.PAYTR_MERCHANT_KEY!,
    merchant_salt: process.env.PAYTR_MERCHANT_SALT!,
});