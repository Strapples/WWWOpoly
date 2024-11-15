// models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['general', 'achievement', 'economy', 'milestone', 'trade', 'maintenance', 'other'], 
        default: 'general' 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date, 
        required: false 
    } // Optional expiry date for temporary notifications
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);