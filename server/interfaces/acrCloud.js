import axios from 'axios';
import crypto from 'crypto';

export default class AcrCloudAdapter {
  constructor() {
    this.host = process.env.ACR_HOST;
    this.accessKey = process.env.ACR_ACCESS_KEY;
    this.accessSecret = process.env.ACR_ACCESS_SECRET;
  }

  async identify(audioBuffer) {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `POST\n/v1/identify\n${this.accessKey}\n${timestamp}`;
    const signature = this.generateSignature(stringToSign);

    const formData = new FormData();
    formData.append('sample', audioBuffer);
    formData.append('access_key', this.accessKey);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp);

    try {
      const response = await axios.post(`${this.host}/v1/identify`, formData, {
        headers: formData.getHeaders(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`ACRCloud Identification failed: ${error.message}`);
    }
  }

  generateSignature(stringToSign) {
    return crypto
      .createHmac('sha1', this.accessSecret)
      .update(stringToSign)
      .digest('base64');
  }
}
