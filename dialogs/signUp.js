const {ComponentDialog,TextPrompt,ChoicePrompt,WaterfallDialog, ConfirmPrompt,ListStyle} = require('botbuilder-dialogs');
const {ProfileInfoDialog} = require('./profileInfo');
const {BusinessInfoDialog} = require('./businessInfo');

const PROFILE_INFO = 'profileInfo';
const CONFIRM_PROMPT = 'confirm_prompt';
const SIGN_UP = 'sign_up_info';
const BUSINESS_INFO = 'businessInfo';


class SignUp extends ComponentDialog{
    constructor(dialogId,userInfo){
        super(dialogId);
        this.userProfile = userInfo;
        this.addDialog(new WaterfallDialog(SIGN_UP,[
            this.userProfilePrompt.bind(this),
            this.confirmBusinessInfoPrompt.bind(this),
            this.businessInfoPrompt.bind(this),
            this.displayAllInfo.bind(this)
        ]));
        this.addDialog(new ProfileInfoDialog(PROFILE_INFO,this.userProfile));
        this.addDialog(new BusinessInfoDialog(BUSINESS_INFO,this.userProfile));
        var confirmPrompt=new ConfirmPrompt(CONFIRM_PROMPT);
        confirmPrompt.style = ListStyle.suggestedAction;
        this.addDialog(new TextPrompt('textPrompt'));
        this.addDialog(confirmPrompt);
    }
    async userProfilePrompt(step) {
        var user= await this.userProfile.get(step.context,{});
        if(!user.name)
        {
          return await step.beginDialog(PROFILE_INFO);
        }
        await step.context.sendActivity(`Hi ${user.name}!`);
        return await step.next();
    }
    async confirmBusinessInfoPrompt(step){
       return await step.prompt(CONFIRM_PROMPT,'Would you like to add your business?');
    }
    async businessInfoPrompt(step){
        var confirmation = step.result;
        if(confirmation){
          return  await step.beginDialog(BUSINESS_INFO);
        }
        return await step.next();
    }
    

    async displayAllInfo(step){
    var user = await this.userProfile.get(step.context,{});
        const userInfo = `Here is your Profile info:
        Name: ${user.name}
        Email: ${user.email}
        Phone Number: ${user.phoneNumber}`;
        await step.context.sendActivity(userInfo);

    if(user.business){
        await step.context.sendActivity( `Here is your business info:
        Name: ${user.business.name}
        Location: ${user.business.location}
        Size: ${user.business.size}
        Website: ${user.business.website}
        Services: ${user.business.services}`);

        await step.context.sendActivity(`Here is your campaign info:
        Name: ${user.business.name}_${user.business.campaign.objective}
        Objective: ${user.business.campaign.objective}
        Budget: ${user.business.campaign.budget}
        duration: ${user.business.campaign.duration}`);
    }

        return await step.endDialog();
    }
}

module.exports.SignUpDialog = SignUp;