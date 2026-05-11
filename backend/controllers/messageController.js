const Message = require('../models/Message');

// @desc    Get all messages between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ]
    }).sort('createdAt');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get users you have chatted with
// @route   GET /api/messages/conversations/users
// @access  Private
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find all distinct users we sent messages to or received messages from
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    }).populate('senderId receiverId', 'name email role');

    // Extract unique users
    const usersMap = new Map();
    messages.forEach(msg => {
      const otherUser = msg.senderId._id.toString() === currentUserId.toString() 
        ? msg.receiverId 
        : msg.senderId;
      
      if (otherUser && !usersMap.has(otherUser._id.toString())) {
        usersMap.set(otherUser._id.toString(), otherUser);
      }
    });

    res.status(200).json(Array.from(usersMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
