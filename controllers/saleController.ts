import { Request, Response } from 'express';
import { PATTERN } from '../models/patternModel';
import { STOCK } from '../models/stockModel';
import { SALE } from '../models/saleModel';
import mongoose from 'mongoose';
import { CUSTOMER } from '../models/customerModel';

export const saleCreate = async (req: Request, res: Response): Promise<void> => {
    try {

        const { patternId, quantity, date, customerId } = req.body;

        if (!patternId) {
            throw new Error('patternId is required.');
        } else if (!quantity) {
            throw new Error('quantity is required.');
        } else if (!date) {
            throw new Error('date is required.');
        } else if (!date) {
            throw new Error('date is required.');
        } else if (!customerId) {
            throw new Error('customerId is required.');
        }

        let findCustomer = await CUSTOMER.findById(customerId);
        if (!findCustomer) throw new Error('please provide valid customerId.')

        const findPattern = await PATTERN.findOne({ _id: patternId, organizationId: req.organizationId });
        if (!findPattern) throw new Error('Please provide valid patternId.');

        const findStock: any = await STOCK.findOne({ patternId: findPattern._id, isDeleted: false });
        if (!findStock) throw new Error('Product not found.');

        if (parseInt(quantity) > parseInt(findStock.pieces)) {
            throw new Error('Not enough stock available.');
        }

        findStock.pieces = parseInt(findStock.pieces) - parseInt(quantity);
        await findStock.save();

        const newSale = await SALE.create({
            patternId,
            quantity,
            date,
            customerId,
            soldById: req.userId,
            organizationId: req.organizationId,
            isDeleted: false,
        });

        res.status(200).json({
            status: 200,
            message: "Sale created successfully.",
            data: newSale
        });

    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: (error as Error).message,
        });
    }
};

export const saleGet = async (req: any, res: Response): Promise<void> => {
    try {

        const allSale = await SALE.aggregate([
            {
                $match: {
                    organizationId: new mongoose.Types.ObjectId(req.organizationId),
                    isDeleted: false
                }
            },
            {
                $lookup: {
                    from: 'profiles', 
                    localField: 'soldById',
                    foreignField: 'userId',
                    as: 'soldByProfile'
                }
            },
            {
                $lookup: {
                    from: 'patterns', 
                    localField: 'patternId',
                    foreignField: '_id',
                    as: 'patternId'
                }
            },
            {
                $lookup: {
                    from: 'customers', 
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customerId'
                }
            },
            {
                $unwind: {
                    path: '$soldByProfile',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $unwind: {
                    path: '$patternId',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $unwind: {
                    path: '$customerId',
                    preserveNullAndEmptyArrays: true 
                }
            },
        ]);

        res.status(200).json({
            status: 200,
            message: "Sale retrieved successfully.",
            data: allSale
        });
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: (error as Error).message,
        });
    }
};

export const saleUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId, patternId, quantity, date, customerId } = req.body;

        if (!patternId) {
            throw new Error('patternId is required.');
        } else if (!quantity) {
            throw new Error('quantity is required.');
        } else if (!date) {
            throw new Error('date is required.');
        } else if (!saleId) {
            throw new Error('saleId is required.');
        } else if (!customerId) {
            throw new Error('customerId is required.');
        }

        let findCustomer = await CUSTOMER.findById(customerId);
        if (!findCustomer) throw new Error('please provide valid customerId.')

        const findSale = await SALE.findOne({ _id: saleId, organizationId: req.organizationId, isDeleted: false });
        if (!findSale) throw new Error('Please provide valid saleId.');

        const oldPattern = await PATTERN.findOne({ _id: findSale.patternId, organizationId: req.organizationId });
        if (!oldPattern) throw new Error('Please provide valid patternId.');

        const oldStock: any = await STOCK.findOne({ patternId: oldPattern._id, isDeleted: false });
        if (!oldStock) throw new Error('Stock not found.');

        const findPattern = await PATTERN.findOne({ _id: patternId, organizationId: req.organizationId });
        if (!findPattern) throw new Error('Please provide valid patternId.');

        oldStock.pieces += Number(findSale.quantity);
        await oldStock.save();

        const findStock: any = await STOCK.findOne({ patternId: findPattern._id, isDeleted: false });
        if (!findStock) throw new Error('Stock not found.');

        if (Number(quantity) > findStock.pieces) {
            throw new Error('Not enough stock available.');
        }

        findStock.pieces -= Number(quantity);
        await findStock.save();

        const updatedSale = await SALE.findByIdAndUpdate(saleId, {
            $set: {
                patternId,
                quantity,
                date,
                customerId
            }
        }, { new: true });

        res.status(200).json({
            status: 200,
            message: "Sale updated successfully.",
            data: updatedSale
        });
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: (error as Error).message,
        });
    }
};

export const saleDelete = async (req: Request, res: Response): Promise<void> => {
    try {
        const { saleId, isReturn } = req.query;

        if (!saleId) throw new Error('saleId is required.');
        if (isReturn !== 'true' && isReturn !== 'false') throw new Error('isReturn is required.');

        const returnStock = isReturn === 'true';

        const findSale: any = await SALE.findOne({ _id: saleId, organizationId: req.organizationId, isDeleted: false });
        if (!findSale) throw new Error('Please provide valid saleId.');

        if (returnStock) {
            const findStock: any = await STOCK.findOne({ patternId: findSale.patternId, isDeleted: false });
            if (findStock) {
                findStock.pieces = parseInt(findStock.pieces) + parseInt(findSale.quantity);
                await findStock.save();
            }
        }

        const updatedSale = await SALE.findByIdAndUpdate(saleId, {
            $set: {
                isDeleted: true
            }
        }, { new: true });

        res.status(200).json({
            status: 200,
            message: "Sale deleted successfully.",
            data: updatedSale
        });
    } catch (error) {
        res.status(400).json({
            status: "Failed",
            message: (error as Error).message,
        });
    }
};