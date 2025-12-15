import multer from "multer";

// En Vercel SOLO memory storage
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;