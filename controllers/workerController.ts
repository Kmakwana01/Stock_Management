import { WORKER } from '../models/workerModel';
import { Request, Response } from 'express';

export const create = async (req : Request, res : Response) => {
    try {

        if(!req.body.name || req.body.name === null || req.body.name === '') {
            throw new Error('name is required.')
        }

        let workerFind = await WORKER.findOne({ name : req.body.name , isDeleted : false , organizationId : req.organizationId });
        if(workerFind) {
            throw new Error('This name already exists.')
        } else {
            var worker = await WORKER.create({
                name : req.body.name,
                createdBy : req.userId,
                organizationId : req.organizationId,
                isDeleted : false,
                deletedBy : null,
            })

            res.status(201).json({
                status : 201,
                message : 'worker created successfully.',
                data : worker
            })
        }
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};

export const get = async (req : Request, res : Response) => {
    try {
        
        let worker = await WORKER.find({ organizationId : req.organizationId , isDeleted : false })

        res.status(200).json({
            status : 200,
            message : 'worker data was successfully retrieved.',
            data : worker
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};

export const getById = async (req : Request, res : Response) => {
    try {
        
        const { workerId } = req.query;

        if(!workerId) throw new Error('workerId is required.');

        let worker = await WORKER.findOne({ _id : workerId, organizationId : req.organizationId , isDeleted : false })

        if(!worker) throw new Error('please provide valid workerId.');

        res.status(200).json({
            status : 200,
            message : 'worker data was successfully retrieved.',
            data : worker
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};

export const update = async (req : Request, res : Response) => {
    try {
        if(!req.body.workerId || req.body.workerId === null || req.body.workerId === '') {
            throw new Error('workerId is required.');
        } else if(!req.body.name || req.body.name === null || req.body.name === '') {
            throw new Error('name is required.');
        }

        var workerFind = await WORKER.findOne({ _id : req.body.workerId, isDeleted : false });
        if(!workerFind) {
            throw new Error('please provide valid workerId.');
        } else {
            interface worker {
                _id : string
            }
            var workerFind1 : worker | null = await WORKER.findOne({ name : req.body.name, isDeleted : false , organizationId : req.organizationId});
            if(workerFind1 && (req.body.workerId !== workerFind1._id.toString())) {
                throw new Error('This worker name already exists.')
            } else {

                let update = await WORKER.findByIdAndUpdate(workerFind._id,{
                    name : req.body.name
                },{ new : true })

                res.status(202).json({
                    status : 202,
                    message : 'worker data was successfully updated.',
                    data : update
                })
            }
        }

    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};

export const deleteWorker = async (req : Request, res : Response) => {
    try {
        
        const { workerId } = req.query;

        if(!workerId) {
            throw new Error('workerId is required.');
        }

        let findWorker = await WORKER.findById(workerId)

        if(!findWorker) throw new Error('worker not found.');

        await WORKER.findByIdAndUpdate(req.query.workerId, { isDeleted : true });

        res.status(202).json({
            status : 202,
            message : 'worker delete Successfully.',
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};
