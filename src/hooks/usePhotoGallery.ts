import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { useState } from 'react';

export function usePhotoGallery() {
    // define an array of UserPhoto, which will contain a reference to each photo captured with the Camera. 
    // Make it a state variable using React's useState hook.
    const [photos, setPhotos] = useState<UserPhoto[]>([]);
    
    const addNewToGallery = async () => {
        // Take a photo
        const capturedPhoto: Photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100,
        });

        // Create the `fileName` with current timestamp
        const fileName: string = Date.now() + '.jpeg';
        // Create `savedImageFile` matching `UserPhoto` interface
        const savedImageFile: UserPhoto = await savePicture(capturedPhoto, fileName);

        // Update the `photos` array with the new photo
        const newPhotos: UserPhoto[] = [savedImageFile, ...photos];
        setPhotos(newPhotos);
    };

    const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath!);
        const blob = await response.blob();
        const base64Data = (await convertBlobToBase64(blob)) as string;

        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data,
        });
        
        return {
            filepath: fileName,
            webviewpath: photo.webPath,
        };
    };

    const convertBlobToBase64 = (blob: Blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(blob);
        });
    };

    return {
        addNewToGallery,
        // return statement to include `photos` array
        photos,
    };
}

export interface UserPhoto {
    filepath: string;
    webviewpath?: string;
}
