import { Request, Response } from 'express';
import { ROLE } from '../models/roleModel';
import { CLIENT } from '../models/clientModel';
import { COLOR } from '../models/colorModel';

export const create = async (req: Request, res: Response) => {
    try {

        const { clientId, colorId, weightKg, weightGr, quantity } = req.body;

        if (!clientId) {
            throw new Error('clientId is required.')
        } else if (!colorId) {
            throw new Error('colorId is required.')
        } else if (weightKg == null || weightGr == undefined) {
            throw new Error('weightKg is required.')
        } else if (weightGr == null || weightGr == undefined) {
            throw new Error('weightGr is required.')
        } else if (!quantity) {
            throw new Error('quantity is required.')
        }

        let findClient = await CLIENT.findById(clientId);
        if (!findClient) throw new Error('please provide valid clientId.');

        let findColor = await COLOR.findById(colorId);
        if (!findColor) throw new Error('please provide valid colorId.');

        const role = await ROLE.create({
            clientId,
            colorId,
            weightKg,
            weightGr,
            quantity,
            organizationId: req.organizationId,
            isDeleted: false
        })

        res.status(201).json({
            status: 201,
            message: 'role created successfully.',
            data: role
        })

    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};

export const get = async (req: Request, res: Response) => {
    try {

        let role = await ROLE.find({ organizationId: req.organizationId, isDeleted: false }).populate('clientId').populate('colorId')

        res.status(200).json({
            status: 200,
            message: 'role data was successfully retrieved.',
            data: role
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};

export const getByClient = async (req: Request, res: Response) => {
    try {

        const { clientId } = req.query;

        if(!clientId) throw new Error('clientId is required.');

        let findClient = await CLIENT.findById(clientId);

        if(!findClient) throw new Error('please provide valid clientId.');

        let role = await ROLE.find({ organizationId: req.organizationId,clientId : findClient._id , isDeleted: false }).populate('clientId').populate('colorId')

        res.status(200).json({
            status: 200,
            message: 'role data was successfully retrieved.',
            data: role
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};

export const getById = async (req : Request, res : Response) => {
    try {
        
        let { roleId } = req.query;

        if(!roleId) throw new Error('roleId is required.');

        let role = await ROLE.findById(roleId).populate('clientId').populate('colorId')

        if(!role) throw new Error('role not found.');

        res.status(200).json({
            status: 200,
            message: 'role data was successfully retrieved.',
            data: role
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};

export const update = async (req: Request, res: Response) => {
    try {

        const { clientId, colorId, weightKg, weightGr, quantity, roleId } = req.body;

        if (!clientId) {
            throw new Error('clientId is required.')
        } else if (!colorId) {
            throw new Error('colorId is required.')
        } else if (!weightKg) {
            throw new Error('weightKg is required.')
        } else if (weightGr == null || weightGr == undefined) {
            throw new Error('weightGr is required.')
        } else if (!quantity) {
            throw new Error('quantity is required.')
        }

        let findClient = await CLIENT.findById(clientId);
        if (!findClient) throw new Error('please provide valid clientId.');

        let findColor = await COLOR.findById(colorId);
        if (!findColor) throw new Error('please provide valid colorId.');

        let findRole = await ROLE.findById(roleId);
        if (!findRole) throw new Error('please provide valid roleId.');

        const role = await ROLE.findByIdAndUpdate(roleId, {
            clientId,
            colorId,
            weightKg,
            weightGr,
            quantity,
        }, { new: true })

        res.status(200).json({
            status: 202,
            message: 'role update successfully.',
            data: role
        })

    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {

        const { roleId } = req.query

        if (!roleId) {
            throw new Error('roleId is required.');
        }

        let findRole = await ROLE.findById(roleId)

        if (!findRole) throw new Error('role not found.');

        await ROLE.findByIdAndUpdate(roleId, {
            isDeleted: true
        });

        res.status(202).json({
            status: 202,
            message: 'role delete Successfully.',
        })
    } catch (error: any) {
        res.status(400).json({
            status: 'Fail',
            message: error.message
        })
    }
};
