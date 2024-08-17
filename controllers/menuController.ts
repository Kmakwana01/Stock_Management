import mongoose from "mongoose";
import { Request, Response } from 'express';
import { MENU } from "../models/menuModel";

export const addMenu = async (req : Request, res : Response) => {
    try {

        const { name } = req.body;

        if (!name) {
            throw new Error('name is required.')
        }

        let menu = await MENU.findOne({ name: name , organizationId: req.organizationId , isDeleted: false })
        
        if (!menu) {
            menu = await MENU.create({
                name,
                organizationId: req.organizationId,
                isDeleted : false
            })
        }

        res.status(200).json({
            status: 200,
            message: "Menu create Successfully.",
            data: menu
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateMenu = async (req : Request , res : Response) => {
    try {
        
        let { menuId , name } = req.query as any;

        if(!menuId) throw new Error('please provide a menuId in query.')
        if(!name) throw new Error('name is required.')
        if(!mongoose.Types.ObjectId.isValid(menuId)) throw new Error('please provide a menuId in query.')

        let findMenu = await MENU.findOne({ _id : menuId , isDeleted : false });

        if(!findMenu) throw new Error('please provide valid menuId.')

        let updatedMenu = await MENU.findByIdAndUpdate(
            menuId,
            {
                $set : {
                    name : name
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Menu update Successfully.",
            data : updatedMenu
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getMenu = async (req : Request, res : Response) => {
    try {

        const allMenu = await MENU.find({
            organizationId: req.organizationId , isDeleted : false
        })

        res.status(200).json({
            status: 200,
            message: "Menu get Successfully.",
            data: allMenu
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteMenu = async (req : Request , res : Response) => {
    try {
        let { menuId } = req.query as any;

        if(!menuId) throw new Error('please provide a menuId in query.')
        if(!mongoose.Types.ObjectId.isValid(menuId)) throw new Error('please provide a menuId in query.')

        let findMenu = await MENU.findOne({ _id : menuId , isDeleted : false });

        if(!findMenu) throw new Error('please provide valid menuId.')

        let updatedMenu = await MENU.findByIdAndUpdate(menuId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Menu delete Successfully.",
            data : updatedMenu
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}