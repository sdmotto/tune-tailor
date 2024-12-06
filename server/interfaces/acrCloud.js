import crypto from "crypto";
import axios from "axios";
import FormData from "form-data";

export default class AcrCloudAdapter {
  constructor() {
    this.host = process.env.ACR_HOST;
    this.accessKey = process.env.ACR_ACCESS_KEY;
    this.accessSecret = process.env.ACR_ACCESS_SECRET;

    this.options = {
      host: this.host,
      endpoint: "/v1/identify",
      signature_version: "1",
      data_type: "audio",
      secure: true,
      access_key: this.accessKey,
      access_secret: this.accessSecret,
    };
  }

  async identify(data) {
    const currentData = new Date();
    const timestamp = Math.floor(currentData.getTime() / 1000);

    const stringToSign = this.buildStringToSign(
      "POST",
      this.options.endpoint,
      this.options.access_key,
      this.options.data_type,
      this.options.signature_version,
      timestamp,
    );

    const signature = this.sign(stringToSign, this.options.access_secret);

    // Prepare form data
    const formData = new FormData();
    formData.append("sample", data);
    formData.append("access_key", this.options.access_key);
    formData.append("data_type", this.options.data_type);
    formData.append("signature_version", this.options.signature_version);
    formData.append("signature", signature);
    formData.append("sample_bytes", data.length);
    formData.append("timestamp", timestamp);

    // Correctly handle secure option and avoid malformed URLs
    const protocol = this.options.secure ? "https" : "http";
    const url = `${protocol}://${this.options.host}${this.options.endpoint}`;

    try {
      // Make the request using `axios`
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders ? formData.getHeaders() : {},
      });
      return response.data; // Directly return the response data
    } catch (error) {
      throw new Error(
        `Failed to identify audio: ${error.response?.data || error.message}`,
      );
    }
  }

  buildStringToSign(
    method,
    uri,
    accessKey,
    dataType,
    signatureVersion,
    timestamp,
  ) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
      "\n",
    );
  }

  sign(signString, accessSecret) {
    return crypto
      .createHmac("sha1", accessSecret)
      .update(Buffer.from(signString, "utf-8"))
      .digest("base64");
  }
}
