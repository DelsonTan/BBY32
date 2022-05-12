"use strict";

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (_, __, callback) {
    callback(null, "./app/avatar-images/");
  },
  filename: function (req, file, callback) {
    const fileExtension = file.originalname.split(".").pop();
    callback(null, `${req.session.uuid}.${fileExtension}`);
  },
});

const uploadImages = multer({ storage });

module.exports = {
  uploadImages,
};
