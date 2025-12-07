import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.VITE_CLOUDINARY_CLOUD_NAME,
    api_key: env.VITE_CLOUDINARY_API_KEY,
    api_secret: env.VITE_CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param file - File object or base64 string
 * @param folder - Folder path in Cloudinary (optional)
 * @returns Promise with uploaded file URL
 */
export async function uploadToCloudinary(
    file: File | string,
    folder: string = "cico-photos"
): Promise<string> {
    try {
        let uploadResult;

        if (typeof file === "string") {
            // Base64 string
            uploadResult = await cloudinary.uploader.upload(file, {
                folder,
                resource_type: "image",
                format: "jpg",
            });
        } else {
            // File object - convert to base64
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const dataUri = `data:${file.type};base64,${base64}`;

            uploadResult = await cloudinary.uploader.upload(dataUri, {
                folder,
                resource_type: "image",
                format: "jpg",
            });
        }

        return uploadResult.secure_url;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error(
            error instanceof Error
                ? error.message
                : "Gagal mengunggah foto ke Cloudinary"
        );
    }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image in Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        throw new Error("Gagal menghapus foto dari Cloudinary");
    }
}

export { cloudinary };

