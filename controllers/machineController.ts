import mongoose from "mongoose";
import { Request, Response } from 'express';
import { MACHINE } from "../models/machineModel";

interface UpdatedRequest extends Request {
  query: {
    name: string;
  };
}

export const addMachine = async (req : Request, res : Response) => {
    try {
        const { name } = req.query;

        if (!name) {
            throw new Error('name is required.')
        }

        let machine = await MACHINE.findOne({ name: name , organizationId: req.organizationId , isDeleted: false })
        
        if (!machine) {
            machine = await MACHINE.create({
                name,
                organizationId: req.organizationId,
                isDeleted : false
            })
        }

        res.status(200).json({
            status: 200,
            message: "machine create Successfully.",
            data: machine
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateMachine = async (req : UpdatedRequest , res : Response) => {
    try {
        let { machineId , name } = req.query as any;

        if(!machineId) throw new Error('please provide a machineId in query.')
        if(!mongoose.Types.ObjectId.isValid(machineId)) throw new Error('please provide a machineId in query.')
        if(!name) throw new Error('name is required.')

        let findMachine = await MACHINE.findOne({ _id : machineId , isDeleted : false });

        if(!findMachine) throw new Error('please provide valid machineId.')

        let updatedMachine = await MACHINE.findByIdAndUpdate(
            machineId,
            {
                $set : {
                    name : name
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Machine update Successfully.",
            data : updatedMachine
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getMachines = async (req : Request, res : Response) => {
    try {

        const allMachines = await MACHINE.find({
            organizationId: req.organizationId , isDeleted : false
        })

        res.status(200).json({
            status: 200,
            message: "Machines get Successfully.",
            data: allMachines
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteMachine = async (req : UpdatedRequest , res : Response) => {
    try {
        let { machineId } = req.query as any;

        if(!machineId) throw new Error('please provide a machineId in query.')
        if(!mongoose.Types.ObjectId.isValid(machineId)) throw new Error('please provide a machineId in query.')

        let findMachine = await MACHINE.findOne({ _id : machineId , isDeleted : false });

        if(!findMachine) throw new Error('please provide valid machineId.')

        let updatedMachine = await MACHINE.findByIdAndUpdate(
            machineId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Machine delete Successfully.",
            data : updatedMachine
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}