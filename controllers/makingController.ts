import mongoose from "mongoose";
import { Request, Response } from 'express';
import { MACHINE } from "../models/machineModel";
import { PATTERN } from "../models/patternModel";
import { USER } from "../models/userModel";
import { MAKING } from "../models/makingModel";
import { JOB } from "../models/jobModel";
import { JOB_PATTERN } from "../models/jobPatternModel";
import { WORKER } from "../models/workerModel";

interface UpdatedRequest extends Request {
  query: {
    name: string;
  };
}

export const createMaking = async (req : Request, res : Response) => {
    try {

        const { jobPatternId, workerId , machineId , pieces } = req.body;

        if(!jobPatternId) throw new Error('jobPatternId is required.');
        if(!workerId) throw new Error('workerId is required.');
        if(!machineId) throw new Error('machineId is required.');
        if(!pieces) throw new Error('pieces is required.');

        let findJobPattern = await JOB_PATTERN.findOne({ _id : jobPatternId });
        let findEmployee = await WORKER.findOne({ _id : workerId })
        let findMachine = await MACHINE.findOne({ _id : machineId })

        if(!findJobPattern) throw new Error('please provide valid jobPatternId.')
        if(!findMachine) throw new Error('please provide valid machineId.')
        if(!findEmployee) throw new Error('please provide valid workerId.')
        
        const newMaking = await MAKING.create({
            jobPatternId,
            workerId,
            machineId,
            pieces,
            organizationId : req.organizationId,
            createdBy : req.userId,
            isDeleted : false
        })
        
        res.status(200).json({
            status: 200,
            message: "Making create Successfully.",
            data: newMaking
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateMaking = async (req : UpdatedRequest , res : Response) => {
    try {

        const { jobPatternId, workerId , machineId , pieces , makingId } = req.body;

        let findMaking = await MAKING.findOne({ _id : makingId });
        if(!findMaking) throw new Error('please provide valid makingId.');

        if(!jobPatternId) throw new Error('jobPatternId is required.');
        if(!workerId) throw new Error('workerId is required.');
        if(!machineId) throw new Error('machineId is required.');
        if(!pieces) throw new Error('pieces is required.');

        let findJobPattern = await JOB_PATTERN.findOne({ _id : jobPatternId });
        if(!findJobPattern) throw new Error('please provide valid jobPatternId.')

        let findEmployee = await WORKER.findOne({ _id : workerId })
        if(!findEmployee) throw new Error('please provide valid machineId.')

        let findMachine = await MACHINE.findOne({ _id : machineId })
        if(!findMachine) throw new Error('please provide valid workerId.')
        
        let updatedMaking = await MAKING.findByIdAndUpdate(
            makingId,
            {
                $set : {
                    jobPatternId,
                    workerId,
                    machineId,
                    pieces
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Making update Successfully.",
            data : updatedMaking
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getMaking = async (req : any, res : Response) => {
    try {

        let allMakings = await MAKING.aggregate([
            {
                $match : {
                    organizationId : new mongoose.Types.ObjectId(req.organizationId),
                    isDeleted : false
                }
            },
            {
                $lookup : {
                    from : "jobpatterns",
                    foreignField : "_id",
                    localField : "jobPatternId",
                    as : 'jobPatternId',
                    pipeline : [
                        {
                            $lookup : {
                                from : "patterns",
                                foreignField : "_id",
                                localField : "patternId",
                                as : "patternId"
                            }
                        },
                        {
                            $unwind : "$patternId"
                        },
                    ]
                }
            },
            {
                $unwind : "$jobPatternId"
            },
            {
                $lookup : {
                    from : "machines",
                    foreignField : "_id",
                    localField : "machineId",
                    as : 'machineId'
                }
            },
            {
                $unwind : "$machineId"
            },
            {
                $lookup : {
                    from : "workers",
                    foreignField : "_id",
                    localField : "workerId",
                    as : "workerId"
                }
            },
            {
                $unwind : "$workerId"
            },
            {
                $lookup : {
                    from : "profiles",
                    foreignField : "userId",
                    localField : "createdBy",
                    as : "createdBy"
                }
            },
            {
                $unwind : "$createdBy"
            },
        ])

        res.status(200).json({
            status: 200,
            message: "Making get Successfully.",
            data: allMakings
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteMaking = async (req : UpdatedRequest , res : Response) => {
    try {
        let { makingId } = req.query as any;

        if(!makingId) throw new Error('please provide a makingId in query.')
        if(!mongoose.Types.ObjectId.isValid(makingId)) throw new Error('please provide a makingId in query.')

        let findMachine = await MAKING.findOne({ _id : makingId , isDeleted : false });

        if(!findMachine) throw new Error('please provide valid makingId.')

        let updatedMaking = await MAKING.findByIdAndUpdate(
            makingId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Making delete Successfully.",
            data : updatedMaking
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getJobListForMaking = async (req : Request, res : Response) => {

    try {

        const query : any = { organizationId: new mongoose.Types.ObjectId(req.organizationId as any), isDeleted: false, status: { $ne: 'Complete' }};

        const jobList : any = await JOB.aggregate([
            {
                $match : query
            },
            {
                $lookup : {
                    from : "jobpatterns",
                    foreignField : "jobId",
                    localField : "_id",
                    as : "patternArray",
                    pipeline : [
                        {
                            $lookup : {
                                from : "patterns",
                                foreignField : "_id",
                                localField : "patternId",
                                as : "patternId"
                            },
                        },
                        {
                            $unwind : "$patternId"
                        },
                        {
                            $lookup : {
                                from : "makings",
                                foreignField : "jobPatternId",
                                localField : "_id",
                                as : "makingArray",
                                pipeline : [
                                    {
                                        $match : {
                                            isDeleted : false
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                pieceCount: { $sum: "$makingArray.pieces" } // Assuming pieces is an array in makingArray
                            }
                        }
                    ]
                }
            },
        ]).sort({ createdAt: -1 });

        res.status(200).json({
            status: 201,
            message: 'jobs get successfully',
            data: jobList,
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}