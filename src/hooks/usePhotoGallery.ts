import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { useEffect, useState } from 'react';

import { isPlatform } from '@ionic/react';
// to help with file paths on mobile devices
import { Capacitor } from '@capacitor/core';

export function usePhotoGallery() {
    // add state variables
    const [photos, setPhotos] = useState<UserPhoto[]>([]);
    // add key for photo storage
    const PHOTO_STORAGE = 'photos';

    // add useEffect hook, similiar to Lifecycle hook in angular (e.g. ngOnInit, etc...)
    useEffect(() => {
        const loadSaved = async () => {
            const { value: photoList } = await Preferences.get({ key: PHOTO_STORAGE });
            const photosInPreferences = photoList ? JSON.parse(photoList) : [];

            // Display the photo by reading into base64 format (on the web)
            if(!isPlatform('hybrid')) {
                for (const photo of photosInPreferences) {
                    const readFile = await Filesystem.readFile({
                        path: photo.filepath,
                        directory: Directory.Data
                    });

                    photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
                }
            }

            // set photo from Preferences/local storage
            setPhotos(photosInPreferences);
        };

        loadSaved();

    }, []); //The second parameter, the empty dependency array ([]), is what tells React to only run the function once.

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

        // save all photos for later viewing
        Preferences.set({ 
            key: PHOTO_STORAGE, 
            value: JSON.stringify(newPhotos)
        });
    };

    const savePicture = async (photo: Photo, fileName: string): Promise<UserPhoto> => {
        let base64Data: string | Blob;

        if (isPlatform('hybrid')) {
            // Read the file into base64 format
            const readFile = await Filesystem.readFile({
                path: photo.path!
            });
            base64Data = readFile.data;
        } else {
            // Fetch the photo, read as a blob, then convert to base64 format
            const response = await fetch(photo.webPath!);
            const blob = await response.blob();
            base64Data = (await convertBlobToBase64(blob)) as string;
        }

        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        })

        if (isPlatform('hybrid')) {
            // Display the new image by rewriting the 'file://' path to HTTP
            return {
                filepath: savedFile.uri,
                webviewPath: Capacitor.convertFileSrc(savedFile.uri)
            }
        }

        // Use webPath to display the new image instead of base64 since it's
        // already loaded into memory
        return {
            filepath: fileName,
            webviewPath: photo.webPath
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
    webviewPath?: string;
}