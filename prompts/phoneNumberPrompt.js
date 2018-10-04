const { NumberPrompt } = require('botbuilder-dialogs');

// This is a custom NumberPrompt that requires the value to be between 1 and 99.
module.exports.PhoneNumberPrompt = class PhoneNumberPrompt extends NumberPrompt {
    constructor(dialogId) {
        super(dialogId, async (prompt) => {
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('Please tell me your phone number!');
                return false;
            } else {
                var phoneNumber = prompt.recognized.value; 
                if(phoneNumber.toString().length==10){
                    return true;
                }
                else{
                    await prompt.context.sendActivity('Please enter 10 digit number.');
                    return false;
                }
               
            }
        });
    }
};