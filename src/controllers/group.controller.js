
import mongoose from "mongoose";
import GroupModel from "../models/group.model.js";
import cloudinary from "../services/cloudinary.service.js";
import { Readable } from "node:stream";
import UserModel from "../models/user.model.js";

// backend validation in this controller is pending
const createGroup = async(req, res)=>{

    let uploadedPublicId= null;

    try {
        let loggedInUser = req.user.id; // sender id

        let {groupName, members, description }= req.body;
        
        members = JSON.parse(members);

        if (!groupName?.trim()) {
            return res.status(400).json({
                message: "Group name is required",
                success: false,
            });
        }

        if (!Array.isArray(members) || members.length <=1) {
            return res.status(400).json({
                message: "At least one member is required",
                success: false,
            });
        }

        let result = null;
        if(req.file !== undefined){
            result = await new Promise((resolve, reject) => {
                let uploadStream = cloudinary.uploader.upload_stream(
                    {folder: "group-photo" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );    
                Readable.from(req.file.buffer).pipe(uploadStream);
            });
        }

        uploadedPublicId = result?.public_id;

        let groupAvatar = {
            publicId: result?.public_id || null,
            url: result?.secure_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyMhkU6ImpYVLj4XSVXbVg3z-A3a1hmdeZ4IF3ja-gwQ&s=10",
            createdAt: result?.created_at  || null
        };

        let uniqueMembers = [...new Set([
            ...members.map(id => id.toString()),
            loggedInUser.toString()
        ])];

        let modifyMembers = uniqueMembers.map(userId => ({
            userId,
            role: userId === loggedInUser.toString() ? "admin" : "member",
            joinedAt : Date.now()
        }));

        let group = await GroupModel.create({
            groupAvatar,
            groupName,
            members : modifyMembers,
            description,
            createdBy : loggedInUser,
        });

        res.status(201).json({
            message : "Group Created",
            success : true
        });

    } catch (error) {

        if (uploadedPublicId) {
            cloudinary.uploader.destroy(uploadedPublicId).catch((err) => {
                console.error("Rollback failed to delete new image:", err.message);
            });
        }

        return res.status(500).json({ 
            message: "Some Issue in Creating Group", 
            error: error.message, 
            success: false 
        });
    }
}

// fetch all group (only those where user is present )
const fetchAllGroupDetails = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // logged in user

        let groups = await GroupModel.find({
            $or : [
                {createdBy : loggedInUser}, 
                {"members.userId" : loggedInUser}
            ]
        }).populate({path: "members.userId",select: "avatar username name"});

        res.status(200).json({
            message : "Group Details Fetched",
            success : true,
            data : groups
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in fetching group details", 
            error: error.message, 
            success: false 
        });
    }
}

const addMembers = async(req, res)=>{
    try {
        let group = req.group ;
        let members = req.body;

        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of member IDs.",
            });
        }

        let invalidIds = members.filter((id) => !mongoose.isObjectIdOrHexString(id));

        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some member IDs are invalid.",
                invalidIds,
            });
        }

        // Remove duplicate IDs
        let uniqueIds = [...new Set(
            members.map((id) => id.toString())
        )];

        console.log("uniqueIds ", uniqueIds);

        // Check which users exist in DB (single query)
        let existingUsers = await UserModel.find({
            _id: { $in: uniqueIds },
        }).select("_id");

        console.log("existingUsers ", existingUsers)

        let existingUserIds = new Set(
            existingUsers.map((user) => user._id.toString())
        );

        console.log("existingUserIds ", existingUserIds)

        // Identify IDs that don't exist
        let notFoundIds = uniqueIds.filter(
            (id) => !existingUserIds.has(id)
        );

        if (notFoundIds.length > 0) {
            return res.status(404).json({
                success: false,
                message: "Some users do not exist.",
                notFoundIds,
            });
        }

        // 6. Check which users are already group members
        let currentMemberIds = new Set(
            group.members.map((member) => member.userId.toString())
        );

        let alreadyMembers = uniqueIds.filter(
            (id) => currentMemberIds.has(id)
        );

        if (alreadyMembers.length > 0) {
            return res.status(409).json({
                message: "Some users are already members of this group.",
                success: false,               
                alreadyMembers,
            });
        }

        group.members.push(
            ...existingUsers.map((user) => ({
                userId: user._id,
                role: "member",
            }))
        );

        // await group.save();

        return res.status(200).json({
            success: true,
            message: `${existingUsers.length} members added successfully.`,
            addedCount: existingUsers.length,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Some Issue in Adding Member in Group",
            error: error.message,
            success: false,
        });
    }
}

const removeMembers = async(req, res)=>{
    try {
        let group = req.group;
        let { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        let user = await UserModel.findById(userId).select("username");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,               
            });
        }

        let isMember = group.members.some(
            member => member.userId.toString() === userId
        );

        if (!isMember) {
            return res.status(404).json({
                message: "User Not a member in this Group",
                success: false,
            });
        }

        if(group.members.length === 2){
            return res.status(400).json({
                success: false,
                message: "Cannot remove the last group member"
            });
        }

        let result = group.members.pull({
            userId: new mongoose.Types.ObjectId(userId)
        });

        await group.save();

        res.status(200).json({
            message: "Member removed successfully",
            success: true          
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Removing Group Member", 
            error: error.message, 
            success: false 
        });
    }
}

// delete group
const deleteGroup = async(req, res)=>{
    try {
        let groupId = req.group._id;

        await GroupModel.findOneAndDelete(groupId);

        // once conversation for that group starts, i need to delete all the conversation of that collection 
        res.status(200).json({
            message : "Group Deleted",
            success : true
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Deleting Group", 
            error: error.message, 
            success: false 
        });
    }
}

const editGroup = async (req, res) => {
    let uploadedPublicId = null;

    try {
        let { groupName, description } = req.body;
        let group = req.group;

        if (!groupName?.trim()) {
            return res.status(400).json({
                message: "Group name is required",
                success: false,
            });
        }

        let uploaded = null;
        if (req.file) {
            uploaded = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "group-photo" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                Readable.from(req.file.buffer).pipe(stream);
            });
            uploadedPublicId = uploaded.public_id;
        }

        group.groupName = groupName.trim();
        group.description = description?.trim() || "";

        let oldPublicId = group.groupAvatar?.publicId;

        if (uploaded) {
            group.groupAvatar = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
                createdAt: new Date(uploaded.created_at),
            };
        }

        await group.save();

        if (uploaded && oldPublicId) {
            cloudinary.uploader.destroy(oldPublicId)
                .catch((err) =>
                    console.error("Failed to delete old avatar:", err.message)
                );
        }

        return res.status(200).json({
            message: "Group Updated",
            success: true,
        });
    } catch (error) {
       
        if (uploadedPublicId) {
            cloudinary.uploader.destroy(uploadedPublicId)
                .catch((err) =>
                    console.error("Rollback failed to delete new image:", err.message)
                );
        }

        return res.status(500).json({
            message: "Some Issue in Updating Group",
            error: error.message,
            success: false,
        });
    }
};

// const exitGroup = async( req, res)=>{
//     try {
        
//         let loggedInUser = req.user.id; // logged in user
//         let {groupId} = req.params;

//         if (!mongoose.Types.ObjectId.isValid(groupId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Group ID"
//             });
//         }

//         let group = await GroupModel.findOne({_id:groupId});

//         if(!group){
//             return res.status(404).json({
//                 message : "Group Not Found",
//                 success : false
//             })
//         }

//         let isMember = group.members.some(
//             member => member.userId.toString() === loggedInUser
//         );

//         if (!isMember) {
//             return res.status(404).json({
//                 message: "User is Not a member in this Group",
//                 success: false,
//             });
//         }

//         group.members.pull({
//             userId: new mongoose.Types.ObjectId(loggedInUser)
//         });

//         await group.save();

//         res.status(200).json({
//             success: true,
//             message: "You have Exited the Group",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Some Issue in Exiting Group",
//             error: error.message,
//             success: false,
//         });
//     }
// }

const exitGroup = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const loggedInUser = req.user.id;
        const { groupId } = req.params;

        // 1. Validate group ID
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid group ID",
            });
        }

        let responseData = {};

        await session.withTransaction(async () => {

            // 2. Find group
            const group = await GroupModel.findById(groupId).session(session);

            if (!group) {
                const error = new Error("Group not found");
                error.statusCode = 404;
                throw error;
            }

            if (!group.isActive) {
                const error = new Error("This group is inactive");
                error.statusCode = 409;
                throw error;
            }

            // 3. Find logged-in user's membership
            const memberIndex = group.members.findIndex(
                (member) => member.userId.toString() === loggedInUser.toString()
            );

            if (memberIndex === -1) {
                const error = new Error("You are not a member of this group");
                error.statusCode = 403;
                throw error;
            }

            const leavingMember = group.members[memberIndex];
            const wasAdmin = leavingMember.role === "admin";

            // 4. Remove the leaving member
            group.members.splice(memberIndex, 1);

            let newAdmin = null;
            let groupDeactivated = false;

            // 5. Handle the case where no members remain
            if (group.members.length === 0) {
                group.isActive = false;
                groupDeactivated = true;
            } else {

                // 6. Check whether any admin remains
                const hasAdmin = group.members.some(
                    (member) => member.role === "admin"
                );

                // 7. Promote the oldest remaining member if necessary
                if (!hasAdmin) {
                    const oldestMember = [...group.members].sort(
                        (a, b) =>
                            new Date(a.joinedAt).getTime() -
                            new Date(b.joinedAt).getTime()
                    )[0];

                    oldestMember.role = "admin";
                    newAdmin = oldestMember.userId;
                }
            }

            // 8. Save changes
            await group.save({ session });

            responseData = {
                groupDeactivated,
                newAdmin,
                remainingMembers: group.members.length,
                message: groupDeactivated
                    ? "You left the group. The group is now inactive."
                    : wasAdmin
                        ? "Admin exited successfully."
                        : "You have exited the group successfully.",
            };
        });

        return res.status(200).json({
            success: true,
            ...responseData,
        });

    } catch (error) {
        console.error("Exit group error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Something went wrong while exiting the group.",
        });

    } finally {
        await session.endSession();
    }
};


export {
    createGroup,
    addMembers,
    removeMembers,
    deleteGroup,
    fetchAllGroupDetails,
    editGroup,
    exitGroup
}