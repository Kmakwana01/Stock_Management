import { VENDOR } from '../models/vendorModel';
import { Request, Response } from 'express';

export const create = async (req : Request, res : Response) => {
    try {
        if(!req.body.name || req.body.name === null || req.body.name === '') {
            throw new Error('Please provide a vendor name.')
        }

        let vendorFind = await VENDOR.findOne({ name : req.body.name , isDeleted : false , organizationId : req.organizationId });
        if(vendorFind) {
            throw new Error('This vendor already exists.')
        } else {
            var vendor = await VENDOR.create({
                name : req.body.name,
                createdBy : req.userId,
                organizationId : req.organizationId,
                isDeleted : false,
                deletedBy : null,
            })

            res.status(201).json({
                status : 201,
                message : 'Vendor created successfully.',
                data : vendor
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
        
        let vendor = await VENDOR.find({ organizationId : req.organizationId , isDeleted : false })

        res.status(200).json({
            status : 200,
            message : 'Vendor data was successfully retrieved.',
            data : vendor
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
        
        const { id } = req.query;

        if(!id) throw new Error('id is required.');

        let vendor = await VENDOR.findOne({ _id : id, organizationId : req.organizationId , isDeleted : false })

        if(!vendor) throw new Error('please provide valid id.');

        res.status(200).json({
            status : 200,
            message : 'Vendor data was successfully retrieved.',
            data : vendor
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
        if(!req.body.vendorId || req.body.vendorId === null || req.body.vendorId === '') {
            throw new Error('Please provide a vendorId.');
        } else if(!req.body.name || req.body.name === null || req.body.name === '') {
            throw new Error('Please provide a vendor name.');
        }

        var vendorFind = await VENDOR.findOne({ _id : req.body.vendorId, isDeleted : false });
        if(!vendorFind) {
            throw new Error('This vendor does not exist.');
        } else {
            interface Vendor {
                _id : string
            }
            var vendorFind1 : Vendor | null = await VENDOR.findOne({ name : req.body.name, isDeleted : false , organizationId : req.organizationId});
            if(vendorFind1 && (req.body.vendorId !== vendorFind1._id.toString())) {
                throw new Error('This vendor name already exists.')
            } else {

                let update = await VENDOR.findByIdAndUpdate(vendorFind._id,{
                    name : req.body.name
                },{ new : true })

                res.status(202).json({
                    status : 202,
                    message : 'Vendor data was successfully updated.',
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

export const deleteVendor = async (req : Request, res : Response) => {
    try {
        
        if(!req.query.id || req.query.id === null || req.query.id === '' || req.query.id === undefined) {
            throw new Error('Please provide a vendor id.');
        }

        await VENDOR.findByIdAndUpdate(req.query.id,{ isDeleted : true });

        res.status(202).json({
            status : 202,
            message : 'Vendor delete Successfully.',
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};
