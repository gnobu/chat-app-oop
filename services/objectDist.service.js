"use strict"
const cloudinary = require('cloudinary').v2;

const cloudinaryConfig = cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDINARYSECRET,
    secure: true
});

class ObjectDistService {
    createSignature(timestamp) {
        const signature = cloudinary.utils.api_sign_request({ timestamp }, cloudinaryConfig.api_secret);
        return { api_key: cloudinaryConfig.api_key, cloud_name: cloudinaryConfig.cloud_name, timestamp, signature };
    }

    validatedSignature(payload, signature) {
        const expectedSignature = cloudinary.utils.api_sign_request(payload, cloudinaryConfig.api_secret);

        if (expectedSignature === signature) {
            return true;
        } else {
            return false;
        }
    }
}


module.exports = { ObjectDistService };