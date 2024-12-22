"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import axios from "axios";
import { config } from "../config/config";
import { useSession } from "next-auth/react";

const SUPPORTED_BANKS = [
    {
        name: "HDFC Bank",
        redirectUrl: "https://netbanking.hdfcbank.com",
    },
    {
        name: "Axis Bank",
        redirectUrl: "https://www.axisbank.com/",
    },
];

interface TransactionResponse {
    message: string;
    data: {
        id: string;
        status: string;
        token: string;
        provider: string;
        amount: number;
        startTime: Date;
        userId: string;
    };
}

export const AddMoney = () => {
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState<"HDFC Bank" | "Axis Bank">("HDFC Bank");
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const session = useSession();

    const generateToken = () => {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const handleClick = async () => {
        if (!amount || !provider || !session.data?.user?.id) {
            console.error('Missing required fields');
            return;
        }

        setIsLoading(true);
        try {
            const token = generateToken(); // Generate a unique token

            // First transaction
            const createTransactionResponse = await axios.post<TransactionResponse>(
                `${config.BACKEND_URL}/createTransaction`,
                {
                    provider,
                    token,  // Use the generated token
                    amount: parseInt(amount),
                    userId: session.data?.user?.id
                }
            );
            console.log("create transaction", createTransactionResponse.data);
            
            // Second transaction (webhook)
            const webhookResponse = await axios.post(
                `${config.BACKEND_URL}/hdfcWebhook`,
                {
                    token,  // Use the same generated token
                    user_identifier: session.data?.user?.id,
                    amount: amount
                }
            );
            console.log("approve transaction", webhookResponse.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error details:', error.response?.data);
            } else {
                console.error('Unexpected error:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Add Money">
            <div className="w-full">
                <div className="pt-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                    <input 
                        onChange={(e) => setAmount(e.target.value)} 
                        type="text" 
                        id="first_name" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                        placeholder="Amount" 
                    />
                </div>
                <div className="py-4 text-left">Bank</div>
                <Select
                    onSelect={(value) => {
                        setRedirectUrl(
                            SUPPORTED_BANKS.find((x) => x.name === value)?.redirectUrl || ""
                        );
                        setProvider(value as "HDFC Bank" | "Axis Bank");
                    }}
                    options={SUPPORTED_BANKS.map((x) => ({
                        key: x.name,
                        value: x.name,
                    }))}
                />
                <div className="flex justify-center pt-4">
                    <Button 
                        onClick={handleClick} 
                    >
                        {isLoading ? 'Processing...' : 'Add Money'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};