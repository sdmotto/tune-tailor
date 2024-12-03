import crypto from 'crypto'
import request from 'request'

export default class AcrCloudAdapter {
  constructor() {
    this.host = process.env.ACR_HOST; // Ensure this is set correctly in your .env file
    this.accessKey = process.env.ACR_ACCESS_KEY; // Ensure this is set correctly in your .env file
    this.accessSecret = process.env.ACR_ACCESS_SECRET; // Ensure this is set correctly in your .env file
  }

  defaultOptions = {
    host: this.host,
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type:'audio',
    secure: true,
    access_key: this.accessKey,
    access_secret: this.accessSecret
  };

  identify(data, options, cb) {
    var current_data = new Date();
    var timestamp = current_data.getTime()/1000;
  
    var stringToSign = buildStringToSign('POST',
      options.endpoint,
      options.access_key,
      options.data_type,
      options.signature_version,
      timestamp);
  
    var signature = sign(stringToSign, options.access_secret);
  
    var formData = {
      sample: data,
      access_key:options.access_key,
      data_type:options.data_type,
      signature_version:options.signature_version,
      signature:signature,
      sample_bytes:data.length,
      timestamp:timestamp,
    }
    request.post({
      url: "http://"+options.host + options.endpoint,
      method: 'POST',
      formData: formData
    }, cb);
  }

  buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  }
  
  sign(signString, accessSecret) {
    return crypto.createHmac('sha1', accessSecret)
      .update(Buffer.from(signString, 'utf-8'))
      .digest().toString('base64');
  }
}
