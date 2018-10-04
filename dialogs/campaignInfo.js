const {ActivityTypes} = require('botbuilder');
const {ComponentDialog, WaterfallDialog, TextPrompt,ChoicePrompt,NumberPrompt,ListStyle} = require('botbuilder-dialogs')
var moment = require('moment');
const CAMPAIGN_INFO = 'getCampaign_info';
const campaignObjectives = [{
    "value":'1',
    "action":{title:"More calls to you"},
    "synonyms":["more calls","calls"]
},{
    "value":'2',
    "action":{title:"More leads/form fills"},
    "synonyms":["leads","forms"]
}]
    

class CampaignInfo extends ComponentDialog{

    constructor(dialogId,userProfile){
        super(dialogId); 
        this.userProfile = userProfile;
        
        // Defining the conversation flow using a waterfall model
        this.addDialog(new WaterfallDialog(CAMPAIGN_INFO, [
            this.objectivePrompt.bind(this),
            this.durationPrompt.bind(this),
            this.budgetPrompt.bind(this),
            this.setCampaignInfo.bind(this)
        ]));
        
        
        // Defining the prompt used in this conversation flow
        var choicePrompt = new ChoicePrompt('choicePrompt');
        choicePrompt.style = ListStyle.suggestedAction;
        this.addDialog(new TextPrompt('textPrompt'));
        this.addDialog(new NumberPrompt('numberPrompt'));
        this.addDialog(choicePrompt);
        
    }

    async objectivePrompt(step){
        await step.context.sendActivity('I am sure you and your team are really working hard to keep the business in shape, lets now get more customers to it');
        return await step.prompt('choicePrompt','What would you like to have ? ',campaignObjectives);
    }

    async durationPrompt(step){
            var objectiveId = step.result.value;
            var objectiveName = campaignObjectives.find(objective=>objective.value===objectiveId).action.title;
            step.values.objective = objectiveName;

            var user = await this.userProfile.get(step.context,{});
            var campaignName = user.business.name+"_"+objectiveName;
            await step.context.sendActivity(this.getNewProperty("Campaign Name",campaignName));
            await step.context.sendActivity(this.getNewProperty("Campaign Status","Paused"));
            await step.context.sendActivity(this.getNewProperty("Campaign Objective",objectiveName));

        return await step.prompt('textPrompt',`How long would you like to have '${objectiveName}'?`);
    }
    async budgetPrompt(step){
        step.values.duration = step.result;
        var date=moment();
        var startDate = date.add(1,'day');
        var endDate = startDate.clone().add(parseInt(step.result),'day');
        var dateRange = startDate.format("MMM DD")+" - "+endDate.format("MMM DD")+" ("+step.result+" days)";
        await step.context.sendActivity(this.getNewProperty("Campaign Dates",dateRange));
        return await step.prompt('numberPrompt','how much would you like to spend per day?');
    
    }
    async setCampaignInfo(step){
        var budget = step.result;
        var campaignInfo = {
            name:step.values.objective+'_'+step.values.duration,
            objective:step.values.objective,
            duration:step.values.duration,
            budget:budget

        }
        
        var user = await this.userProfile.get(step.context,{});
        await step.context.sendActivity(this.getNewProperty("Spend per day",budget));
        await step.context.sendActivity(this.getNewProperty("Total Campaign Spend",budget*parseInt(step.values.duration)));
        await step.context.sendActivity(this.getNewProperty("Receive calls on",user.phoneNumber));
        await step.context.sendActivity(this.getNewProperty("Business Name",user.business.name));

        user.business.campaign = campaignInfo;
        await this.userProfile.set(step.context,user);
        return await step.endDialog();
    }
    getNewProperty(key,value) {
        return { 
            type:ActivityTypes.Event, 
            text:"summary-data",
            value:{
                key:key,
                value:value
            }
        };
    }
}

module.exports.CampaignInfoDialog = CampaignInfo;