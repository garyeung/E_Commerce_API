import Stripe from "stripe";

class PaymentService{
    private stripe: Stripe
    private webhookKey: string

    constructor(apikey: string, webhookSecret: string){
        this.stripe = new Stripe(apikey);
        this.webhookKey = webhookSecret;
        this.createPaymentIntent.bind(this);
        this.createWebhookEvent.bind(this);
    }

    async createPaymentIntent(orderId: number, amount: number){
        try {
            return await this.stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    orderId 
                } 
            });
        } catch (error) {
            throw new Error("Error creating payment intent");
        }
    }    

    async createWebhookEvent(payload: string | Buffer,header: string | Buffer | string[]){
        try {
            return this.stripe.webhooks.constructEvent(payload, header,this.webhookKey)
            
        } catch (err) {

            throw new Error("Webhook signature verification failed");
            
        }
    }

}

export default PaymentService;