import moment from "moment";
import bcrypt from 'bcrypt';
import { PROFILE } from "../models/profileModel";
import { USER } from "../models/userModel";
import mongoose from "mongoose";
import { Request, Response } from 'express';
import { ACCESS } from "../models/accessModel";
import { MENU } from "../models/menuModel";
interface updatedRequest extends Request {
    query: {
        id: string;
    };
}

export const addNewUser = async (req : Request, res : Response) => {
    try {

            let { email, password, role, firstName, lastName, mobileNumber , userName , accessArray } = req.body;

            let profileImage = req.files?.filter((file : any) => file.fieldname === 'profileImage')[0]?.filename;

            if (!firstName) {
                throw new Error('firstName is required.')
            } else if (!lastName) {
                throw new Error('lastName is required.')
            } else if (!password) {
                throw new Error('password is required.')
            } else if (!role) {
                throw new Error('role is required.')
            } else if (!userName && !email) {
                throw new Error('please provide userName or email.')
            }

            if (req.role !== 'owner') {
                throw new Error('This API is accessible only for users with owner role.');
            }

            const roleArray = ["owner", "master", "manager"];
            if (!roleArray.includes(role)) {
                throw new Error(`Please provide a valid role. Valid roles are: ${roleArray.join(', ')}`);
            }

            if(!accessArray) accessArray = [];

            for (let iterator of accessArray) {
                if(!iterator?.menuId) throw new Error('menuId is required.');
                let findMenu = await MENU.findOne({ _id : iterator.menuId });
                if(!findMenu) throw new Error('please provide a valid menuId')
            }
        
        
            if(email){
                let isMail = await USER.findOne({ email: email , isDeleted : false  })
                if (isMail) throw new Error('This email user already exists.');
            }
            
            if(userName){
                let isUserName = await USER.findOne({ userName: userName , isDeleted : false });
                if (isUserName) throw new Error('this userName is already exists.')
            }
        
            if (password) {
                password = await bcrypt.hash(password, 10)
            }
            
            let newUser = await USER.create({
                userName : userName ? userName : null,
                email : email ? email : null,
                password,
                role: role,
                organizationId: req.organizationId,
                isDeleted: false,
            })
            
            let newProfile = await PROFILE.create({
                userId: newUser._id,
                firstName: firstName ? firstName : null,
                lastName: lastName ? lastName : null,
                profileImage: profileImage ? profileImage : null,
                mobileNumber: mobileNumber ? mobileNumber : null,
                isDeleted: false
            })

            for (let iterator of accessArray) {
                iterator.isDeleted = false;
                iterator.userId = newUser._id;
            }

            await ACCESS.insertMany(accessArray);


            let profile : any = await PROFILE.findOne({ _id: newProfile._id }).populate({
                path: 'userId',
                select: "-password",
            });

            if (profile.profileImage) {
                profile.profileImage = `${req.protocol}://${req.get('host')}/images/${profile?.profileImage}`
            }

            res.status(200).json({
                status: 201,
                message: 'user created successfully',
                data: profile
            });

    } catch (error : any) {
            res.status(400).json({
                status: "Failed",
                message: error.message,
            });
    }
}

export const getUserListOldVersion = async (req : Request, res : Response) => {
    try {

        let response = [];  

        if (req.role !== 'owner') {
            throw new Error('This API is accessible only for users with owner role.');
        }

        let allUsers = await USER.find({ isDeleted: false, organizationId: req.organizationId, _id: { $ne: req.userId } });
        for (const user of allUsers) {

            let profile : any = await PROFILE.findOne({ userId: user._id, isDeleted: false }).populate({
                path: 'userId',
                // select: "-password",
            });

            if (profile.profileImage) {
                profile.profileImage = `${req.protocol}://${req.get('host')}/images/${profile?.profileImage}`
            }

            response.push(profile)
        }

        res.status(200).json({
            status: 201,
            message: 'users get successfully',
            data: response
        });

    } catch (error : any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const getUserList = async (req : any, res : Response) => {
    try {

        if (req.role !== 'owner') {
            throw new Error('This API is accessible only for users with owner role.');
        }

        let organizationId = new mongoose.Types.ObjectId(req.organizationId);
        let userId = new mongoose.Types.ObjectId(req.userId)

        const allUsers = await USER.aggregate([
            {
                $match: {
                    isDeleted: false,
                    organizationId: organizationId,
                    _id: { $ne: userId }
                }
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            {
                $unwind: '$profile'
            },
            {
                $match: {
                    'profile.isDeleted': false
                }
            },
            {
                $addFields: {
                    'profile.profileImage': {
                        $cond: {
                            if: { $ifNull: ['$profile.profileImage', false] },
                            then: {
                                $concat: [`${req.protocol}://${req.get('host')}/images/`, '$profile.profileImage']
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    'profile.password': 0 
                }
            },
            {
                $replaceRoot: {
                    newRoot: '$profile'
                }
            },
            {
                $lookup : {
                    from : "users",
                    foreignField : "_id",
                    localField : "userId",
                    as : "userId"
                }
            },
            {
                $unwind : "$userId"
            }
        ]);

        res.status(200).json({
            status: 201,
            message: 'users get successfully',
            data: allUsers
        });

    } catch (error : any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const updateUserDetails = async (req : Request, res : Response) => {
    try {

            if (req.role !== 'owner') {
                throw new Error('This API is accessible only for users with owner role.');
            }

            let { firstName, lastName, password, role, email , mobileNumber , userName , accessArray } = req.body;

            let profileImage = req.files?.filter((file : any) => file.fieldname === 'profileImage')[0];

            if (!req.query.id) {
                throw new Error('please provide id in query.')
            } else if (!email && !userName) {
                throw new Error('please provide userName or email.')
            } 

            let employeeFind : any = await PROFILE.findOne({ userId: req.query.id, isDeleted: false }).populate('userId')

            if (!employeeFind) {
                throw new Error('This user does not exist.');
            } else if (employeeFind?.isDeleted === true) {
                throw new Error('This user has already been deleted.')
            }

            const roleArray = ["owner", "master", "manager"];
            if (!roleArray.includes(role)) {
                throw new Error(`Please provide a valid role. Valid roles are: ${roleArray.join(', ')}`);
            }

            if(!accessArray) accessArray = [];
            for (let iterator of accessArray) {
                if(!iterator?.menuId) throw new Error('menuId is required.');
                let findMenu = await MENU.findOne({ _id : iterator.menuId });
                if(!findMenu) throw new Error('please provide a valid menuId')
            }

            if(email){
                var emailFind : any = await USER.findOne({ email: email, isDeleted: false });
                if (emailFind && emailFind._id.toString() !== req.query.id) {
                    throw new Error('This email user already exists.');
                }
            }

            if(userName){
                var isUserName : any = await USER.findOne({ userName : userName, isDeleted: false });
                if (isUserName && isUserName._id.toString() !== req.query.id) {
                    throw new Error('This userName already exists.');
                }
            }

            let hashedPassword = employeeFind.userId.password;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            let updatedUser : any = await USER.findByIdAndUpdate(employeeFind.userId._id, {
                userName : userName ? userName : employeeFind.userId.userName, 
                email: email ? email : employeeFind.userId.email,
                password: hashedPassword,
                role: role ?? employeeFind.userId.role
            }, { new: true });

            let updatedProfile : any = await PROFILE.findOneAndUpdate(
                { userId: updatedUser._id },
                {
                    $set: {
                        firstName : firstName ? firstName : employeeFind.firstName,
                        lastName : lastName ? lastName : employeeFind.lastName,
                        mobileNumber : mobileNumber ? mobileNumber : employeeFind.mobileNumber,
                        profileImage: profileImage ? profileImage.filename : employeeFind.profileImage
                    }
                },
                { new: true }
            );
            
            
            for (let iterator of accessArray) {
                iterator.isDeleted = false;
                iterator.userId = updatedUser._id;
            }
            await ACCESS.deleteMany({ userId : updatedUser._id });
            await ACCESS.insertMany(accessArray);

            let profile : any = await PROFILE.findOne({ _id: updatedProfile._id, isDeleted: false }).populate('userId')
            if (profile.profileImage) {
                profile.profileImage = `${req.protocol}://${req.get('host')}/images/${profile?.profileImage}`
            }

            res.status(200).json({
                status: 201,
                message: 'User update successfully',
                data: profile
            });

    } catch (error : any) {
            res.status(400).json({
                status: "Failed",
                message: error.message,
            });
        }
}

export const deleteUser = async (req : updatedRequest, res : Response) => {
    try {

        if (req.role === 'owner') {

            if (!req.query.id) {
                throw new Error('id is required in query.');
            } else if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
                throw new Error('please provide valid objectId for userId.')
            }

            const user = await USER.findOne({ _id: req.query.id });

            if (!user) {
                throw new Error('This user does not exist.');
            } else if (user.isDeleted === true) {
                throw new Error('This user has already been deleted.')
            }

            await PROFILE.findOneAndUpdate(
                { userId: user._id }, {
                isDeleted: true,
            }, { new: true })

            await USER.findByIdAndUpdate(user._id, {
                isDeleted: true,
            }, { new: true })

        } else {
            throw new Error('This API is accessible only for users with owner role.');
        }

        res.status(202).json({
            status: 202,
            message: 'User deleted successfully.'
        })

    } catch (error : any) {
        res.status(400).json({
            status: 'Failed',
            message: error.message
        })
    }
}

export const getProfile = async (req : updatedRequest, res : Response) => {
    try {

        if (!req.query.id) {
            throw new Error('please provide a id in query.')
        } else if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
            throw new Error('please provide valid objectId for userId.')
        }

        let User = await USER.findOne({ isDeleted: false, organizationId: req.organizationId, _id: req.query.id });

        if (!User) {
            throw new Error('Invalid Credentials.');
        }

        let profile : any = await PROFILE.findOne({ userId: User._id, isDeleted: false }).populate({
            path: 'userId',
        });

        if (profile?.profileImage) {
            profile.profileImage = `${req.protocol}://${req.get('host')}/images/${profile?.profileImage}`
        }
        profile._doc.accessArray = await ACCESS.find({ userId : User._id }).populate('menuId')

        res.status(200).json({
            status: 201,
            message: 'profile get successfully',
            data: profile
        });

    } catch (error : any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const getUsersListForMaking = async (req : any, res : Response) =>{
    try {

        let allUsers = await USER.aggregate([
            {
                $match : {
                    organizationId : new mongoose.Types.ObjectId(req.organizationId),
                    isDeleted : false
                }
            },
            {
                $lookup : {
                    from : "profiles",
                    foreignField : "userId",
                    localField : "_id",
                    as : "profile"
                }
            },
            {
                $unwind : "$profile"
            }
        ])        

        res.status(200).json({
            status: 201,
            message: 'profile get successfully',
            data: allUsers
        });

    } catch (error : any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

// exports.updatePassword = async function (req, res, next) {
//     try {

//         const { id } = req.query;
//         const { password, confirmPassword } = req.body;

//         if (!id) {
//             throw new Error('please provide id in query parameter.')
//         } else if (!password) {
//             throw new Error('password is required.')
//         } else if (!confirmPassword) {
//             throw new Error('confirmPassword is required.')
//         }

//         if(password !== confirmPassword){
//             throw new Error('')
//         }

//         const organization = await ORGANIZATION.findOne({ _id: id }).populate("userId")
//         console.log("organization", organization);
//         req.body.password = await bcrypt.hash(req.body.password, 10);
//         var user = await USER.findByIdAndUpdate({ _id: organization.userId.id }, { password: req.body.password }, { new: true });
//         console.log(user);

//         res.status(200).json({
//             status: "success",
//             message: "Password updated successfully"
//         })
//     } catch (error) {
//         res.status(200).json({
//             status: "success",
//             message: error.message
//         })
//     }
// };