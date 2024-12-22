"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "../../../../../../packages/db/index";

export async function p2pTransfer(to: string, byAmount: number) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    byAmount = Number(byAmount);
    if (isNaN(byAmount) || byAmount <= 0) {
        throw new Error("Invalid amount");
    }
    
    try {
        return await prisma.$transaction(async (tx) => {
            const sender = await tx.user.findUnique({
                where: { id: userId },
                include: { Balance: true }
            });

            const receiver = await tx.user.findUnique({
                where: { number: to },
                include: { Balance: true }
            });

            if (!sender || !receiver) {
                throw new Error("Sender or receiver not found");
            }

            if (!sender.Balance?.[0]) {
                throw new Error("Sender has no balance record");
            }

            const senderBalance = sender.Balance[0];
            if (senderBalance.amount < byAmount) {
                throw new Error("Insufficient balance");
            }

            await tx.$executeRaw`SELECT * FROM "Balance" WHERE "userId" = ${userId} FOR UPDATE`;

            let receiverBalance = receiver.Balance?.[0];
            if (!receiverBalance) {
                receiverBalance = await tx.balance.create({
                    data: {
                        userId: receiver.id,
                        amount: 0,
                        locked: 0
                    }
                });
            }

            const debitResult = await tx.balance.update({
                where: { id: senderBalance.id },
                data: {
                    amount: { decrement: byAmount }
                }
            });

            const creditResult = await tx.balance.update({
                where: { id: receiverBalance.id },
                data: {
                    amount: { increment: byAmount }
                }
            });

            await tx.p2pTransactions.create({
                data: {
                    amount: byAmount,
                    senderId: sender.id,
                    receiverId: receiver.id,
                    timestamp: new Date()
                }
            })

            console.log(`${new Date()} : Funds ${byAmount} transferred successfully from ${sender.number} to ${receiver.number}!`);

            return {
                success: true,
                byAmount,
                message: "Transfer successful"
            };
        });
    } catch (error) {
        console.error("Error while doing p2p transaction:", error);
        throw error;
    }
}