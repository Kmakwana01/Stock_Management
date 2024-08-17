import mongoose from "mongoose";
import { PROCESS } from "../models/processModel";
import { Request, Response } from 'express';

interface UpdatedRequest extends Request {
    query: {
      name: string;
      processId: string; // We use string here because query parameters are always strings
    };
}

export const addProcess = async (req : Request, res : Response) => {

    try {

        const { name } = req.body;

        if (!name) throw new Error('name is required.');

        let findProcess = await PROCESS.findOne({ name: name, organizationId: req.organizationId, isDeleted: false });

        if (findProcess) throw new Error('process is already exists.')

        const newProcess = await PROCESS.create({
            name,
            organizationId: req.organizationId,
            isDeleted: false
        })

        res.status(201).json({
            status: 201,
            message: 'Process create Successfully',
            data: newProcess
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getProcess = async (req : Request, res : Response) => {

    try {

        const allProcess = await PROCESS.find({
            organizationId: req.organizationId,
            isDeleted: false
        })

        res.status(200).json({
            status: 201,
            message: 'Process get Successfully',
            data: allProcess
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateProcess = async (req : UpdatedRequest , res : Response) => {
    try {
        let { processId , name } = req.query;

        if(!processId) throw new Error('please provide a processId in query.')
        if(!mongoose.Types.ObjectId.isValid(processId)) throw new Error('please provide a processId in query.')
        if(!name) throw new Error('name is required.')

        let findProcess = await PROCESS.findOne({ _id : processId });

        if(!findProcess) throw new Error('please provide valid processId.');

        let updatedProcess = await PROCESS.findByIdAndUpdate(processId,
            {
                $set : {
                    name : name
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Process update Successfully.",
            data : updatedProcess
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteProcess = async (req : UpdatedRequest , res : Response) => {
    try {
        let { processId } = req.query;

        if(!processId) throw new Error('please provide a processId in query.')
        if(!mongoose.Types.ObjectId.isValid(processId)) throw new Error('please provide a processId in query.')
        let findColor = await PROCESS.findOne({ _id : processId , isDeleted : false });
        if(!findColor) throw new Error('please provide valid processId.')

        let updatedProcess = await PROCESS.findByIdAndUpdate(
            processId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Process delete Successfully.",
            data : updatedProcess
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}