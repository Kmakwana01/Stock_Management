
import axios from 'axios';
import { Request, Response } from 'express';
import { STOCK } from '../models/stockModel';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        
        const { stockIds, isQuantity , mobileNumbers } = req.body;

        if (!stockIds.length) throw new Error('stockIds is required.');
        if (!mobileNumbers.length) throw new Error('mobileNumbers is required.');

        for (const mobileNumber of mobileNumbers) {

            for (const stockId of stockIds) {
                let findStock = await STOCK.findById(stockId);
                if (!findStock) throw new Error('please provide valid stockId.');
            }
    
            for (const stockId of stockIds) {
    
                let findStock: any = await STOCK.findById(stockId).populate({ path: "patternId" });
                if (!findStock) continue;
    
                if (findStock.patternId.image) {
    
                    const imageUrl = `${req.protocol}://${req.get('host')}/images/${findStock?.patternId?.image}`;
    
                    if (isQuantity) {
    
                        console.log('if part')
    
                        const messageInstruction = {
                            messaging_product: 'whatsapp',
                            // "recipient_type": "individual",
                            to: `91${mobileNumber}`, // Ensure the phone number is correctly formatted
                            type: 'template',
                            template: {
                                name: 'stock_detail',
                                language: {
                                    code: 'en',
                                },
                                components: [
                                    {
                                        type: 'header',
                                        parameters: [
                                            {
                                                type: 'image',
                                                image: {
                                                    link: imageUrl
                                                },
                                            },
                                        ],
                                    },
                                    {
                                        type: 'body',
                                        parameters: [
                                            {
                                                type: 'text',
                                                text: `${findStock.pieces}`, 
                                            },
                                        ],
                                    },
                                ]
    
                            }
                        }
    
                        const response = await axios.post(
                            `https://graph.facebook.com/v20.0/100357726067917/messages`,
                            messageInstruction,
                            {
                                headers: {
                                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                                    'Content-Type': 'application/json', // Optional but recommended
                                },
                            }
                        );
    
                        console.log(response.data)
    
    
                    } else {
    
                        console.log('else part')
    
                        const messageInstruction = {
                            messaging_product: 'whatsapp',
                            // "recipient_type": "individual",
                            to: `91${mobileNumber}`, // Ensure the phone number is correctly formatted
                            type: 'template',
                            template: {
                                name: 'stock_images',
                                language: {
                                    code: 'en',
                                },
                                components: [
                                    {
                                        type: 'header',
                                        parameters: [
                                            {
                                                type: 'image',
                                                image: {
                                                    link: imageUrl
                                                },
                                            },
                                        ],
                                    }
                                ]
    
                            }
                        }
    
                        const response = await axios.post(
                            `https://graph.facebook.com/v20.0/100357726067917/messages`,
                            messageInstruction,
                            {
                                headers: {
                                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                                    'Content-Type': 'application/json', // Optional but recommended
                                },
                            }
                        );
    
                        console.log(response.data)
    
                    }
    
                }
    
            }

        }

        res.status(200).json({
            status: 200,
            message: 'Message sent successfully.',
        });
    } catch (error: any) {
        console.error('Error sending message:', error); // Log the full error
        res.status(400).json({
            status: 'Failed',
            message: error.message,
        });
    }
};