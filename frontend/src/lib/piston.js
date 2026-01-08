//Piston API is a service for code execution

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_VERSIONS = {
    javascript : {
        language: "javascript",
        version: "18.15.0"
    },
    python : {
        language: "python",
        version: "3.10.0"
    },
    java : {
        language: "java",
        version: "15.0.2"
    }
};

/**
 * Execute source code in the specified programming language using the Piston API.
 *
 * @param {string} language - Language key to run (e.g., `"javascript"`, `"python"`, `"java"`).
 * @param {string} code - Source code to execute.
 * @returns {{success: boolean, output?: string, error?: string}} Object describing execution result: `success` is `true` when execution completed without stderr, `output` contains the program output (or `"NO Output"` when empty), and `error` contains an HTTP, runtime, or stderr message when `success` is `false`.
 */

export async function executeCode(language,code){
    try{
        const languageConfig = LANGUAGE_VERSIONS[language];

        if(!languageConfig){
            return {
                success:false,
                error: `Unsupported language : ${language}`
            }
        }

       const response =  await fetch(`${PISTON_API}/execute` ,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                language: languageConfig.language,
                version: languageConfig.version,
                files:[
                    {
                        name:`main.${getFileExtension(language)}`,
                        content: code
                    }
                ]
            })
        });

        if(!response.ok){
            return {
                success:false,
                error: `HTTP error! status:${response.status}`
            }
        }

        const data = await response.json()

        const output = data.run.output || ""
        const stderr = data.run.stderr || ""
        
        if(stderr){
            return {
                success:false,
                output:output,
                error:stderr
            }
        }
        return {
            success:true,
            output:output || "NO Output"
        }

    }catch(error){
        return {
                success: false,
                error:`Failed to execute code:${error.message}`,
            }
    }
}

/**
 * Return the file extension associated with a programming language identifier.
 * @param {string} language - Programming language identifier (e.g., "javascript", "python", "java").
 * @returns {string} The corresponding file extension ("js", "py", "java") or "txt" if unknown.
 */
function getFileExtension(language){
    const extensions = {
        javascript:"js",
        python:"py",
        java:"java"
    };
    return extensions[language] || "txt";
}