import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { useState } from 'react';

export function usePhotoGallery() {
    // add state variables
    const [photos, setPhotos] = useState<UserPhoto[]>([]);
    const addNewToGallery = async () => {
        // Take a photo
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        }) as Photo;

        
        const fileName = Date.now() + '.jpeg';

        // add newly caputered photo to the beginning of the array of photos
        // const savedImageFile: UserPhoto[] = [
        //     {
        //         filepath: fileName,
        //         webiewPath: capturedPhoto.webPath
        //     },
        //     ...photos
        // ];

        // update savedImageFile
        const savedImageFile = await savePicture(capturedPhoto, fileName);

        // update state with new photo
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
            directory: Directory.Data
        })

        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
            filepath: fileName,
            webiewPath: photo.webPath
        };
    };

    const convertBlobToBase64 = (blob: Blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result);
            }
            reader.readAsDataURL(blob);
        })
    }

    return { 
        addNewToGallery, 
        photos 
    };
}

export interface UserPhoto {
    filepath: string;
    webiewPath?: string;
}