const multer = require('multer')

// Photos are stored inside MongoDB as data URLs (no Cloudinary, no local disk —
// both problematic: one needs an account, the other is wiped on Render restarts).
// The client compresses images before upload, so keep a sane server-side cap too.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WebP images are allowed!'), false)
    }
    cb(null, true)
  }
})

module.exports = upload
