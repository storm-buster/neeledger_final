import { PinataSDK } from "pinata";

// Initialize the Pinata SDK using environment variables
export const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT || "",
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY || "",
});

/**
 * Uploads a raw File object to Pinata
 * @param file The File object
 * @returns The IPFS CID (hash) of the uploaded file
 */
export async function uploadFileToPinata(file: File): Promise<string> {
  if (!import.meta.env.VITE_PINATA_JWT) {
    console.warn("Pinata JWT not found. Skipping IPFS upload.");
    return "";
  }

  try {
    const upload = await pinata.upload.public.file(file);
    return upload.cid;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

