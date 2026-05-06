import ImageKit from "imagekit-javascript";
export const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

export async function uploadImage(file) {
    if (!file) {
        throw new Error("No file provided for upload.");
    }

    const authRes = await fetch("http://localhost:3000/imagekit-auth");
    const authParams = await authRes.json();
    try {
        const response = await imagekit.upload({
            file: file,
            fileName: `post-image-${Date.now()}`,
            ...authParams,
        });
        return {
            url: response.url,
            fileId: response.fileId,
            name: response.name,
        };
    } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Failed to upload image. Please try again.");
    }
}