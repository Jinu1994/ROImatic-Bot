const { ActivityTypes } = require('botbuilder');
const {SignUpDialog} = require('./dialogs/signUp');
const {DialogSet} = require('botbuilder-dialogs');
// Turn counter property
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'userProfile';
const SIGN_UP = 'sign_up'
class ROIMaticBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState,userState) {
        this.conversationState = conversationState;
        this.userState = userState;

       
        this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

        // Create properties used to store values from the user.
        this.userProfile = this.userState.createProperty(USER_PROFILE_PROPERTY);
        // Create a dialog set to include the dialogs used by this bot.
        this.dialogs = new DialogSet(this.dialogState);

        // Create the main user onboarding dialog.
        this.dialogs.add(new SignUpDialog(SIGN_UP, this.userProfile));
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        const dc = await this.dialogs.createContext(turnContext);
        
        if (turnContext.activity.type === ActivityTypes.Message) {
                await dc.continueDialog();
                
                if(!turnContext.responded){
                    await dc.beginDialog(SIGN_UP).catch(error=>{
                        console.log(error);
                    });
                }
    
        } else if (
            turnContext.activity.type===ActivityTypes.Event
        ) {
            
              await  dc.beginDialog(SIGN_UP);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
        await this.userState.saveChanges(turnContext);
    }
}

module.exports.ROIMaticBot = ROIMaticBot;