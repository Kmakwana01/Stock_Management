import mongoose from "mongoose";
import { JOB } from "../models/jobModel";
import { PATTERN } from "../models/patternModel";
import { Request, Response } from 'express';
import { STOCK } from "../models/stockModel";
import sharp from 'sharp';
import path from 'path';


export const addStock = async (req: Request, res: Response) => {
    try {

        let { patternNumber, pieces } = req.body;

        let imageFile = req.files?.filter((file: any) => file.fieldname === 'image')[0];
        let image = imageFile?.filename;
        let originalPathname: any = imageFile?.path;

        let originalImagePath = '';
        let compressedImagePath = '';

        let compressedImageFilename : any;
        if (image) {
            const directoryPath = path.dirname(originalPathname);
            const originalFilename = path.basename(originalPathname);
            compressedImageFilename = originalFilename.replace('_original', ''); 
            const compressedImagePath = path.join(directoryPath, compressedImageFilename);
            console.log(originalPathname)
            console.log(compressedImagePath)

            await sharp(originalPathname)
                .resize(300, 300, { fit: 'inside' }) // Resize the image while maintaining aspect ratio
                .jpeg({ 
                    quality: 50,  
                    // progressive: true, // Enable progressive JPEG
                    // mozjpeg: true 
                })
                .toFile(compressedImagePath);
        }

        console.log("originalImagePath >>> ", originalImagePath)
        console.log("compressedImagePath >>> ", compressedImagePath)

        if (!patternNumber) throw new Error('patternNumber is required.')
        if (!pieces) throw new Error('pieces is required.');

        patternNumber = patternNumber.toString().toLowerCase();

        let findPattern: any = await PATTERN.findOne({ patternNumber: patternNumber })
        if (!findPattern) {
            findPattern = await PATTERN.create({
                patternNumber: patternNumber,
                organizationId: req.organizationId,
                image: compressedImageFilename || null
            })
        }

        let findStock: any = await STOCK.findOne({ patternId: findPattern._id, organizationId: req.organizationId })

        if (findStock) {

            findStock.pieces += parseInt(pieces);
            await findStock.save();
            findPattern.image = compressedImageFilename || null;
            await findPattern.save();

        } else {

            findStock = await STOCK.create({
                patternId: findPattern._id,
                pieces: pieces,
                organizationId: req.organizationId,
                isDeleted: false
            })
        }

        res.status(200).json({
            status: 200,
            message: "Stock Create successfully.",
            data: findStock
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const getStockLists = async (req: any, res: Response) => {
    try {

        // let stockLists: any = await STOCK.find({ organizationId: req.organizationId, pieces: { $gt: 0 } }).populate({ path: "patternId" });

        // for (const iterator of stockLists) {
        //     if (iterator?.patternId?.image) {
        //         const imageUrl = `${req.protocol}://${req.get('host')}/images/${iterator?.patternId?.image}`
        //         iterator.patternId.image = imageUrl;
        //     }
        // }

        let { limit , page } = req.query as any;
      
        if (!limit) throw new Error('limit is required in query.');
        if (!page) throw new Error('page is required in query.');

        limit = parseInt(limit as string) || 10;
        page = parseInt(page as string) || 1;
        const skip = (page - 1) * limit; 

        const stockLists = await STOCK.aggregate([
            {
                $match: {
                    organizationId: new mongoose.Types.ObjectId(req.organizationId),
                    pieces: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "patterns", // Replace with the correct collection name
                    localField: "patternId",
                    foreignField: "_id",
                    as: "patternId"
                }
            },
            {
                $unwind: {
                    path: "$patternId",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "patternId.image": {
                        $cond: {
                            if: { $gt: ["$patternId.image", null] },
                            then: {
                                $concat: [
                                    `${req.protocol}://${req.get('host')}/images/`,
                                    "$patternId.image"
                                ]
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $skip: skip 
            },
            {
                $limit: limit 
            },
        ]);


        res.status(200).json({
            status: 200,
            message: "Stock get successfully.",
            data: stockLists
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const getSingleStock = async (req: Request, res: Response) => {
    try {

        let { stockId } = req.query as any;
        if (!stockId) throw new Error('stockId is required.');

        let stock: any = await STOCK.findOne({ organizationId: req.organizationId, _id: stockId }).populate({ path: "patternId" })
        if (stock?.patternId?.image) {
            const imageUrl = `${req.protocol}://${req.get('host')}/images/${stock?.patternId?.image}`
            stock.patternId.image = imageUrl;
        }

        if (!stock) throw new Error('please provide valid Id.')

        res.status(200).json({
            status: 200,
            message: "Stock get successfully.",
            data: stock
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const updateStock = async (req: Request, res: Response) => {
    try {

        const { stockId, pieces, patternId } = req.body;

        let imageFile = req.files?.filter((file: any) => file.fieldname === 'image')[0];
        let image = imageFile?.filename;
        let originalPathname: any = imageFile?.path;

        let originalImagePath = '';
        let compressedImagePath = '';

        let compressedImageFilename : any;
        if (image) {
            const directoryPath = path.dirname(originalPathname);
            const originalFilename = path.basename(originalPathname);
            compressedImageFilename = originalFilename.replace('_original', ''); 
            const compressedImagePath = path.join(directoryPath, compressedImageFilename);

            await sharp(originalPathname)
                .resize(300, 300, { fit: 'inside' }) // Resize the image while maintaining aspect ratio
                .jpeg({ 
                    quality: 30,  
                    // progressive: true, // Enable progressive JPEG
                    // mozjpeg: true 
                })
                .toFile(compressedImagePath);
        }

        console.log("originalImagePath >>> ", originalImagePath)
        console.log("compressedImagePath >>> ", compressedImagePath)

        if (!stockId) throw new Error('stockId is required.');
        if (!pieces) throw new Error('pieces is required.');

        let findStock = await STOCK.findOne({ _id: stockId });
        if (!findStock) throw new Error('please provide a valid stockId.');

        if (patternId && !mongoose.Types.ObjectId.isValid(patternId)) throw new Error('Please provide a valid patternId.');

        findStock.pieces = pieces ?? findStock.pieces;
        await findStock.save();

        if (image) {
            let isPattern = await PATTERN.findOne({ _id: findStock.patternId });
            if (!isPattern) throw new Error('please provide a valid patterId.');
            isPattern.image = compressedImageFilename || null;
            await isPattern.save();
        }

        res.status(200).json({
            status: 200,
            message: "Stock update Successfully.",
            data: findStock
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const deleteStock = async (req: Request, res: Response) => {
    try {

        const { stockId } = req.query

        if (!stockId) throw new Error('stockId is required.');

        let findStock = await STOCK.findOne({ _id: stockId });
        if (!findStock) throw new Error('please provide a valid stockId.');

        let deletedStock = await STOCK.findByIdAndDelete(findStock._id)

        res.status(200).json({
            status: 200,
            message: "Stock delete successfully.",
            data: deletedStock
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const getStockList = async (req: Request, res: Response) => {
    try {

        const organizationId: any = req.organizationId;
        let objectId: any = new mongoose.Types.ObjectId(organizationId)

        const stockList = await JOB.aggregate([
            {
                $match: {
                    // organizationId: organizationId,
                    organizationId: objectId,
                    isDeleted: false,
                    status: "Complete"
                }
            },
            {
                $lookup: {
                    from: 'jobpatterns',
                    localField: '_id',
                    foreignField: 'jobId',
                    as: 'jobPatterns',
                }
            },

            {
                $unwind: {
                    path: '$jobPatterns'
                },

            },
            {
                $lookup: {
                    from: 'patterns',
                    localField: 'jobPatterns.patternId',
                    foreignField: '_id',
                    as: 'patternDetails'
                }
            },
            {
                $unwind: '$patternDetails'
            },
            {
                $group: {
                    _id: '$jobPatterns.patternId',
                    patternNumber: { $first: '$patternDetails.patternNumber' },
                    totalPieces: { $sum: '$jobPatterns.piece' },
                    patternCreatedAt: { $first: '$patternDetails.createdAt' },
                }
            },
            {
                $sort: { 'patternCreatedAt': 1 } // Sort patterns by position field
            },
            {
                $project: {
                    _id: 0,
                    patternId: '$_id',
                    patternNumber: 1,
                    totalPieces: 1,
                    patternCreatedAt: 1,
                }
            }
        ]);

        res.status(200).json({
            status: 200,
            message: "User create successfully.",
            data: stockList
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}