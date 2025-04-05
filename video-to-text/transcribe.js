const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

async function transcribeAudio(fileName) {
    try {
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);
        const filePath = path.resolve(__dirname, fileName);
        const fileExtension = path.extname(fileName).toLowerCase();

        // Improved MIME type handling
        const mimeTypes = {
            ".mp3": "audio/mp3",
            ".mp4": "video/mp4",
            ".wav": "audio/wav",
            ".m4a": "audio/m4a"
        };

        const mimeType = mimeTypes[fileExtension] || "application/octet-stream"; // Default unknown type

        console.log(`Uploading file: ${filePath} with MIME type: ${mimeType}`);

        const uploadResult = await fileManager.uploadFile(filePath, {
            mimeType,
            displayName: "Media sample",
        });

        let file = await fileManager.getFile(uploadResult.file.name);
        while (file.state === FileState.PROCESSING) {
            console.log("Processing file, please wait...");
            await new Promise((resolve) => setTimeout(resolve, 10_000)); // 10 sec wait
            file = await fileManager.getFile(uploadResult.file.name);
        }

        if (file.state === FileState.FAILED) {
            throw new Error("File processing failed.");
        }

        console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            { text: "Only return me the transcript of the media sample. Also, provide details of the shirt color and video information." },
            { fileData: { fileUri: uploadResult.file.uri, mimeType } },
        ]);

        console.log(await result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Call the function
transcribeAudio("./upload/input.mp4");