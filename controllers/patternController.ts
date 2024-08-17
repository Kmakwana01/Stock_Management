import { Request, Response } from 'express';
import { PATTERN } from '../models/patternModel';
import mongoose from "mongoose";

interface UpdatedRequest extends Request {
    query: {
      name: string;
    };
}

export const getPatternsForStock = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const patterns = await PATTERN.aggregate([
            {
                $lookup: {
                    from: 'stocks',
                    localField: '_id',
                    foreignField: 'patternId',
                    as: 'stockDetails'
                }
            },
            {
                $unwind: '$stockDetails'
            },
            {
                $match: {
                    'stockDetails.pieces': { 
                        $gt: 0
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    patternNumber: 1, 
                }
            }
        ]);

        res.status(200).json({
            status: 200,
            message: 'Patterns retrieved successfully.',
            data: patterns
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
};

export const addPattern = async (req : Request, res : Response) => {
    try {
        const { patternNumber } = req.query;

        if (!patternNumber) {
            throw new Error('patternNumber is required.')
        }

        let pattern : any = await PATTERN.findOne({ patternNumber : patternNumber , organizationId: req.organizationId });

        if(pattern && pattern?.isDeleted === true){

            pattern.isDeleted = false;
            await pattern.save();

        } else if (!pattern) {

            pattern = await PATTERN.create({
                patternNumber,
                isDeleted : false,
                organizationId: req.organizationId,
            })
        }

        res.status(200).json({
            status: 200,
            message: "pattern create Successfully.",
            data: pattern
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updatePattern = async (req : UpdatedRequest , res : Response) => {
    try {

        let { patternId , patternNumber } = req.query as any;

        if(!patternId) throw new Error('please provide a patternId in query.')
        if(!mongoose.Types.ObjectId.isValid(patternId)) throw new Error('please provide a patternId in query.')
        if(!patternNumber) throw new Error('name is required.')

        let findPattern = await PATTERN.findOne({ _id : patternId });
        if(!findPattern) throw new Error('please provide valid patternId.');

        let findOldPattern : any = await PATTERN.findOne({ patternNumber });
        if(findOldPattern && findOldPattern._id.toString() != patternId) throw new Error('this pattern already exists.');

        let updatedPattern = await PATTERN.findByIdAndUpdate(
            patternId,
            {
                $set : {
                    patternNumber
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Pattern update Successfully.",
            data : updatedPattern
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getPatternList = async (req : Request, res : Response) => {
    try {

        const allPattern = await PATTERN.find({
            organizationId: req.organizationId 
        })

        let filteredPattern = allPattern.filter((pattern : any) => {
           if(pattern && typeof pattern?.isDeleted === 'boolean'){
                if(pattern?.isDeleted == false || pattern?.isDeleted == "false"){
                    return pattern
                }
           }
        });

        res.status(200).json({
            status: 200,
            message: "pattern get Successfully.",
            data: filteredPattern
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deletePattern = async (req : UpdatedRequest , res : Response) => {
    try {
        let { patternId } = req.query as any;

        if(!patternId) throw new Error('please provide a patternId in query.')
        if(!mongoose.Types.ObjectId.isValid(patternId)) throw new Error('please provide a patternId in query.')

        let findPattern = await PATTERN.findOne({ _id : patternId });

        if(!findPattern) throw new Error('please provide valid patternId.')

        let updatedPattern = await PATTERN.findByIdAndUpdate(
            patternId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Pattern delete Successfully.",
            data : updatedPattern
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}
