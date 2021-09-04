import { v2 } from 'cloudinary';

export const FileProvider = {
  provide: "Cloudinary",
  useFactory: (): any => {
    return v2.config({
   cloud_name: 'maxdevtwitter', 
  api_key: '912822669229832', 
  api_secret: 'isombGs_wFKbLKUMq5FWFB0o6Z4'  
    });
  },
};