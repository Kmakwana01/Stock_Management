import { Request, Response } from 'express';
import { CLIENT } from '../models/clientModel';

export const create = async (req : Request, res : Response) => {
    try {

        const { mobileNumber , name } = req.body;

        if(!name) {
            throw new Error('name is required.')
        } else if(!mobileNumber) {
            throw new Error('mobileNumber is required.')
        }

        let clientFind = await CLIENT.findOne({ name : name , isDeleted : false , organizationId : req.organizationId });
        if(clientFind) {
            throw new Error('This name already exists.')
        } else {
            var client = await CLIENT.create({
                name : name,
                createdBy : req.userId,
                organizationId : req.organizationId,
                mobileNumber ,
                isDeleted : false,
                deletedBy : null,
            })

            res.status(201).json({
                status : 201,
                message : 'client created successfully.',
                data : client
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
        
        let client = await CLIENT.find({ organizationId : req.organizationId , isDeleted : false })

        res.status(200).json({
            status : 200,
            message : 'client data was successfully retrieved.',
            data : client
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
        
        const { clientId } = req.query;

        if(!clientId) throw new Error('clientId is required.');

        let client = await CLIENT.findOne({ _id : clientId, organizationId : req.organizationId , isDeleted : false })

        if(!client) throw new Error('please provide valid clientId.');

        res.status(200).json({
            status : 200,
            message : 'client data was successfully retrieved.',
            data : client
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
        const { mobileNumber , name ,clientId } = req.body;

        if(!clientId) {
            throw new Error('clientId is required.')
        } if(!name) {
            throw new Error('name is required.')
        } else if(!mobileNumber) {
            throw new Error('mobileNumber is required.')
        }

        var clientFind = await CLIENT.findOne({ _id : clientId, isDeleted : false });
        if(!clientFind) {
            throw new Error('please provide valid clientId.');
        } else {
            interface client {
                _id : string
            }
            var clientFind1 : client | null = await CLIENT.findOne({ name : name, isDeleted : false , organizationId : req.organizationId});
            if(clientFind1 && (clientId !== clientFind1._id.toString())) {
                throw new Error('This client name already exists.')
            } else {

                let update = await CLIENT.findByIdAndUpdate(clientFind._id,{
                    name ,
                    mobileNumber
                },{ new : true })

                res.status(202).json({
                    status : 202,
                    message : 'client data was successfully updated.',
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

export const deleteClient = async (req : Request, res : Response) => {
    try {

        const { clientId } = req.query
        
        if(!clientId) {
            throw new Error('clientId is required.');
        }

        let findclient = await CLIENT.findById(clientId)

        if(!findclient) throw new Error('client not found.');

        await CLIENT.findByIdAndUpdate(clientId , { isDeleted : true });

        res.status(202).json({
            status : 202,
            message : 'client delete Successfully.',
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};
