import { OnRampStatus, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
    const alice = await prisma.user.upsert({
        where: {
            number: '9999999999'
        },
        update: {},
        create: {
            number: '9999999999',
            password: await bcrypt.hash('alice', 10),
            name: 'alice',
            OnRampTransactions: {
                create: {
                    startTime: new Date(),
                    status: OnRampStatus.Success,
                    amount: 20000,
                    token: "122",
                    provider: "HDFC Bank"
                }
            }
        }
    })

    await prisma.balance.upsert({
        where: {
            id: "1"
        },
        update: {},
        create: {
            userId: alice.id,
            amount: 20000,
            locked: 2000
        }
    })

    const bob = await prisma.user.upsert({
        where: {
            number: '9999999998'
        },
        update: {},
        create: {
            number: '9999999998',
            password: await bcrypt.hash('bob', 10),
            name: 'bob',
            OnRampTransactions: {
                create: {
                    startTime: new Date(),
                    status: OnRampStatus.Failure,
                    amount: 2000,
                    token: "123",
                    provider: "HDFC Bank"
                }
            }
        }
    })

    await prisma.balance.upsert({
        where: {
            id: "2"
        },
        update: {},
        create: {
            userId: bob.id,
            amount: 2000,
            locked: 200
        }
    })

    console.log({ alice, bob });
}

main() 
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (err) => {
        console.error(err);
        await prisma.$disconnect();
        process.exit(1);
    })