const  { TextPrompt } = require('botbuilder-dialogs');

// This is a custom NumberPrompt that requires the value to be between 1 and 99.
module.exports.EmailPrompt = class EmailPrompt extends TextPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Please tell me your email-id!');
                return false;
            } else {
                const emailId = prompt.recognized.value; 
                const emailRegex = RegExp(/\S+@\S+\.\S+/);
                if(emailRegex.test(emailId)){ 
                    
                    return true;
                } else {
                    await prompt.context.sendActivity('Please enter a valid email-id.');
                    return false;
                }
            }
        });
    }
};