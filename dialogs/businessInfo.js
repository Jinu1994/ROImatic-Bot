const {ActivityTypes} = require('botbuilder');
const {ComponentDialog, WaterfallDialog,TextPrompt,ChoicePrompt,ConfirmPrompt,ListStyle} = require('botbuilder-dialogs');

const {CampaignInfoDialog} = require('./campaignInfo');
const BUSINESS_INFO = 'getBusiness_info';
const CAMPAIGN_INFO = 'campaignInfo';

const businessSizeOptions = [
    {
        "value": "Micro (1-10)",
        "synonyms": ["micro"]
    },
    {
            "value": "Small (11-49)",
            "synonyms": ["small"]
    },
    {
            "value": "Medium (50-249)",
            "synonyms": ["medium"]
    }, 
    {
            "value": "Large (250+)",
            "synonyms": ["large"]
    }];

    const servicesProvided = [
        {
            "value": "Dry Servicing",
             "id":1
        },
        {
                "value": "Wet Servicing",
                "id":2
        },
        {
                "value": "Installation",
                "id":3
        },
        {
                "value": "UnInstallation",
                "id":4
        },
        {
                "value": "Gas Top Up",
                "id":5,
        }, 
        {
                "value": "Gas Refill",
                "id":6
        }, 
        {
                "value": "Repair",
                "id":7,
        }];
    

class BusinessInfo extends ComponentDialog {

    constructor(dialogId,userProfile){
        super(dialogId); 
        this.userProfile = userProfile;
        
        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog(BUSINESS_INFO, [
            this.namePrompt.bind(this),
            this.locationPrompt.bind(this),
            this.sizePrompt.bind(this),
            this.websiteConfirmationPrompt.bind(this),
            this.websitePrompt.bind(this),
            this.servicesPrompt.bind(this),
            this.setBusinessInfo.bind(this),
            this.setCampaignInfo.bind(this)
        ]));


        
        this.addDialog(new CampaignInfoDialog(CAMPAIGN_INFO,this.userProfile));
        // Defining the prompt used in this conversation flow
        var confirmPrompt = new ConfirmPrompt('confirmPrompt');
        var choicePrompt = new ChoicePrompt('choicePrompt');
        confirmPrompt.style = choicePrompt.style = ListStyle.suggestedAction;
        this.addDialog(new TextPrompt('textPrompt'));
        this.addDialog(confirmPrompt);
        this.addDialog(choicePrompt);
        
    }

    async namePrompt(step){

        return await step.prompt('textPrompt','What is the name of your business?');
    }
    async locationPrompt(step){
        step.values.name = step.result;
        return await step.prompt('textPrompt','What is the location of your business?');
    
    }
    async sizePrompt(step){
        step.values.location = step.result;
        return await step.prompt('choicePrompt','What is the size of your business?',businessSizeOptions);
    }
    async websiteConfirmationPrompt(step){
        step.values.size = step.result.value;
        return await step.prompt('confirmPrompt','Does your business have a website?');
    }
    async websitePrompt(step){
        
        var confirmation = step.result;
        if(confirmation){
            return await step.prompt('textPrompt','What is your website url?');
        }
        else {
            return await step.next('');
        }
    }

    async servicesPrompt(step){
        step.values.website = step.result;
        return await step.prompt('textPrompt',`What are the servicesProvided
        1.Dry Servicing
        2.Wet Servicing
        3.Installation
        4.Uninstallation 
        5.Gas Top up
        6.Gas refill
        7.Repair 
        (Enter comma separated numbers to choose multiple)`);

    }

    async setBusinessInfo(step){
        var serviceIds = step.result.split(",").map(Number);
       
        var selectedServices = servicesProvided.filter(function(obj){
             return serviceIds.indexOf(obj.id)!==-1;
        });
        var businessInfo = {
            name:step.values.name,
            location:step.values.location,
            size:step.values.size,
            website:step.values.website,
            services:selectedServices.map(obj=>obj.value).join(",")

        }

        var user = await this.userProfile.get(step.context,{});
        user.business = businessInfo;
        await this.userProfile.set(step.context,user);
        
        return await step.beginDialog(CAMPAIGN_INFO);
    }
    
async setCampaignInfo(step){
    return await step.endDialog();
}
 

}

module.exports.BusinessInfoDialog = BusinessInfo;