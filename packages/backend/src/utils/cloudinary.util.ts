import cloudinary from "../config/cloudinary";

export const deleteCloudinaryImage = async (publicId: string | null | undefined) => {
    //kiem tra public Id
    if (!publicId || publicId === 'avatar' || publicId.includes('default')) {
        return null;
    }

    try {
        let idToDelete = publicId;
        const result = await cloudinary.uploader.destroy(idToDelete, { invalidate: true })
        //console.log("Da xoa anh cu!", idToDelete);
        return result;
    } catch (error) {
        console.error(`Loi khi xoa anh ${publicId} tren Cloudinary!`, error);
        return null;
    }
}