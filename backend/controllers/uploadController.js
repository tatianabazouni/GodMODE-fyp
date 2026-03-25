import cloudinary from "../server/config/cloudinary.js";

export const uploadImage = async (req, res) => {
  const result = await cloudinary.uploader.upload(req.body.image);

  res.json({ imageUrl: result.secure_url });
};