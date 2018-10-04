const { ActivityTypes,Activity } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const {EmailPrompt} =require('../prompts/emailPrompt');
const {PhoneNumberPrompt} = require('../prompts/phoneNumberPrompt');

const DISPLAY_PROFILE = 'displayProfile';
const PROFILE_INFO = 'getProfileInfo';

class ProfileInfo extends ComponentDialog {
    constructor(dialogId, userProfile) {
        super(dialogId); 
        this.userProfile = userProfile;
        
        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog(PROFILE_INFO, [
            this.promptForName.bind(this),
            this.promptForEmail.bind(this),
            this.promptForNumber.bind(this),
            this.completeProfile.bind(this)
        ]));

        // Defining the prompt used in this conversation flow
        
        this.addDialog(new TextPrompt('textPrompt'));
        this.addDialog(new EmailPrompt('emailPrompt'));
        this.addDialog(new PhoneNumberPrompt('phoneNumberPrompt'));
        
    }

    async promptForName(step) {
        
       return await step.prompt('textPrompt', `Hello I am Roimatic, hope you are having a lovely day. What should I call you?`);
      
    }

    async promptForEmail(step) {
        step.values.name = step.result;
        await step.context.sendActivity(`Hello ${step.values.name}!`);
        await step.context.sendActivity('I would love to help you get more enquiries for your business with more Leads or more Calls to you or your team! But before that let please help me know more about you and your business');
        return await step.prompt('emailPrompt','What is your email-id?');
    }

    async promptForNumber(step) {
        step.values.email = step.result;
        return await step.prompt('phoneNumberPrompt','How may I contact you?');
    }

    
    async completeProfile(step){
        const user = {
            'name':step.values.name,
            'email':step.values.email,
            'phoneNumber':step.result
        }
      await this.userProfile.set(step.context, user);
       
        return await step.endDialog();
    }

}

module.exports.ProfileInfoDialog = ProfileInfo;