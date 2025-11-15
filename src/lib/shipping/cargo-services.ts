import axios from 'axios';

// Aras Kargo Service
export class ArasKargoService {
    private apiUrl = 'https://api.araskargo.com.tr';
    private username: string;
    private password: string;

    constructor() {
        this.username = process.env.ARAS_USERNAME || '';
        this.password = process.env.ARAS_PASSWORD || '';
    }

    async createShipment(orderData: {
        senderName: string;
        senderPhone: string;
        senderAddress: string;
        senderCity: string;
        senderDistrict: string;
        receiverName: string;
        receiverPhone: string;
        receiverAddress: string;
        receiverCity: string;
        receiverDistrict: string;
        weight: number;
        pieces: number;
        paymentType: 'SENDER' | 'RECEIVER';
        description: string;
    }) {
        const shipmentData = {
            Username: this.username,
            Password: this.password,
            SenderName: orderData.senderName,
            SenderPhone: orderData.senderPhone,
            SenderAddress: orderData.senderAddress,
            SenderCity: orderData.senderCity,
            SenderDistrict: orderData.senderDistrict,
            ReceiverName: orderData.receiverName,
            ReceiverPhone: orderData.receiverPhone,
            ReceiverAddress: orderData.receiverAddress,
            ReceiverCity: orderData.receiverCity,
            ReceiverDistrict: orderData.receiverDistrict,
            Weight: orderData.weight,
            Pieces: orderData.pieces,
            PaymentType: orderData.paymentType,
            Description: orderData.description
        };

        try {
            const response = await axios.post(`${this.apiUrl}/shipment/create`, shipmentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async trackShipment(trackingNumber: string) {
        try {
            const response = await axios.get(`${this.apiUrl}/shipment/track/${trackingNumber}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Yurtiçi Kargo Service
export class YurticiKargoService {
    private apiUrl = 'https://ws.yurticikargo.com';
    private userCode: string;
    private password: string;

    constructor() {
        this.userCode = process.env.YURTICI_USER_CODE || '';
        this.password = process.env.YURTICI_PASSWORD || '';
    }

    async createShipment(orderData: {
        senderName: string;
        senderPhone: string;
        senderAddress: string;
        senderCity: string;
        receiverName: string;
        receiverPhone: string;
        receiverAddress: string;
        receiverCity: string;
        weight: number;
        pieces: number;
        cargoType: string;
        paymentType: 'SENDER' | 'RECEIVER';
    }) {
        const shipmentData = {
            userCode: this.userCode,
            password: this.password,
            senderCustomerName: orderData.senderName,
            senderCustomerPhone: orderData.senderPhone,
            senderCustomerAddress: orderData.senderAddress,
            senderCustomerCityName: orderData.senderCity,
            receiverCustomerName: orderData.receiverName,
            receiverCustomerPhone: orderData.receiverPhone,
            receiverCustomerAddress: orderData.receiverAddress,
            receiverCustomerCityName: orderData.receiverCity,
            weight: orderData.weight,
            pieceCount: orderData.pieces,
            cargoType: orderData.cargoType,
            paymentType: orderData.paymentType
        };

        try {
            const response = await axios.post(`${this.apiUrl}/shipment/create`, shipmentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async trackShipment(trackingNumber: string) {
        try {
            const response = await axios.get(`${this.apiUrl}/shipment/track`, {
                params: {
                    userCode: this.userCode,
                    password: this.password,
                    invoiceNumber: trackingNumber
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// PTT Kargo Service
export class PTTKargoService {
    private apiUrl = 'https://api.ptt.gov.tr';
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.PTT_API_KEY || '';
    }

    async createShipment(orderData: {
        senderName: string;
        senderPhone: string;
        senderAddress: string;
        senderPostalCode: string;
        receiverName: string;
        receiverPhone: string;
        receiverAddress: string;
        receiverPostalCode: string;
        weight: number;
        serviceType: string;
    }) {
        const shipmentData = {
            apiKey: this.apiKey,
            senderInfo: {
                name: orderData.senderName,
                phone: orderData.senderPhone,
                address: orderData.senderAddress,
                postalCode: orderData.senderPostalCode
            },
            receiverInfo: {
                name: orderData.receiverName,
                phone: orderData.receiverPhone,
                address: orderData.receiverAddress,
                postalCode: orderData.receiverPostalCode
            },
            packageInfo: {
                weight: orderData.weight,
                serviceType: orderData.serviceType
            }
        };

        try {
            const response = await axios.post(`${this.apiUrl}/kargo/create`, shipmentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async trackShipment(trackingNumber: string) {
        try {
            const response = await axios.get(`${this.apiUrl}/kargo/track`, {
                params: {
                    apiKey: this.apiKey,
                    trackingNumber: trackingNumber
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

// Unified Cargo Service
export class CargoService {
    private aras: ArasKargoService;
    private yurtici: YurticiKargoService;
    private ptt: PTTKargoService;

    constructor() {
        this.aras = new ArasKargoService();
        this.yurtici = new YurticiKargoService();
        this.ptt = new PTTKargoService();
    }

    async createShipment(provider: 'aras' | 'yurtici' | 'ptt', orderData: any) {
        switch (provider) {
            case 'aras':
                return await this.aras.createShipment(orderData);
            case 'yurtici':
                return await this.yurtici.createShipment(orderData);
            case 'ptt':
                return await this.ptt.createShipment(orderData);
            default:
                throw new Error('Unsupported cargo provider');
        }
    }

    async trackShipment(provider: 'aras' | 'yurtici' | 'ptt', trackingNumber: string) {
        switch (provider) {
            case 'aras':
                return await this.aras.trackShipment(trackingNumber);
            case 'yurtici':
                return await this.yurtici.trackShipment(trackingNumber);
            case 'ptt':
                return await this.ptt.trackShipment(trackingNumber);
            default:
                throw new Error('Unsupported cargo provider');
        }
    }

    // Kargo ücret hesaplama
    async calculateShippingCost(
        provider: 'aras' | 'yurtici' | 'ptt',
        fromCity: string,
        toCity: string,
        weight: number,
        dimensions?: { length: number; width: number; height: number }
    ) {
        // Her kargo firmasının kendi fiyat hesaplama sistemi
        const basePrices = {
            aras: 15,
            yurtici: 12,
            ptt: 10
        };

        const distanceMultiplier = this.calculateDistanceMultiplier(fromCity, toCity);
        const weightMultiplier = Math.ceil(weight / 1000) || 1;
        
        let totalCost = basePrices[provider] * distanceMultiplier * weightMultiplier;

        // Hacim ağırlığı hesaplama
        if (dimensions) {
            const volumeWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
            if (volumeWeight > weight) {
                totalCost = basePrices[provider] * distanceMultiplier * Math.ceil(volumeWeight / 1000);
            }
        }

        return {
            provider,
            cost: totalCost,
            currency: 'TRY',
            estimatedDeliveryDays: this.getEstimatedDeliveryDays(provider, fromCity, toCity)
        };
    }

    private calculateDistanceMultiplier(fromCity: string, toCity: string): number {
        // Basit mesafe hesaplama - gerçek uygulamada daha detaylı olmalı
        const majorCities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
        
        if (fromCity === toCity) return 1;
        if (majorCities.includes(fromCity) && majorCities.includes(toCity)) return 1.2;
        if (majorCities.includes(fromCity) || majorCities.includes(toCity)) return 1.5;
        
        return 2;
    }

    private getEstimatedDeliveryDays(provider: string, fromCity: string, toCity: string): number {
        const baseDeliveryDays = {
            aras: 2,
            yurtici: 3,
            ptt: 4
        };

        const distanceMultiplier = this.calculateDistanceMultiplier(fromCity, toCity);
        return Math.ceil(baseDeliveryDays[provider as keyof typeof baseDeliveryDays] * distanceMultiplier);
    }
}

export const cargoService = new CargoService();
