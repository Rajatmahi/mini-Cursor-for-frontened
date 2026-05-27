import 'dotenv/config';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os'

const platform = os.platform();

const asyncExecute = promisify(exec);

const History = [];
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});


//  Tool create karte hai, jo kisi bhi terminal/ shell command ko execute kar sakta hai

async function executeCommand({command}) {
     
    try{
    const {stdout, stderr} = await asyncExecute(command);

    if(stderr){
        return `Error: ${stderr}`
    }

    return `Success: ${stdout} || Task executed completely`

    }
    catch(error){
      
        return `Error: ${error}`
    }
    
}



const executeCommandDeclaration = {
    name: "executeCommand",
    description:"Execute a single terminal/shell command. A command can be to create a folder, file, write on a file, edit the file or delete the file",
    parameters:{
        type:'OBJECT',
        properties:{
            command:{
                type:'STRING',
                description: 'It will be a single terminal command. Ex: "mkdir calculator"'
            },
        },
        required: ['command']   
    }

}


const availableTools = {
   executeCommand
}


async function runAgent(userProblem) {

    try {

        const response = await client.chat.completions.create({

            model: "openai/gpt-3.5-turbo",

            messages: [

                {
                    role: "system",
                    content: `
You are an AI frontend website builder.

IMPORTANT RULES:

1. ONLY output terminal commands
2. DO NOT explain anything
3. ALWAYS create:
   - index.html
   - style.css
   - script.js
4. ALWAYS put files INSIDE the project folder
5. ALWAYS write COMPLETE code inside files
6. ALWAYS use full paths

Example:

mkdir calculator

touch calculator/index.html

touch calculator/style.css

touch calculator/script.js

Use THIS format for writing files:

cat <<EOF > calculator/index.html
FULL HTML CODE
EOF

cat <<EOF > calculator/style.css
FULL CSS CODE
EOF

cat <<EOF > calculator/script.js
FULL JS CODE
EOF

ONLY RETURN COMMANDS.
`
                },

                {
                    role: "user",
                    content: userProblem
                }

            ]

        });

        const aiResponse =
            response.choices[0].message.content;

        console.log("\nAI COMMANDS:\n");

        console.log(aiResponse);

        // split commands line by line
        const commands =
            aiResponse.split("\n");

        for (const command of commands) {

            if (!command.trim()) continue;

            console.log(`\nExecuting: ${command}\n`);

            const result =
                await executeCommand({
                    command
                });

            console.log(result);
        }

    }

    catch (error) {

        console.log("\nERROR:\n");

        console.log(error.message);
    }
}


async function main() {

    console.log("I am a cursor: let's create a website");
    const userProblem = readlineSync.question("Ask me anything--> ");
    await runAgent(userProblem);
    main();
}


main();




