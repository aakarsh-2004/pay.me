import express, { Request, Response } from "express";
import { config } from "./config/config";
import { z } from 'zod';
import db, { OnRampStatus } from '../../../packages/db/index';
import cors from 'cors';

const app = express();
const port = config.port;

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:3000"]
}));

const paymentType = z.object({
    token: z.string(),
    user_identifier: z.string(),  // Changed to match frontend
    amount: z.string()
});

type PaymentInformationType = z.infer<typeof paymentType>;

const transactionType = z.object({
    provider: z.string(),
    token: z.string(),
    amount: z.number(),
    userId: z.string()
});

type CreateTransactionType = z.infer<typeof transactionType>;

app.post("/hdfcWebhook", async (req: Request, res: Response) => {
    try {
        const paymentInformation = paymentType.parse(req.body);
        
        await db.$transaction(async (tx: any) => {
            await tx.balance.updateMany({
                where: {
                    userId: paymentInformation.user_identifier
                },
                data: {
                    amount: {
                        increment: parseInt(paymentInformation.amount)
                    }
                }
            });

            await tx.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: OnRampStatus.Success
                }
            });
        });

        res.status(200).json({
            message: "Captured"
        });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(411).json({
            message: 'Error while processing webhook: ' + error
        });
    }
});

app.post('/createTransaction', async (req: Request, res: Response) => {
    try {
        const transactionData = transactionType.parse(req.body);
        
        const transaction = await db.onRampTransaction.create({
            data: {
                provider: transactionData.provider,
                token: transactionData.token,
                amount: transactionData.amount,
                userId: transactionData.userId,
                startTime: new Date(),
                status: OnRampStatus.Processing
            }
        });

        console.log("transaction created:", transaction);

        res.status(200).json({
            message: 'Successfully instantiated transaction',
            data: transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(411).json({
            message: "Error while instantiating the transaction: " + error
        });
    }
});

app.listen(port, () => {
    console.log(`${new Date()} : Server started successfully on port ${port}`);
});