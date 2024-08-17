// import { COLOR } from "../models/colorModel";
import { JOB } from "../models/jobModel";
import { JOB_PATTERN } from "../models/jobPatternModel";
import { PATTERN } from "../models/patternModel";
import { ROLE } from "../models/roleModel";
import { USER } from "../models/userModel";
import { JOB_STATUS } from "../models/jobStatusModel";
import { PROCESS } from "../models/processModel";
import { Request, Response } from 'express';
import { PROFILE } from "../models/profileModel";
import { STOCK } from "../models/stockModel";
import { VENDOR } from "../models/vendorModel";
import { JOB_PATTERN_STATUS } from "../models/jobPatternStatus";
import moment from "moment";
import mongoose from "mongoose";
import { CLIENT } from "../models/clientModel";
import { JOB_ROLE } from "../models/jobRole";

export const addJob = async (req: Request, res: Response) => {
    try {

        const { pharmaNumber, date, assignToId, patternArray, roleArray, avgKg, avgGr, clientId } = req.body;

        const formattedDate: any = moment(date, 'DD/MM/YYYY', true);

        switch (true) {
            case !pharmaNumber:
                throw new Error('pharmaNumber is required.');
            case !date:
                throw new Error('date is required.');
            case !roleArray.length:
                throw new Error('roleArray is required.');
            case !patternArray.length:
                throw new Error('patternArray is required.');
            case !clientId:
                throw new Error('clientId is required.');
            case !formattedDate.isValid():
                throw new Error('Please provide valid date in DD/MM/YYYY format.')
            default:
        }

        for (let i = 0; i < patternArray.length; i++) {
            const element = patternArray[i];
            if (!element.piece) {
                throw new Error('piece is required.')
            } else if (!element.patternId) {
                throw new Error('patternId is required.')
            }
            let find_pattern: any = await PATTERN.findOne({ _id: element.patternId, organizationId: req.organizationId })
            if (!find_pattern) throw new Error('please provide valid id for patternId.')
        }

        for (let i = 0; i < roleArray.length; i++) {
            let element = roleArray[i];
            let findRole: any = await ROLE.findById(element.roleId)
            if (element.quantity == undefined || element.quantity == null) throw new Error('quantity is required in roll.')
            if (element.weightKg == undefined || element.weightKg == null) throw new Error('weightKg is required in roll.')
            if (element.weightGr == undefined || element.weightGr == null) throw new Error('weightGr is required in roll.')
            if (!findRole) throw new Error('please provide valid roleId.');
            if (element.quantity == 0) throw new Error('please provide valid quantity.');
            if (parseInt(findRole.quantity) < parseInt(element.quantity)) throw new Error(`The quantity is not available in your client's roll.`)
        }

        let findClient = await CLIENT.findById(clientId)
        if (!findClient) throw new Error('please provide valid clientId.');

        let jobStatus = "Pending", assignedBy;
        if (assignToId) {
            let findAssignTo = await USER.findOne({ _id: assignToId, isDeleted: false, organizationId: req.organizationId })
            if (!findAssignTo) throw new Error('Assigned Invalid Credentials. or has been deleted.');
            jobStatus = 'Assign';
            assignedBy = req.userId
        }

        const newJob: any = await JOB.create({
            assignBy: assignedBy ? assignedBy : null,
            assignTo: assignToId ? assignToId : null,
            date: formattedDate.toDate('DD/MM/YYYY'),
            pharmaNumber: pharmaNumber,
            userId: req.userId,
            status: jobStatus,
            organizationId: req.organizationId,
            avgKg: avgKg ? avgKg : null,
            avgGr: avgGr ? avgGr : null,
            clientId,
            isDeleted: false
        })

        const newPatternArray = [], newRoleArray = [];

        for (const role of roleArray) {
            // console.log(typeof role.quantity)
            const newRole = await JOB_ROLE.create({
                roleId: role.roleId, //  color                   
                jobId: newJob._id,
                quantity: role.quantity,
                weightKg: role.weightKg,
                weightGr: role.weightGr
            })
            let findJobRole = await JOB_ROLE.findOne({ _id: newRole._id }).populate('roleId');
            let findRole: any = await ROLE.findById(role.roleId);
            findRole.quantity = parseInt(findRole.quantity) - parseInt(role.quantity);
            await findRole.save();
            newRoleArray.push(findJobRole)
        }


        for (const jobPattern of patternArray) {

            const newJobPattern = await JOB_PATTERN.create({
                patternId: jobPattern.patternId,
                jobId: newJob._id,
                piece: jobPattern.piece
            })

            let findPattern = await JOB_PATTERN.findOne({ _id: newJobPattern._id }).populate('patternId')
            newPatternArray.push(findPattern)
        }

        let validFormate = moment(newJob.date).format('DD/MM/YYYY')

        let response = {
            ...newJob._doc,
            date: validFormate,
            patternArray: newPatternArray,
            roleArray: newRoleArray,
        }

        res.status(200).json({
            status: 201,
            message: 'job created successfully',
            data: response
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getJobList = async (req: any, res: Response) => {
    try {

        const matchQuery: any = {
            organizationId: new mongoose.Types.ObjectId(req.organizationId),
            isDeleted: false,
            status: { $ne: 'Complete' }
        };

        if (req.role !== "owner") {
            matchQuery.assignTo = req.userId;
        }

        const jobList: any = await JOB.aggregate([
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "profiles",
                    localField: "assignTo",
                    foreignField: "userId",
                    as: "assignTo",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "userId"
                            },
                        },
                        {
                            $unwind: "$userId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "profiles",
                    localField: "assignBy",
                    foreignField: "userId",
                    as: "assignBy",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "userId"
                            },
                        },
                        {
                            $unwind: "$userId"
                        }
                    ]
                }
            },
            {
                $addFields: {
                    assignTo: {
                        $cond: {
                            if: { $eq: [{ $size: "$assignTo" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$assignTo", 0] }
                        }
                    },
                    assignBy: {
                        $cond: {
                            if: { $eq: [{ $size: "$assignBy" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$assignBy", 0] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "jobpatterns",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "patternArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "patterns",
                                foreignField: "_id",
                                localField: "patternId",
                                as: "patternId"
                            }
                        },
                        {
                            $unwind: "$patternId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "jobroles",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "roleArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "roles",
                                foreignField: "_id",
                                localField: "roleId",
                                as: "roleId",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "colors",
                                            foreignField: "_id",
                                            localField: "colorId",
                                            as: "colorId"
                                        }
                                    },
                                    {
                                        $unwind: "$colorId"
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: "$roleId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "jobpatternstatuses",
                    foreignField: "jobId",
                    localField: "_id",
                    as: "patternProcessArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "jobpatterns",
                                foreignField: "_id",
                                localField: "jobPatternId",
                                as: "jobPatternId",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "patterns",
                                            foreignField: "_id",
                                            localField: "patternId",
                                            as: "patternId"
                                        }
                                    },
                                    {
                                        $unwind: "$patternId"
                                    },
                                ]
                            }
                        },
                        {
                            $unwind: "$jobPatternId"
                        },
                        {
                            $lookup: {
                                from: "vendors",
                                foreignField: "_id",
                                localField: "vendorId",
                                as: "vendorId"
                            }
                        },
                        {
                            $unwind: "$vendorId"
                        },
                        {
                            $lookup: {
                                from: "processes",
                                foreignField: "_id",
                                localField: "processId",
                                as: "processId"
                            }
                        },
                        {
                            $unwind: "$processId"
                        },
                    ]
                }
            }
        ]);

        res.status(200).json({
            status: 201,
            message: 'jobs get successfully',
            data: jobList
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
};

export const getSingleJob = async (req: Request, res: Response) => {

    try {

        let { jobId } = req.query as any;

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) throw new Error('please provide valid jobId in query.');

        const findJob: any = await JOB.findOne({ _id: jobId, isDeleted: false })

        if (!findJob) throw new Error('job not found.')

        const matchQuery: any = {
            _id: new mongoose.Types.ObjectId(jobId),
            isDeleted: false
        };

        const job: any = await JOB.aggregate([
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "profiles",
                    localField: "assignTo",
                    foreignField: "userId",
                    as: "assignTo",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "userId"
                            },
                        },
                        {
                            $unwind: "$userId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "profiles",
                    localField: "assignBy",
                    foreignField: "userId",
                    as: "assignBy",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "userId",
                                as: "userId"
                            },
                        },
                        {
                            $unwind: "$userId"
                        }
                    ]
                }
            },
            {
                $addFields: {
                    assignTo: {
                        $cond: {
                            if: { $eq: [{ $size: "$assignTo" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$assignTo", 0] }
                        }
                    },
                    assignBy: {
                        $cond: {
                            if: { $eq: [{ $size: "$assignBy" }, 0] },
                            then: null,
                            else: { $arrayElemAt: ["$assignBy", 0] }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "jobpatterns",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "patternArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "patterns",
                                foreignField: "_id",
                                localField: "patternId",
                                as: "patternId"
                            }
                        },
                        {
                            $unwind: "$patternId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "jobroles",
                    localField: "_id",
                    foreignField: "jobId",
                    as: "roleArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "roles",
                                foreignField: "_id",
                                localField: "roleId",
                                as: "roleId",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "colors",
                                            foreignField: "_id",
                                            localField: "colorId",
                                            as: "colorId"
                                        }
                                    },
                                    {
                                        $unwind: "$colorId"
                                    }
                                ]
                            }
                        },
                        {
                            $unwind: "$roleId"
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "jobpatternstatuses",
                    foreignField: "jobId",
                    localField: "_id",
                    as: "patternProcessArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "jobpatterns",
                                foreignField: "_id",
                                localField: "jobPatternId",
                                as: "jobPatternId",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: "patterns",
                                            foreignField: "_id",
                                            localField: "patternId",
                                            as: "patternId"
                                        }
                                    },
                                    {
                                        $unwind: "$patternId"
                                    },
                                ]
                            }
                        },
                        {
                            $unwind: "$jobPatternId"
                        },
                        {
                            $lookup: {
                                from: "vendors",
                                foreignField: "_id",
                                localField: "vendorId",
                                as: "vendorId"
                            }
                        },
                        {
                            $unwind: "$vendorId"
                        },
                        {
                            $lookup: {
                                from: "processes",
                                foreignField: "_id",
                                localField: "processId",
                                as: "processId"
                            }
                        },
                        {
                            $unwind: "$processId"
                        },
                    ]
                }
            }
        ])

        res.status(200).json({
            status: 201,
            message: 'job get successfully',
            data: job[0]
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getJobListOldVersion = async (req: Request, res: Response) => {

    try {
        const response = []

        const query: any = { organizationId: req.organizationId, isDeleted: false, status: { $ne: 'Complete' } };

        if (req.role !== "owner") {
            query.assignTo = req.userId;
        }
        // { path: "userId", populate: { path: "role" } }

        const jobList: any = await JOB.find(query).populate({ path: "assignTo" }).populate({ path: "assignBy" }).sort({ createdAt: -1 })

        for (const job of jobList) {

            const roleArray = await JOB_ROLE.find({ jobId: job._id }).populate({ path: 'roleId', populate: { path: "colorId" } })
            const patternArray = await JOB_PATTERN.find({ jobId: job._id }).populate('patternId')

            let assignTo: any, assignBy: any;

            if (job.assignBy && job.assignTo) {

                const findAssignByProfile = await PROFILE.findOne({ userId: job.assignBy, isDeleted: false }).populate({
                    path: "userId",
                    select: "-password"
                })

                const findAssignToProfile = await PROFILE.findOne({ userId: job.assignTo, isDeleted: false }).populate({
                    path: "userId",
                    select: "-password"
                })

                if (findAssignToProfile && findAssignByProfile) {
                    assignBy = findAssignByProfile;
                    assignTo = findAssignToProfile;
                }
            }

            let processStatus: any = "Assign";

            let patternProcessArray = await JOB_PATTERN_STATUS.find({ jobId: job._id }).populate({ path: 'jobPatternId', populate: { path: "patternId" } }).populate('vendorId').populate('processId')

            let obj = {
                ...job._doc,
                processStatus: processStatus,
                assignTo: assignTo ? assignTo : null,
                assignBy: assignBy ? assignBy : null,
                patternArray: patternArray,
                roleArray: roleArray,
                patternProcessArray
            }
            response.push(obj)
        }

        res.status(200).json({
            status: 201,
            message: 'jobs get successfully',
            data: response
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const getSingleJobOldVersion = async (req: Request, res: Response) => {

    try {

        let { jobId } = req.query;

        if (!jobId) throw new Error('jobId is required in query.');

        // { path: "userId", populate: { path: "role" } }
        const job: any = await JOB.findOne({ _id: jobId, isDeleted: false }).populate({
            path: "assignTo",
        })

        if (!job) throw new Error('job not found.')

        const roleArray = await JOB_ROLE.find({ jobId: job._id }).populate({ path: 'roleId', populate: { path: "colorId" } })
        const patternArray = await JOB_PATTERN.find({ jobId: job._id }).populate('patternId')


        let assignTo: any, assignBy: any;

        if (job.assignBy && job.assignTo) {

            const findAssignByProfile = await PROFILE.findOne({ userId: job.assignBy, isDeleted: false }).populate({
                path: "userId",
                select: "-password"
            })

            const findAssignToProfile = await PROFILE.findOne({ userId: job.assignTo, isDeleted: false }).populate({
                path: "userId",
                select: "-password"
            })

            if (findAssignToProfile && findAssignByProfile) {
                assignBy = findAssignByProfile;
                assignTo = findAssignToProfile;
            }
        }

        let patternProcessArray = await JOB_PATTERN_STATUS.find({ jobId: job._id }).populate({ path: 'jobPatternId', populate: { path: "patternId" } }).populate('vendorId').populate('processId')

        let obj = {
            ...job._doc,
            assignTo: assignTo ? assignTo : null,
            assignBy: assignBy ? assignBy : null,
            patternArray: patternArray,
            roleArray: roleArray,
            patternProcessArray
        }

        res.status(200).json({
            status: 201,
            message: 'job get successfully',
            data: obj
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const updateJob = async (req: Request, res: Response) => {
    try {

        const { pharmaNumber, date, assignToId, patternArray, roleArray, avgKg, avgGr, clientId } = req.body;
        const { jobId } = req.query;

        const formattedDate: any = moment(date, 'DD/MM/YYYY', true);

        switch (true) {
            case !jobId:
                throw new Error('jobId is required.');
            case !pharmaNumber:
                throw new Error('pharmaNumber is required.');
            case !date:
                throw new Error('date is required.');
            case !roleArray.length:
                throw new Error('roleArray is required.');
            case !patternArray.length:
                throw new Error('patternArray is required.');
            case !clientId:
                throw new Error('clientId is required.');
            case !formattedDate.isValid():
                throw new Error('Please provide valid date in DD/MM/YYYY format.')
            default:
        }

        let job = await JOB.findOne({ _id: jobId, isDeleted: false });
        if (!job) throw new Error('Job not found.')

        for (let i = 0; i < patternArray.length; i++) {
            const element = patternArray[i];
            if (!element.piece) {
                throw new Error('piece is required.')
            } else if (!element.patternId) {
                throw new Error('patternId is required.')
            }
            if (element?.jobPatternId) {
                let jobPattern: any = await JOB_PATTERN.findOne({ _id: element.jobPatternId })
                if (!jobPattern) throw new Error('please provide valid id for jobPatternId.')
            }
        }

        for (let i = 0; i < roleArray.length; i++) {
            let element = roleArray[i];
            let findRole: any = await ROLE.findById(element.roleId)
            if (!findRole) throw new Error('please provide valid roleId.');
            if (element.quantity == undefined || element.quantity == null) throw new Error('quantity is required in roll.')
            if (element.weightKg == undefined || element.weightKg == null) throw new Error('weightKg is required in roll.')
            if (element.weightGr == undefined || element.weightGr == null) throw new Error('weightGr is required in roll.')
            if (element.jobRoleId) {
                let jobJobRole: any = await JOB_ROLE.findById(element.jobRoleId);
                if (!jobJobRole) throw new Error('please provide valid jobRoleId.');
                findRole.quantity = parseInt(findRole.quantity) + parseInt(jobJobRole.quantity);
            }
            if (parseInt(findRole.quantity) < parseInt(element.quantity)) throw new Error(`The quantity is not available in your client's roll.`)
            if (element.quantity == 0) throw new Error('please provide valid quantity.');
        }

        let findClient = await CLIENT.findById(clientId)
        if (!findClient) throw new Error('please provide valid clientId.');

        let jobStatus = "Pending", assignBy;
        if (assignToId) {
            let findAssignTo = await USER.findOne({ _id: assignToId, isDeleted: false, organizationId: req.organizationId })
            if (!findAssignTo) throw new Error('Assigned Invalid Credentials. or has been deleted.');
            jobStatus = 'Assign';
            assignBy = req.userId
        }

        const updatedJob: any = await JOB.findOneAndUpdate(
            { _id: jobId },
            {
                $set: {
                    assignTo: assignToId ? assignToId : null,
                    assignBy: assignBy ? assignBy : null,
                    date: formattedDate.toDate('DD/MM/YYYY'),
                    pharmaNumber: pharmaNumber,
                    avgKg: avgKg ? avgKg : null,
                    avgGr: avgGr ? avgGr : null,
                    // userId: req.userId,
                    status: jobStatus,
                    organizationId: req.organizationId,
                    clientId,
                    isDeleted: false
                }
            },
            { new: true }
        )

        const newPatternArray = [], newRoleArray = [];

        for (const role of roleArray) {
            if (role.jobRoleId) {

                let findJobRole: any = await JOB_ROLE.findOne({ _id: role.jobRoleId });
                let findRole: any = await ROLE.findById(role.roleId);

                findRole.quantity = parseInt(findRole.quantity) + parseInt(findJobRole.quantity) - role.quantity;
                await findRole.save();

                if (findJobRole) {
                    findJobRole.roleId = role.roleId;
                    findJobRole.quantity = role.quantity;
                    findJobRole.weightKg = role.weightKg;
                    findJobRole.weightGr = role.weightGr;
                    await findJobRole.save();
                }

                let jobJobRole = await JOB_ROLE.findOne({ _id: findJobRole._id }).populate('roleId')
                newRoleArray.push(jobJobRole);

            } else if (role.jobRoleId == "") {

                let findRole: any = await ROLE.findById(role.roleId);

                const newRole = await JOB_ROLE.create({
                    roleId: role.roleId, //  color                   
                    jobId: jobId,
                    quantity: role.quantity,
                    weightKg: role.weightKg,
                    weightGr: role.weightGr,
                })
                let findJobRole = await ROLE.findOne({ _id: newRole._id }).populate('roleId')
                newRoleArray.push(findJobRole);

                findRole.quantity = parseInt(findRole.quantity) - parseInt(role.quantity);
                await findRole.save();
            }
        }

        for (const pattern of patternArray) {
            if (pattern.jobPatternId) {

                let findJobPattern: any = await JOB_PATTERN.findOne({ _id: pattern.jobPatternId });
                if (findJobPattern) {
                    findJobPattern.patternId = pattern.patternId;
                    findJobPattern.piece = pattern.piece;
                    await findJobPattern.save();
                }
                let jobPattern = await JOB_PATTERN.findOne({ _id: findJobPattern._id }).populate('patternId')
                newPatternArray.push(jobPattern);

            } else if (pattern.jobPatternId === "") {

                const newJobPattern = await JOB_PATTERN.create({
                    patternId: pattern.patternId,
                    jobId: jobId,
                    piece: pattern.piece
                })
                let findPattern = await JOB_PATTERN.findOne({ _id: newJobPattern._id }).populate('patternId')
                newPatternArray.push(findPattern)
            }
        }

        let validFormate = moment(updatedJob.date).format('DD/MM/YYYY')

        let response = {
            ...updatedJob._doc,
            date: validFormate,
            patternArray: newPatternArray,
            roleArray: newRoleArray
        }

        res.status(200).json({
            status: 201,
            message: 'job update successfully',
            data: response
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const deleteJob = async (req: Request, res: Response) => {
    try {

        const { jobId } = req.query;

        if (!jobId) throw new Error('jobId is required in query.');

        let job = await JOB.findOne({ _id: jobId, isDeleted: false });
        if (!job) throw new Error('Job not found.');

        let findAllJobRoles: any = await JOB_ROLE.find({ jobId });

        for (const jobRole of findAllJobRoles) {
            let findRole: any = await ROLE.findById(jobRole.roleId)
            if (findRole) {
                findRole.quantity = parseInt(findRole.quantity) + parseInt(jobRole.quantity)
                await findRole.save();
            }
        }

        const deletedJob: any = await JOB.findOneAndUpdate(
            { _id: jobId },
            {
                $set: {
                    isDeleted: true,
                }
            },
            { new: true }
        )

        await ROLE.deleteMany({
            jobId: deletedJob._id
        })

        await JOB_PATTERN.deleteMany({
            jobId: deletedJob._id
        })

        res.status(200).json({
            status: 201,
            message: 'job delete successfully',
        });
    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const assignJob = async (req: Request, res: Response) => {
    try {

        const { jobId, assignTo } = req.query;

        let findJob = await JOB.findOne({ _id: jobId });
        let findAssignToUser = await USER.findOne({ _id: assignTo })

        if (!findJob) throw new Error('job not found.')
        if (!findAssignToUser) throw new Error('assignTo is not valid.')

        await JOB.findOneAndUpdate(
            { _id: jobId },
            {
                assignTo: assignTo,
                assignBy: req.userId,
                status: 'Assign'
            },
            { new: true }
        )

        res.status(200).json({
            status: 201,
            message: 'job assign successfully',
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobProcessStatus = async (req: Request, res: Response) => {
    try {

        const { jobId, processId, vendorId } = req.body;

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) throw new Error('please provide valid jobId.');
        if (!processId || !mongoose.Types.ObjectId.isValid(processId)) throw new Error('please provide valid processId.');
        if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) throw new Error('please provide valid vendorId.');

        let findJob = await JOB.findOne({ _id: jobId, organizationId: req.organizationId, isDeleted: false });
        if (!findJob) throw new Error('job not found.');

        let findProcess = await PROCESS.findOne({ _id: processId, organizationId: req.organizationId, isDeleted: false });
        if (!findProcess) throw new Error('process not found.');

        let findJobStatus = await JOB_STATUS.findOne({ jobId: jobId, processId: processId, status: "Processing" });

        let vendorFind = await VENDOR.findOne({ _id: vendorId, organizationId: req.organizationId, isDeleted: false });
        if (!vendorFind) throw new Error('Vendor not found.');

        let newJobStatus;

        if (findJobStatus) {

            newJobStatus = await JOB_STATUS.create({
                jobId,
                processId,
                vendorId,
                status: "Complete",
            })

        } else {

            newJobStatus = await JOB_STATUS.create({
                jobId,
                processId,
                vendorId,
                status: "Processing",
            })
        }

        res.status(200).json({
            status: 201,
            message: 'add process for job Successfully',
            data: newJobStatus
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobProcessUpdate = async (req: Request, res: Response) => {
    try {

        let { processingId, jobId, processId, vendorId } = req.body;

        switch (true) {
            case !jobId:
                throw new Error('jobId is required.');
            case !processId:
                throw new Error('processId is required.');
            case !processingId:
                throw new Error('processingId is required.');
            case !vendorId:
                throw new Error('vendorId is required.');
            default:
                break;
        }

        let findJobStatus: any = await JOB_STATUS.find({ processId: processingId, jobId: jobId })
        if (!findJobStatus.length) throw new Error('job process not found.');

        let findProcess = await PROCESS.findOne({ _id: processId, organizationId: req.organizationId, isDeleted: false });
        if (!findProcess) throw new Error('process not found.')

        let vendorFind = await VENDOR.findOne({ _id: vendorId, organizationId: req.organizationId, isDeleted: false });
        if (!vendorFind) throw new Error('Vendor not found.');

        await JOB_STATUS.updateMany(
            { processId: processingId, jobId: jobId },
            { $set: { processId: processId, vendorId: vendorId } }
        );

        res.status(200).json({
            status: 201,
            message: 'process Update successfully.'
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobProcessDelete = async (req: Request, res: Response) => {
    try {

        let { jobId, processId } = req.body;

        switch (true) {
            case !jobId:
                throw new Error('jobId is required.');
            case !processId:
                throw new Error('processId is required.');
            default:
                break;
        }

        let findJobStatus: any = await JOB_STATUS.find({ processId: processId, jobId: jobId })
        if (!findJobStatus.length) throw new Error('job process not found.');

        await JOB_STATUS.deleteMany(
            { processId: processId, jobId: jobId },
        );

        res.status(200).json({
            status: 201,
            message: 'job Delete successfully.',
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const completeJob = async (req: Request, res: Response) => {
    try {

        const { jobId } = req.query;
        if (!jobId) throw new Error('jobId is required in query.');

        const findJob = await JOB.findOne({ _id: jobId, isDeleted: false });
        if (findJob?.status === 'Complete') throw new Error('job already completed.')
        if (!findJob) throw new Error('job not found.')

        let allProcessingJobPattern: any = await JOB_PATTERN_STATUS.find({ jobId: jobId, status: 'Processing' })
        if (allProcessingJobPattern.length > 0) throw new Error('The job is currently in the processing status.');

        let allJobPatterns: any = await JOB_PATTERN.find({ jobId })

        for (const iterator of allJobPatterns) {

            let findPattern: any = await STOCK.findOne({ patternId: iterator.patternId })

            if (findPattern) {

                findPattern.pieces += parseInt(iterator.piece);
                await findPattern.save();

            } else {

                await STOCK.create({
                    patternId: iterator.patternId,
                    pieces: iterator.piece,
                    organizationId: req.organizationId,
                    isDeleted: false
                })
            }
        }

        findJob.status = 'Complete';
        await findJob.save();

        res.status(200).json({
            status: 201,
            message: 'job Complete successfully.',
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const jobPatternAddProcess = async (req: Request, res: Response) => {
    try {

        const { jobPatternIds, processId, vendorId, jobId } = req.body;

        if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) throw new Error('please provide valid jobId.');
        if (!jobPatternIds.length) throw new Error('At least one jobPatternId is required.');

        if (!processId || !mongoose.Types.ObjectId.isValid(processId)) throw new Error('please provide valid processId.');
        if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) throw new Error('please provide valid vendorId.');

        let findJob = await JOB.findOne({ _id: jobId, organizationId: req.organizationId, isDeleted: false });
        if (!findJob) throw new Error('job not found.');

        let findProcess = await PROCESS.findOne({ _id: processId, organizationId: req.organizationId, isDeleted: false });
        if (!findProcess) throw new Error('process not found.');

        let vendorFind = await VENDOR.findOne({ _id: vendorId, organizationId: req.organizationId, isDeleted: false });
        if (!vendorFind) throw new Error('Vendor not found.');

        for (const jobPatternId of jobPatternIds) {
            if (!mongoose.Types.ObjectId.isValid(jobPatternId)) throw new Error('please provide valid jobPatternId.');
        }

        let response = []

        for (const jobPatternId of jobPatternIds) {

            let findJobPattern = await JOB_PATTERN.findOne({ jobId: jobId, _id: jobPatternId });
            if (!findJobPattern) throw new Error('jobPattern not found.');

            let findJobPatternStatus = await JOB_PATTERN_STATUS.findOne({ jobId: jobId, processId: processId, jobPatternId: jobPatternId });

            let startDate = new Date();

            if (!findJobPatternStatus) {
                findJobPatternStatus = await JOB_PATTERN_STATUS.create({
                    jobId,
                    processId,
                    vendorId,
                    jobPatternId,
                    status: "Processing",
                    startDate,
                    endDate: null
                })
                response.push(findJobPatternStatus)
            }
        }

        res.status(200).json({
            status: 201,
            message: 'add processes for job Successfully',
            data: response
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobPatternUpdateProcess = async (req: Request, res: Response) => {
    try {

        let { jobPatternProcessId, processId, vendorId, jobPatternIds } = req.body;

        if (!jobPatternProcessId || !mongoose.Types.ObjectId.isValid(jobPatternProcessId)) throw new Error('please provide valid jobPatternProcessId.');
        if (!jobPatternIds || !mongoose.Types.ObjectId.isValid(jobPatternIds)) throw new Error('please provide valid jobPatternId.');
        if (!processId || !mongoose.Types.ObjectId.isValid(processId)) throw new Error('please provide valid processId.');
        if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) throw new Error('please provide valid vendorId.');

        let findJobStatus: any = await JOB_PATTERN_STATUS.findOne({ _id: jobPatternProcessId })
        if (!findJobStatus) throw new Error('job pattern process not found.');

        let findProcess = await PROCESS.findOne({ _id: processId, organizationId: req.organizationId, isDeleted: false });
        if (!findProcess) throw new Error('process not found.')

        let vendorFind = await VENDOR.findOne({ _id: vendorId, organizationId: req.organizationId, isDeleted: false });
        if (!vendorFind) throw new Error('Vendor not found.');

        let jobPatternFind = await JOB_PATTERN.findOne({ _id: jobPatternIds });
        if (!jobPatternFind) throw new Error('job pattern not found.');

        findJobStatus.processId = processId
        findJobStatus.vendorId = vendorId
        findJobStatus.jobPatternId = jobPatternIds
        await findJobStatus.save();

        res.status(200).json({
            status: 201,
            message: 'process Update successfully.',
            data: findJobStatus
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobPatternCompleteProcess = async (req: Request, res: Response) => {
    try {

        const { jobPatternProcessId } = req.query as any;

        if (!jobPatternProcessId || !mongoose.Types.ObjectId.isValid(jobPatternProcessId)) throw new Error('please provide valid jobPatternProcessId.');

        let findJobStatus: any = await JOB_PATTERN_STATUS.findOne({ _id: jobPatternProcessId })
        if (!findJobStatus) throw new Error('job pattern process not found.');

        findJobStatus.status = 'Complete';
        findJobStatus.endDate = new Date();
        await findJobStatus.save()

        res.status(200).json({
            status: 201,
            message: "pattern's process Complete Successfully",
        });

    } catch (error: any) {
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
}

export const jobPatternDeleteProcess = async (req: Request, res: Response) => {
    try {

        let { jobId, jobPatternProcessId } = req.body;

        switch (true) {
            case !jobId:
                throw new Error('jobId is required.');
            case !jobPatternProcessId:
                throw new Error('jobPatternProcessId is required.');
            default:
                break;
        }

        let findJobPatternProcess: any = await JOB_PATTERN_STATUS.findOne({ _id: jobPatternProcessId, jobId: jobId })
        if (!findJobPatternProcess) throw new Error('job pattern process not found.');
        await findJobPatternProcess.deleteOne();

        res.status(200).json({
            status: 201,
            message: 'job Delete successfully.',
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const jobPatternDelete = async (req: Request, res: Response) => {
    try {

        const { jobPatternId } = req.query;

        if (!jobPatternId) {
            throw new Error('jobPatternId is required.');
        }

        const findJobPattern = await JOB_PATTERN.findOne({ _id: jobPatternId });
        if (!findJobPattern) throw new Error('please provide valid jobPatternId.');

        await findJobPattern.deleteOne();

        res.status(200).json({
            status: 201,
            message: 'jobPattern Delete successfully.',
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}

export const jobRoleDelete = async (req: Request, res: Response) => {
    try {

        const { jobRoleId } = req.query;

        if (!jobRoleId) {
            throw new Error('jobRoleId is required.');
        }

        const findJobRole = await ROLE.findOne({ _id: jobRoleId });
        if (!findJobRole) throw new Error('please provide valid jobPatternId.');

        await findJobRole.deleteOne();

        res.status(200).json({
            status: 201,
            message: 'jobRole Delete successfully.',
        });

    } catch (error: any) {

        res.status(400).json({
            status: "Failed",
            message: error.message,
        });

    }
}