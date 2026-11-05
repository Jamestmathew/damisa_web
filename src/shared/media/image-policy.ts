export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export function imageType(bytes: Uint8Array) {
  if (bytes.length > MAX_IMAGE_BYTES)
    throw new Error("Images must be 3 MB or smaller.");
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
  )
    return { mime: "image/png", extension: "png" };
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return { mime: "image/jpeg", extension: "jpg" };
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return { mime: "image/webp", extension: "webp" };
  throw new Error(
    "Upload a PNG, JPEG, or WebP image. SVG files are not accepted.",
  );
}
