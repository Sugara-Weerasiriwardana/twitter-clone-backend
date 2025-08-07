import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dsb1gsrko';
const apiKey = process.env.CLOUDINARY_API_KEY || '184378139825863';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'pg6T_HdPyHcbeSM_zKjGCAzC07Q';

console.log('Cloudinary Config:', {
  cloudName: cloudName ? 'SET' : 'MISSING',
  apiKey: apiKey ? 'SET' : 'MISSING',
  apiSecret: apiSecret ? 'SET' : 'MISSING'
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary; 