import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).select("-password")  // find the users except for the logged in user

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("Error in getUsersFor Sidebar: ", error.message);
        res.status(500).json({ error: "Internal server error"})
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params
        const myId = req.user._id;
        
        // find all messages between sender and receiver and vice versa
        const messages = await Message.find({
            $or:[
                {senderId:myId, receiverId: userToChatId},
                {senderId:userToChatId, receiverId: myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message)
        res.status(500).json({ error: "internal server error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // realtime functionality
        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)  // only send the message to the receiver
        }

        res.status(201).json(newMessage)

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" })
    }
}