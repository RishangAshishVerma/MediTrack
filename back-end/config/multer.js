import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public"); // all files go in /public
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf"];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionAllowed = allowedExtensions.includes(ext);
  const isMimeTypeAllowed = allowedMimeTypes.includes(file.mimetype);

  if (isExtensionAllowed && isMimeTypeAllowed) {
    cb(null, true);
  } else {
   
    cb(new Error("Only image files (JPG, PNG) or PDFs are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

export default upload;
