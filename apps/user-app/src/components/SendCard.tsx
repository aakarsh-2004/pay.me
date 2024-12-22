"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Center } from "@repo/ui/center";
import { TextInput } from "@repo/ui/textinput";
import { useState } from "react";
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

interface TransferType {
    success: boolean,
    byAmount: number,
    message: string
}

export function SendCard() {
    const [number, setNumber] = useState("");
    const [amount, setAmount] = useState("");
    const [transferredData, setTransferredData] = useState<TransferType>()
    const [hasTransferred, setHasTransferred] = useState<boolean>(false);

    const handleClick = async () => {
        const data: TransferType = await p2pTransfer(number, parseInt(amount))

        if(data.success) {
            console.log(`Funds ${data.byAmount} transferred successfully to number ${number}`);
            setTransferredData(data)
            setHasTransferred(true);
        }
    }

    return <div className="h-[90vh]">
        <Center>
            <Card title="Send">
                <div className="min-w-72 pt-2">
                    <TextInput placeholder={"Number"} label="Number" onChange={(value) => {
                        setNumber(value)
                    }} />
                    <TextInput placeholder={"Amount"} label="Amount" onChange={(value) => {
                        setAmount(value)
                    }} />
                    <div className="pt-4 flex justify-center">
                        <Button onClick={() => {
                            handleClick()
                        }}>Send</Button>
                    </div>
                </div>
                {hasTransferred && (
                    <div>
                        <h1>Funds {transferredData?.byAmount} transferred successfully to number {number}</h1>
                    </div>
                )}
            </Card>

        </Center>
    </div>
}