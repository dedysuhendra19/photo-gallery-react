import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export function usePhotoGallery() {
    // define an array of UserPhoto, which will contain a reference to each photo captured with the Camera. 
    // Make it a state variable using React's useState hook.
    const [photos, setPhotos] = useState<UserPhoto[]>([]);
    
    const addNewToGallery = async () => {
        // Take a photo
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100,
        });

        // Create the `fileName` with current timestamp
        const fileName = Date.now() + '.jpeg';
        // Create `savedImageFile` matching `UserPhoto` interface
        const savedImageFile: UserPhoto[]= [
            {
                filepath: fileName,
                webviewpath: capturedPhoto.webPath
            },
            ...photos
        ]

        // Update the `photos` array with the new photo
        setPhotos(savedImageFile);
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