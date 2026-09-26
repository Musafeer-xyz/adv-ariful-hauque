/**
 * Downscale and compress an image file in the browser via canvas.
 * Photos are stored as data URLs inside MongoDB, so keeping them small matters.
 */
export const compressImage = (file, maxSize = 800, quality = 0.82) =>
  new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      reject(new Error('Only JPG, PNG, or WebP images are allowed'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the selected file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not load the selected image'))
      img.onload = () => {
        // Downscale so the longest edge is at most `maxSize`px
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not process the image'))
              return
            }
            const compressedName = file.name.replace(/\.[^.]+$/, '') + '.jpg'
            resolve(new File([blob], compressedName, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
