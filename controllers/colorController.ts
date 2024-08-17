import mongoose from "mongoose";
import { COLOR } from "../models/colorModel";
import { Request, Response } from 'express';

interface UpdatedRequest extends Request {
  query: {
    name: string;
    colorId: string; // We use string here because query parameters are always strings
  };
}

export const addColor = async (req : Request, res : Response) => {
    try {
        const { name } = req.body;

        if (!name) {
            throw new Error('name is required.')
        }

        let color = await COLOR.findOne({ name: name , organizationId: req.organizationId , isDeleted: false })
        
        if (!color) {
            color = await COLOR.create({
                name,
                organizationId: req.organizationId,
                isDeleted : false
            })
        }

        res.status(200).json({
            status: 200,
            message: "Color create Successfully.",
            data: color
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateColor = async (req : UpdatedRequest , res : Response) => {
    try {
        let { colorId , name } = req.query;

        if(!colorId) throw new Error('please provide a colorId in query.')
        if(!mongoose.Types.ObjectId.isValid(colorId)) throw new Error('please provide a colorId in query.')
        if(!name) throw new Error('name is required.')

        let findColor = await COLOR.findOne({ _id : colorId , isDeleted : false });

        if(!findColor) throw new Error('please provide valid colorId.')

        let updatedColor = await COLOR.findByIdAndUpdate(
            colorId,
            {
                $set : {
                    name : name
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Color update Successfully.",
            data : updatedColor
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getColors = async (req : Request, res : Response) => {
    try {

        const allColors = await COLOR.find({
            organizationId: req.organizationId , isDeleted : false
        })

        res.status(200).json({
            status: 200,
            message: "Color get Successfully.",
            data: allColors
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteColor = async (req : UpdatedRequest , res : Response) => {
    try {
        let { colorId } = req.query;

        if(!colorId) throw new Error('please provide a colorId in query.')
        if(!mongoose.Types.ObjectId.isValid(colorId)) throw new Error('please provide a colorId in query.')

        let findColor = await COLOR.findOne({ _id : colorId , isDeleted : false });

        if(!findColor) throw new Error('please provide valid colorId.')

        let updatedColor = await COLOR.findByIdAndUpdate(colorId,
            {
                $set : {
                    isDeleted : true
                }
            },
            { new : true }
        )

        res.status(200).json({
            status: 200,
            message: "Color delete Successfully.",
            data : updatedColor
        });

    } catch (error : any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}