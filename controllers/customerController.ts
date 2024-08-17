import { CUSTOMER } from '../models/customerModel';
import { Request, Response } from 'express';

export const create = async (req : Request, res : Response) => {
    try {

        const { mobileNumber , name } = req.body;

        if(!name) {
            throw new Error('name is required.')
        } else if(!mobileNumber) {
            throw new Error('mobileNumber is required.')
        }

        let customerFind = await CUSTOMER.findOne({ name : name , isDeleted : false , organizationId : req.organizationId });
        if(customerFind) {
            throw new Error('This name already exists.')
        } else {
            var customer = await CUSTOMER.create({
                name : name,
                createdBy : req.userId,
                organizationId : req.organizationId,
                mobileNumber ,
                isDeleted : false,
                deletedBy : null,
            })

            res.status(201).json({
                status : 201,
                message : 'customer created successfully.',
                data : customer
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
        
        let customer = await CUSTOMER.find({ organizationId : req.organizationId , isDeleted : false })

        res.status(200).json({
            status : 200,
            message : 'customer data was successfully retrieved.',
            data : customer
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
        
        const { customerId } = req.query;

        if(!customerId) throw new Error('customerId is required.');

        let customer = await CUSTOMER.findOne({ _id : customerId, organizationId : req.organizationId , isDeleted : false })

        if(!customer) throw new Error('please provide valid customerId.');

        res.status(200).json({
            status : 200,
            message : 'customer data was successfully retrieved.',
            data : customer
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
        const { mobileNumber , name ,customerId } = req.body;

        if(!customerId) {
            throw new Error('customerId is required.')
        } if(!name) {
            throw new Error('name is required.')
        } else if(!mobileNumber) {
            throw new Error('mobileNumber is required.')
        }

        var customerFind = await CUSTOMER.findOne({ _id : customerId, isDeleted : false });
        if(!customerFind) {
            throw new Error('please provide valid customerId.');
        } else {
            interface customer {
                _id : string
            }
            var customerFind1 : customer | null = await CUSTOMER.findOne({ name : name, isDeleted : false , organizationId : req.organizationId});
            if(customerFind1 && (customerId !== customerFind1._id.toString())) {
                throw new Error('This customer name already exists.')
            } else {

                let update = await CUSTOMER.findByIdAndUpdate(customerFind._id,{
                    name ,
                    mobileNumber
                },{ new : true })

                res.status(202).json({
                    status : 202,
                    message : 'customer data was successfully updated.',
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

export const deleteCustomer = async (req : Request, res : Response) => {
    try {

        const { customerId } = req.query
        
        if(!customerId) {
            throw new Error('customerId is required.');
        }

        let findCustomer = await CUSTOMER.findById(customerId)

        if(!findCustomer) throw new Error('customer not found.');

        await CUSTOMER.findByIdAndUpdate(customerId,{ isDeleted : true });

        res.status(202).json({
            status : 202,
            message : 'customer delete Successfully.',
        })
    } catch (error : any) {
        res.status(400).json({
            status : 'Fail',
            message : error.message
        })
    }
};
