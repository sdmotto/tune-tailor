import Replicate from "replicate";
import { Readable } from "stream";

export default class ReplicateAdapter {
    constructor() {
        this.replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
        });
    }

    async generateSong(lyrics) {
        const input = {
            prompt: lyrics,
            model_version: "stereo-large",
            output_format: "mp3",
            normalization_strategy: "peak",
            duration: 5
        };
    
        const output = await this.replicate.run(
            "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
            { input }
        );

        // Convert the ReadableStream to a Buffer
        const chunks = [];
        const readableStream = Readable.from(output);

        for await (const chunk of readableStream) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        return buffer;
    }
}