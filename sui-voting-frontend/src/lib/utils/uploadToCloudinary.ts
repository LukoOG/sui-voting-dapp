import imageCompression from "browser-image-compression";

const MAX_SIZE = 10 * 1024 * 1024;

export async function uploadToCloudinary(file: File): Promise<string> {
  let uploadFile = file;

  if (file.size > MAX_SIZE) {
    uploadFile = await imageCompression(file, {
      maxSizeMB: 9.5,              
      maxWidthOrHeight: 1800,      
      useWebWorker: true,
      fileType: file.type.includes("png") ? "image/png" : undefined,
    });
  }
	
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}
