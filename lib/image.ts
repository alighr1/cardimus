/** Downscale + compress an image file client-side. Returns JPEG base64 (no prefix) and a small thumbnail data URL. */
async function drawScaled(bitmap: ImageBitmap, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function prepareImage(file: File) {
  // imageOrientation "from-image" applies EXIF rotation so phone photos aren't sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const full = await drawScaled(bitmap, 1600);
  const thumb = await drawScaled(bitmap, 320);
  bitmap.close();
  const dataUrl = full.toDataURL("image/jpeg", 0.85);
  return {
    base64: dataUrl.split(",")[1],
    mediaType: "image/jpeg" as const,
    thumbnail: thumb.toDataURL("image/jpeg", 0.7),
  };
}
