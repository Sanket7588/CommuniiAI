const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const cors = require("cors");
const { createPieChart } = require("./chartGenerator"); // Import the chart generator function

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
            { text: "only return confidence level, grammar level, filler words level in the form of a JavaScript array" },
            { fileData: { fileUri: uploadResult.file.uri, mimeType } },
        ]);

        const responseText = await result.response.text();
        console.log(responseText); // Print the response to the console

        // Extract the array from the response
        const dataArray = JSON.parse(responseText.match(/\[.*\]/)[0]);
        console.log(dataArray); // Print the extracted array to the console

        // Generate pie charts with the response data
        await createPieChart(dataArray);

        return dataArray;

    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}

// Endpoint to receive the video file
app.post("/transcribe2", async (req, res) => {
    const { fileName } = req.body; // Assuming fileName is passed in the request body
    const dataArray = await transcribeAudio(fileName);
    if (dataArray) {
        res.json({ success: true, dataArray });
    } else {
        res.json({ success: false });
    }
});

app.listen(3002, () => {
    console.log("Server is running on port 3002");
});