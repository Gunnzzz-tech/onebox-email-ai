import readline from "readline";
import {searchEmails} from './elasticsearchClient.js';

const rl=readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question(" Enter your search query:", async (query)=>{
    try{
        const results=await searchEmails(query);

        if(results.length===0){
            console.log("No matching emails found.");
        }
        else{
            console.log(`Found ${results.length} matching emails: \n`);
            results.forEach((hit: any, index: number) => {
                const email = hit._source;
                console.log(`${index + 1}. 📧 ${email.subject} (from: ${email.from})`);
            });
        }
    }
    catch(error){
        console.error(" Error searching emails", error);
    }
    finally{
        rl.close();
    }
})