export interface UploadImageInput {
  image_base64: string;
  owner_id: string;
}

export interface UploadImageResult {
  secure_url: string;
}
