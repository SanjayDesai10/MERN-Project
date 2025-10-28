const validateFileUpload = (req, res, next) => {
  if (!req.body.coverImage) {
    return next();
  }

  // Check if the image is base64
  if (!req.body.coverImage.startsWith("data:image")) {
    return res.status(400).json({
      success: false,
      message: "Invalid file type. Only images are allowed.",
    });
  }

  // Extract the base64 data
  const base64Data = req.body.coverImage.split(";base64,").pop();

  // Check file size (5MB limit)
  const sizeInBytes = Buffer.from(base64Data, "base64").length;
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (sizeInBytes > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 5MB.",
    });
  }

  next();
};

module.exports = validateFileUpload;
