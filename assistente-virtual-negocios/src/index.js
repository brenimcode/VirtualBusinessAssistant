import dotenv, { configDotenv } from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai"
import readline from "readline"
dotenv.config();
import fs from "fs";
import oldLog from "./chatLog.json" with { type: "json" };


const genAI = new GoogleGenerativeAI(process.env.API_KEY);


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


async function conversar() {

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        systemInstruction: "Answer in the same language that the user is typing." +
            "Introduce yourself and offer to help" +
            "You are an assistant and finance expert helping a small business grow."
            + "Write in a positive, assertive and upbeat tone." +
            "Ignore everything that's not related to business"
    });

    //console.log(oldLog);
    const chat = model.startChat({
        history: oldLog,
        generationConfig: {
            maxOutputTokens: 500,
        },
    });
    async function askAndRespond() {
        rl.question("You: ", async (msg) => {
            if (msg.toLowerCase() === "exit") {
                var historico = await chat.getHistory();
                console.log("Feliz em ajudar, até a próxima! :)");
                fs.writeFile(
                    "chatLog.json",
                    JSON.stringify(historico),
                    function (err) {
                        if (err) console.error("algo deu errado!");
                    }
                );
                rl.close();
            } else {
                const result = await chat.sendMessage(msg);
                const response = await result.response;
                const text = await response.text();
                console.log("AI: ", text);
                askAndRespond();
            }
        });
    }

    askAndRespond();
}

conversar();
