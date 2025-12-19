import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
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
        });

        // add newly caputered photo to the beginning of the array of photos
        const fileName = Date.now() + '.jpeg';
        const savedImageFile: UserPhoto[] = [
            {
                filepath: fileName,
                webiewPath: capturedPhoto.webPath
            },
            ...photos
        ];
        
        // update photos with the new photo
        setPhotos(savedImageFile);
    };

    return { addNewToGallery, photos };
}

export interface UserPhoto {
    filepath: string;
    webiewPath?: string;
}