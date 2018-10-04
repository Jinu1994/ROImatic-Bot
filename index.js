const path = require('path');
const restify = require('restify');
const { UserState } = require('botbuilder');
const { ROIMaticBot } = require('./bot');

// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');


// Import required bot configuration.
const { BotConfiguration } = require('botframework-config');

const storage = new MemoryStorage();
const conversationState = new ConversationState(storage);
const userState = new UserState(storage);


// Create the main dialog.
const bot = new ROIMaticBot(conversationState,userState);


let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({ 
    appId: "82cefcba-4421-4056-9b19-1293141e4cec",
    appPassword: "bwluwtgQKM085{:;WKPS41(" 
});

server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res,async (context) => {
      await bot.onTurn(context);
        
    }).catch(error=>{
        console.log(error);
    });
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
    // // Clear out state
    conversationState.clear(context);
};