'use strict';
const builder = require('botbuilder');


//for cosmos db

const CosmosClient = require('@azure/cosmos').CosmosClient;
const config = require('./config');
//const url = require('url');
const endpoint = config.endpoint;
const masterKey = config.primaryKey;
const client = new CosmosClient({ endpoint: endpoint, auth: { masterKey: masterKey } });


var HttpStatusCodes = { NOTFOUND: 404 };
var databaseId = config.database.id;
var containerId = config.container.id;

var BotID;
var BotName;
var UserId;
var UserName;
var ConversationId;
var UserQuery;
var UserResponse;



//qna maker
//var QnAClient = require('../lib/client');
var QnAClient = require('./lib/client');

var qnaClient = new QnAClient({
    knowledgeBaseId: process.env.KB_ID,
    subscriptionKey: process.env.QNA_KEY,
    scoreThreshold: 0.2 // OPTIONAL: Default value is 0.2
});



//for cosmos db
var azure = require('botbuilder-azure');

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var Request = require("request");

//common variable
var i,intent="",entity,gstentity,panentity;
var auth;


//variable declaration for session
var Gloabalentity1="Gloabalentity1";
var Gloabalentity="Gloabalentity";
var GloabalIntent="GloabalIntent";
var GlobalRequestNo="GlobalRequestNo";
var GlobalVendorName="GlobalVendorName";
var GlobalMaterialCode="GlobalMaterialCode";
var GlobalMaterialName="GlobalMaterialName";
var GlobalServiceCode="GlobalServiceCode";
var GlobalServiceName="GlobalServiceName";
var GlobalADID="GlobalADID";
var GlobalPanGSTCode="GlobalPanGSTCode";
var userquestion="userquestion";
var conversationid="conversationid";
//var GloabalUserId="GloabalUserId";
//var GlobalToken="GlobalToken";

//var inMemoryStorage = new builder.MemoryBotStorage();

//for cosmos db


 var documentDbOptions = {
     host: 'https://gplflologiccosmosdbuat.documents.azure.com:443/', 
     masterKey: 'dmlyKuqhXlLQto7bY8tsZLJpM11Iq3x9FSKfllqZisN55YMrg18FfBJ6jh2u7JXWxAsnm44Um9iTijn4Geq77A==', 
     database: 'botdocs',   
     collection: 'botdata'
 };

var docDbClient = new azure.DocumentDbClient(documentDbOptions);

var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);


//universal bot connection
const  bot = module.exports =  new builder.UniversalBot(connector, function (session, args) {  
     var reply = createEvent("changeBackground", session.message.text, session.message.address);
        session.endDialog(reply);

 }).set('storage', cosmosStorage); 

 bot.set('persistUserData', true);
 bot.set('persistConversationData', true);

//LUIS Connection
const LuisModelUrl1 = process.env.LuisModelUrl || process.env.baseUrl; //'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/78c89f64-d5c0-4def-91fb-8e453e5c3178?subscription-key=1cf14806be4141c683bceffbec7d01b3&verbose=true';

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl1);
bot.recognizer(recognizer);


bot.on("event",function(event) {
    //console.log("message",event);
    var msg = new builder.Message().address(event.address);
    var address=event.address;
    msg.data.textLocale = "en-us";
    if (event.name === "btnRefresh") {
        msg.data.text = "I see that you clicked a button.";      
    }
    bot.beginDialog(address,'endConversationDialog');   
})



//greeting dialog
bot.dialog('GreetingDialog',[
    function (session, args, next) {
       
       var name=session.message.user.name;
       var id=session.message.user.id;
       var token1 = session.message.user.token;

       auth = "Basic " + new Buffer(id + ":" + token1).toString("base64");  
     
        session.conversationData[GlobalADID]=id;        
        //session.conversationData[GloabalIntent] = intent.intent;       
        session.send('Hello  %s! Welcome to Vendor Bot.',name);
        
        
        //data for CosmosDbStorage
        var jsonData = JSON.stringify(session.message);
        var jsonParse = JSON.parse(jsonData);
      
        session.conversationData.botID=jsonParse.address.bot.id;
        session.conversationData.botName=jsonParse.address.bot.name;
        session.conversationData.userName=name;
        session.conversationData.userID=id;
        session.conversationData.conversationID=jsonParse.address.conversation.id;
       
        
        BotID=session.conversationData.botID;
        BotName=jsonParse.address.bot.name;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
      
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,"Conversation Start...");      
       

   var card = {  
       
        "contentType": "application/vnd.microsoft.card.adaptive",
        "content": {
        "$schema":"http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
            "body": [
            {
                "type": "TextBlock",
                "text": " **I can help you get details about vendors, materials, services \n and even your requests!** "+
                "\n You may ask me questions like:" 
            },
            {
                "type": "TextBlock",
                "text": " _**“Vendor details for Kshetra”**_ "+
                "\r _**“My pending request”**_ " +
                "\n _**“My requests”**_ " +              
                "\n _**“Service details”**_ " +
                "\n _**“Service details for 3001655”**_ " +
                "\n _**“Material detail”**_ " +
                "\n _**“Material detail for 200735”**_ " +
                "\n _**“Pan no for kshetra”**_ "+
                "\n _**“Gst no for kshetra”**_ "+
                "\n _**“Extension for kshetra”**_ "+
                "\n _**“All document for kshetra”**_ "              

            },
        ]
    }
    }
        var msg = new builder.Message()
        .addAttachment(card)
        session.send(msg);

        session.send('How may I help you?');  
        
        // session.send("%s",username1)    
        session.endDialog();
    }
]).triggerAction({
    matches: 'Vendor.Greeting'
})


//end Conversation Dialog
bot.dialog('endConversationDialog',[
    function (session, args, next) {

       
          //for cosmos db store data
        BotID=session.conversationData.botID;
        BotName= session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,"Conversation End..");
      //end cosmos db 

        session.conversationData = {};

        var name=session.message.user.name;
        var id=session.message.user.id;
        var token1 = session.message.user.token;
        auth = "Basic " + new Buffer(id + ":" + token1).toString("base64");       
        session.conversationData[GlobalADID]=id;           
        session.send("You have stopped current conversation! that is okay, just ping me when you are ready and we can chat again.")              
        session.endDialog();
    }]);


//no intent and entity Dialog
bot.dialog('NoneDialog',[
    function (session, args, next) {

       intent = args.intent;            
       session.conversationData[GloabalIntent] = intent.intent;
         //for cosmos db store data
       BotID=session.conversationData.botID;
       BotName= session.conversationData.botName;
       UserName= session.conversationData.userName;
       UserId=session.conversationData.userID;
       ConversationId=session.conversationData.conversationID;
                
     // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
       createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
     //end cosmos db 
        session.send('Please narrow your search.');        
        session.endDialog();
    }
]).triggerAction({
    matches: 'None'
})

var salesData={};
var str1 = "";
var str2 = "";
var str3="";
//Vendor all details Dialog
bot.dialog('AllDetailsDialog',[
    function (session, args, next) {

      
       //name not present in query
        if(args.Entity==true)
        {                
        }
        else
        {           
             intent = args.intent;            
             session.conversationData[GloabalIntent] = intent.intent;
             entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');

             if(entity)
             {
                session.conversationData[GlobalVendorName] = entity.entity;   
                session.conversationData[Gloabalentity]="Name";
             }
             else
             {
                session.conversationData[Gloabalentity]="";
                session.conversationData[GlobalVendorName]="";
                session.conversationData[GlobalPanGSTCode]="";
             }
        } 
        
        BotID=session.conversationData.botID;
        BotName= session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
      
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
      


        if(session.conversationData[Gloabalentity])
        {
            panentity = builder.EntityRecognizer.findEntity(intent.entities,'pan-code');
            gstentity = builder.EntityRecognizer.findEntity(intent.entities,'gstn_code');
            if(panentity)
            {
                session.conversationData[GlobalPanGSTCode]=panentity.entity;
        
            }
            if(gstentity)
            {
                session.conversationData[GlobalPanGSTCode]=gstentity.entity;
            }

            if(session.conversationData[GlobalPanGSTCode])
            {
                var abc;
                var dict = [];
                process.env.global_vendordetailsfor_gstpan  = process.env.ApiForVendorDetailsForPanandGst + session.conversationData[GlobalPanGSTCode];
                Request.get({ url :  process.env.global_vendordetailsfor_gstpan ,headers : { "Authorization" : auth}}, (error, response, body) => {
                    if(error) {
                    session.send("Geting error");
                    }
                    else{
                        
                        abc=JSON.parse(body);
                        //for single record
                        if(abc.length >= 1)
                        {
                        session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;                     
                        var cards = getCardsAttachmentsForVendorName(session,abc);
                        var msg = new builder.Message(session)
                        .addAttachment(cards);
                        session.send(msg);   
                        session.conversationData[GlobalPanGSTCode]="";          
                        session.endDialog();
                        }
                        else{
                            session.send("data not found");
                            session.conversationData[GlobalPanGSTCode]="";
                        }
                    }
                });
            }
            else{
                var abc;
                var dict = [];

               // var dict = {};
                               

              var choices = {};
                process.env.global_vendor_name_apiurl  = process.env.ApiURLForVendorName + session.conversationData[GlobalVendorName];
                Request.get({ url :  process.env.global_vendor_name_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
                    if(error) {
                    session.send("Geting error");
                    }
                    else{
                        
                        abc=JSON.parse(body);
                        //for single record
                        if(abc.length == 1)
                        {
                        session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;                     
                        var cards=getCardsAttachmentsForVendorName(session,abc);
                        var msg = new builder.Message(session)
                        .addAttachment(cards);
                        session.send(msg);             
                        session.endDialog();
                        }
                        //for more than one record found
                        else if(abc.length > 1) 
                        {  
                           
                            // str1 = abc[0].VENDOR_NAME;
                            // str2 = abc[1].VENDOR_NAME;
                            // str3 = abc[2].VENDOR_NAME;

                            // var employees = {
                            //     accounting: []
                            // };
                            
                            // for(var i in abc) {    
                            
                            //     var item = abc[i];   
                            
                            //     str1=item.VENDOR_NAME;
                            //     employees.accounting.push({ 
                            //         str1  : item.REQUEST_NO                                    
                            //     });
                            // }
                            


                            for (i = 0; i < abc.length; i++) 
                            {
                                if(i <= 4)
                                {
                                   dict.push(abc[i].VENDOR_NAME +" ("+ abc[i].REQUEST_NO +")");
                                    
                                    
                                }

                                //choices = dic
                            }
                           //  var test=JSON.stringify(choices);

                            //  var namearray=[];
                            //  namearray.push("vendorname"= abc[0].VENDOR_NAME);

                            //  var employees = {
                            //     namearray: []
                            //     };

                            //     employees.namearra.push({ 
                            //         requestno:abc[0].REQUEST_NO                                    
                            //             });

                           //  salesData.push(str1:{ requestno:abc[0].REQUEST_NO })


                            // session.send("%s",str1.ty);
                            // salesData = {
                            //  "str1": {
                            //         requestno:abc[0].REQUEST_NO                              
                            //     },
                            //     str2: {
                            //         requestno:abc[1].REQUEST_NO                              
                            //     },
                            //     str3: {
                            //         requestno:abc[2].REQUEST_NO                              
                            //     },
                            // };
                            
                           // session.send("%s",JSON.stringify(dict));
                            if(abc.length > 4)
                            {
                                session.send("More than 5 rows returned. Please narrow your search and resubmit your query.");
                                builder.Prompts.choice(session, "Select Name",dict,{listStyle:3});
                            }
                            else
                            {
                                    builder.Prompts.choice(session, "Select Name: ",dict,{listStyle:3});
                            }
                        } 
                        //no record found  
                        else
                        {
                                session.send("No queried data found for : %s",session.conversationData[GlobalVendorName]);
                        }            
                    }                            
                });   
            }   
        }
        else
        {
           //request no mantain in session
           if(session.conversationData[GlobalRequestNo]) 
           {
            var abc;
            process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + session.conversationData[GlobalRequestNo];
           
        
           
            Request.get({ url : process.env.global_reqno_apiurl ,headers : { "Authorization" : auth}},(error, response, body) => {
                if(error) {
                   session.send("Geting error");
                }
                else{
                
                 abc=JSON.parse(body);                                   
                 session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;   
                 var cards=getCardsAttachmentsForVendorName(session,abc);
                 var msg = new builder.Message(session)
                 .addAttachment(cards);
                 session.send(msg);             
                 session.endDialog();
                }
              });
              
           }
           //request no not maintain in session
           else 
           {
            //session.conversationData[GloabalIntent]="Vendor.AllDetails";               
            //session.beginDialog('askForVendorName');  
            var msgfornodata = new builder.Message();    
            msgfornodata.text("It looks like you are looking for “Vendor details” but you didn't mention _vendor name, gst or pan_.\n You may ask things like “vendor details for _ABC Ltd_” or “vendor details for _ABCPX0000G_” ");        
            session.send(msgfornodata);
            session.endDialog(); 
           }
        
        } 
    },
    //Get Data for selected name
      function (session, results) { 
          
      var str=results.response.entity;
          //session.send("%s",JSON.stringify(results));    
          
        //   var region = salesData[results.response.entity];
        //   session.send("%s",region.requestno); 


            if(results.response.entity)
            {
            var arr = new Array();
           // session.send("%s",);


            var arr = str.match(/\(([^)]+)\)/)[1];         
            var abc;
            process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + arr;     

            Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
                if(error) {
                   session.send("Geting error");
                }
                else{
                        abc=JSON.parse(body); 
                        session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;  
                        var cards=getCardsAttachmentsForVendorName(session,abc);
                        var msg = new builder.Message(session)
                        .addAttachment(cards);
                        session.send(msg);             
                        //end adaptive


                       // session.send("Vendor Name : %s \n Vendor Code : %s \n Request No : %s \n Status : %s \n Approved By : %s \n PAN No : %s \n GST No : %s",bodydata[0].VENDOR_NAME,bodydata[0].VENDOR_CODE,bodydata[0].REQUEST_NO,bodydata[0].STATUS,bodydata[0].APPROVED_BY,bodydata[0].PAN_NO,bodydata[0].GST_NO +'<br>' );
                        session.endDialogWithResult(results);
                    }
            });   
            session.endDialog();
        }
        else
        {     
        session.endDialog();
        }
    }
]).triggerAction({
    matches: 'Vendor.AllDetails'
})

//Vendor Pan and Gst No
bot.dialog('GSTandPAN_NoDialog',[
    function (session, args, next) {


        BotID=session.conversationData.botID;
        BotName=session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
      
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);

        if(args.Entity==true)
        {                
        }
        else
        {           
             intent = args.intent;            
             session.conversationData[GloabalIntent] = intent.intent;
             entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');
             if(builder.EntityRecognizer.findEntity(intent.entities,'GstNo'))
                {
                    session.conversationData[Gloabalentity1] ="GstNo";
                }
                else if(builder.EntityRecognizer.findEntity(intent.entities,'PanNo'))
                {
                    session.conversationData[Gloabalentity1] ="PanNo";
                }
                // else if(builder.EntityRecognizer.findEntity(intent.entities,'CST_Certificate'))
                // {
                //     session.conversationData[Gloabalentity1] ="CST_Certificate";
                // }
                else if(builder.EntityRecognizer.findEntity(intent.entities,'Cancelled_Cheque'))
                {
                    session.conversationData[Gloabalentity1] ="Cancelled_Cheque";
                }
                else if(builder.EntityRecognizer.findEntity(intent.entities,'Channel_Partner_Agreement'))
                {
                    session.conversationData[Gloabalentity1] ="Channel_Partner_Agreement";
                }              
                else if(builder.EntityRecognizer.findEntity(intent.entities,'EM_Certificate'))
                {
                    session.conversationData[Gloabalentity1] ="EM_Certificate";
                }               
                else if(builder.EntityRecognizer.findEntity(intent.entities,'PF_Certificate'))
                {
                    session.conversationData[Gloabalentity1] ="PF_Certificate";
                }
                else if(builder.EntityRecognizer.findEntity(intent.entities,'Proprietorship_Declaration'))
                {
                    session.conversationData[Gloabalentity1] ="Proprietorship_Declaration";
                }
                else if(builder.EntityRecognizer.findEntity(intent.entities,'RERA_Certificate'))
                {
                    session.conversationData[Gloabalentity1] ="RERA_Certificate";
                }
                else
                {
                    session.conversationData[Gloabalentity1] ="none";
                }

             if(entity)
             {
                session.conversationData[GlobalVendorName] = entity.entity;   
                session.conversationData[Gloabalentity]="Name";
             }
             else
             {
                session.conversationData[Gloabalentity]="";
                session.conversationData[GlobalVendorName]="";
             }
        }     
       
    if(session.conversationData[Gloabalentity])
    {
        //Get Data From Web Api  
        var VendorName = session.conversationData[GlobalVendorName];
        var abc;
        var dict = [];
        var attachdoc=[];
        process.env.global_vendor_name_apiurl  = process.env.ApiURLForVendorName + session.conversationData[GlobalVendorName];
        Request.get({ url : process.env.global_vendor_name_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
               session.send("Geting error");
            }
            else{
                abc=JSON.parse(body);
               
                if(abc.length>0)
                {
                        if(abc.length == 1)
                        {
                            session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;  
                            var data1=session.conversationData[GlobalRequestNo];
                            var enquryno=data1.replace('/', '_');
                            var finaleqno=enquryno.replace('/','_');                           
                           
                            if(session.conversationData[Gloabalentity1]=="GstNo")
                            {
                                
                                session.send('Vendor Name : %s \n GST No : %s ',abc[0].VENDOR_NAME,abc[0].GST_NO +'<br>' );
                                //session.endDialog();  
                            }
                            else(session.conversationData[Gloabalentity1]=="PanNo")
                            {                                
                                session.send('Vendor Name : %s \n Pan No : %s ',abc[0].VENDOR_NAME,abc[0].PAN_NO +'<br>' );
                               // session.endDialog(); 
                            }
                           
                             //get gst or pan attach document 
                            
                             attachdoc = getattachdocument(session,abc);                               
                             var exte = getextention(attachdoc);
                             if(attachdoc)
                             {
                             var msg = session.message;                               
                              var attachment = msg.attachments[0];                                 
                                 session.send({text: "Attach Document:",
                                     attachments: [{contentType: "application/" + exte,contentUrl: attachdoc,name: "click here to open file"
                                         }
                                     ]
                                 });
                                 session.endDialog();
                             }
                             else{
                                 session.send("Document not attach");
                                 session.endDialog();
                             }
                        }
                        else
                        {
                            for (i = 0; i < abc.length; i++) 
                            {
                                if(i <= 4)
                                {
                                  // dict.push("Name:" + abc[i].VENDOR_NAME + " Request No:"+ abc[i].REQUEST_NO)
                                  dict.push(abc[i].VENDOR_NAME +" ("+ abc[i].REQUEST_NO +")")
                                }
                            }
                            if(abc.length > 4)
                            {
                                   session.send("More than 5 rows returned. Please narrow your search and resubmit your query.");
                                    builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                            }
                            else{
                                builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                            }
                        }
                } 
                else
                {
                    session.send("Data not available for vendor : %s",session.conversationData[GlobalVendorName]);
                    session.endDialog();
                }
            }

                
                                       
        });      
    }
    else{
        if(session.conversationData[GlobalRequestNo])
        {
         var bodydata;
         process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + session.conversationData[GlobalRequestNo];

       
         Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
             if(error) {
                session.send("Geting error");
             }
             else{
                 bodydata=JSON.parse(body);

                 if(bodydata.length>0)
                 {
                 session.conversationData[GlobalRequestNo] = bodydata[0].REQUEST_NO;
                 if(session.conversationData[Gloabalentity1]=="GstNo")   
                 {
                    session.send('Vendor Name : %s \n GST No : %s ',bodydata[0].VENDOR_NAME,bodydata[0].GST_NO +'<br>' );
                    
                 } 
                 else if(session.conversationData[Gloabalentity1]=="PanNo") 
                 {                   
                    session.send('Vendor Name : %s \n PAN No : %s ',bodydata[0].VENDOR_NAME,bodydata[0].PAN_NO +'<br>' );
                   
                 }

                 //get gst or pan attach document 
                            
                 attachdoc = getattachdocument(session,bodydata);                               
                 var exte = getextention(attachdoc);
                 if(attachdoc)
                 {
                 var msg = session.message;                               
                  var attachment = msg.attachments[0];                                 
                     session.send({text: "Attach Document:",
                         attachments: [{contentType: "application/" + exte,contentUrl: attachdoc,name: "click here to open file"
                             }
                         ]
                     });
                     session.endDialog(); 
                 }
                 else{
                     session.send("Document not attach");
                     session.endDialog(); 
                 }


                }
                else{
                    session.send("No queried data available for: %s",session.conversationData[GlobalVendorName]);
                    session.endDialog();
                }
               
             }                            
         });
        }
        else 
        {
            //session.conversationData[GloabalIntent]="Vendor.Number";               
           // session.beginDialog('askForVendorName'); 
           var msgfornodata = new builder.Message();    
            msgfornodata.text("It looks like you are looking for “pan no” or “gst no” but you didn't mention _vendor name.\n You may ask things like “pan no for _ABC Ltd_” or “gst no for _ABC Ltd_” ");        
            session.send(msgfornodata);
          // session.send("It looks like you are looking for vendor details but you didn't mention vendor name, gst or pan. You may ask things like vendor details for ABC Ltd or vendor details for ABCPX0000G");           
           session.endDialog();  
        }      
    }
},   
    function (session, results) {
                var str = results.response.entity;
                if(results.response.entity)
                {
             
                var arr = str.match(/\(([^)]+)\)/)[1];   
                var bodydata;
                var attachdoc;
                process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + arr;
               
                Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
                    if(error) {
                    session.send("Geting error");
                    }
                    else{
                        bodydata=JSON.parse(body);
                        if(bodydata.length>0)
                        {
                        session.conversationData[GlobalRequestNo] = bodydata[0].REQUEST_NO;
                                if(session.conversationData[Gloabalentity1]=="GstNo")
                                {                                   
                                    session.send('Vendor Name : %s \n GST No : %s ',bodydata[0].VENDOR_NAME,bodydata[0].GST_NO);
                                    //session.endDialogWithResult(results);
                                }
                                else if(session.conversationData[Gloabalentity1]=="PanNo")
                                {                         
                                    session.send('Vendor Name : %s \n PAN No : %s ',bodydata[0].VENDOR_NAME,bodydata[0].PAN_NO);
                                   // session.endDialogWithResult(results);

                                }
                                // else
                                // {
                                //     session.send('Please narrow your search');
                                //     //session.endDialogWithResult(results);
                                // }
                                //get gst or pan attach document 
                            
                            attachdoc = getattachdocument(session,bodydata);                               
                            var exte = getextention(attachdoc);
                            if(attachdoc)
                            {
                            var msg = session.message;                               
                            var attachment = msg.attachments[0];                                 
                                session.send({text: "Attach Document:",
                                    attachments: [{contentType: "application/" + exte,contentUrl: attachdoc,name: "click here to open file"
                                        }
                                    ]
                                });
                                session.endDialogWithResult(results); 
                            }
                            else{
                                session.send("Document not attach");
                                session.endDialog(); 
                            }

                        }    
                        else
                        {
                            session.send("No queried data available for : %s",session.conversationData[GlobalVendorName]);
                            session.endDialog();
                        }
                    }                        
                });

                session.endDialog();//DOES NOT WORK
                }
                else
                {
                    session.endDialog();
                }
            }
]).triggerAction({
    matches: 'Vendor.Number'
})

//vendor extention dialog
bot.dialog('ExtensionDialog',[
    function (session, args, next) {

       
       if(args.Entity==true)
       {                
       }
       else
       {           
            intent = args.intent;            
            session.conversationData[GloabalIntent] = intent.intent;
            entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');

            if(entity)
            {
               session.conversationData[GlobalVendorName] = entity.entity;   
               session.conversationData[Gloabalentity]="Name";
            }
            else
            {
               session.conversationData[Gloabalentity]="";
               session.conversationData[GlobalVendorName]="";
            }
       }  

       BotID=session.conversationData.botID;
       BotName= session.conversationData.botName;
       UserName= session.conversationData.userName;
       UserId=session.conversationData.userID;
       ConversationId=session.conversationData.conversationID;
                
     // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
     
       createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);


       //Get Data From Web Api
        if(session.conversationData[Gloabalentity])
        {
            //var Request = require("request");
           // session.conversationData[GlobalVendorName] = entity.entity;
            
            var abc;
            var dict = [];
            process.env.global_vendor_name_apiurl  = process.env.ApiURLForVendorName + session.conversationData[GlobalVendorName];
            Request.get({ url : process.env.global_vendor_name_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
               session.send("Data not found");
            }
            else{
                abc=JSON.parse(body);

                if(abc.length>0)
                {
                var i,j; 
                if(abc.length == 1)
                {
                    session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;  
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                   
                    var attachments = [];

                        var attachments = getCardsAttachmentsForExtensionList(session,abc);
                        if(attachments.length>0)
                        {
                        msg.attachments(attachments);
                        session.send(msg);
                        session.endDialog(); 
                        }
                        else
                        {
                            
                            session.send("Extensions not available");
                            session.endDialog(); 
                        }
                     
                }
                //for multiple record
                else
                {
                    for (i = 0; i < abc.length; i++) 
                    {
                        if(i <= 4)
                                {
                                    dict.push(abc[i].VENDOR_NAME +" ("+ abc[i].REQUEST_NO +")");
                                }
                        //choices = dic
                    }
                    if(abc.length > 4)
                    {
                             session.send("More than 5 rows returned. Please narrow your search and resubmit your query.");
                            builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                    }
                    else{
                        builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                    }
                }   
            }
            else{
                    session.send("Extensions not available for vendor : %s",session.conversationData[GlobalVendorName]);
                    session.endDialog();
            }                 
        } 
                                       
            });   
        }
        else{
            if(session.conversationData[GlobalRequestNo])
            {
             var abc;
            
                process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + session.conversationData[GlobalRequestNo];
                Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
                 if(error) {
                    session.send("Geting error");
                 }
                 else{
                    abc=JSON.parse(body);
                     session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;   
                     var msg = new builder.Message(session);
                     msg.attachmentLayout(builder.AttachmentLayout.carousel);                   
                     var attachments = [];                                            
                     var attachments = getCardsAttachmentsForExtensionList(session,abc);
                     if(attachments.length>0)
                        {
                            msg.attachments(attachments);
                            session.send(msg);
                            session.endDialog(); 
                        }
                        else
                        {
                            
                            session.send("Extensions not available");
                            session.endDialog(); 
                        }
                 }                            
             });                        
            }
            else 
            {
            //    session.conversationData[GloabalIntent]="Vendor.Extensions";               
            //    session.beginDialog('askForVendorName');  
                var msgfornodata = new builder.Message();    
                msgfornodata.text("It looks like you are looking for “extensions” or “associations” but you didn't mention _vendor name_.\n You may ask things like “extension for _ABC Ltd_” or “association for _ABC Ltd_” ");        
                session.send(msgfornodata);           
                session.endDialog();  
            }
        }   
      
    },function (session, results) {
        var str = results.response.entity;
    if(results.response.entity)
    {
       
        var arr = str.match(/\(([^)]+)\)/)[1];   
        var abc;
        process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + arr;
        Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
            if(error) {
               session.send("Geting error");
            }
            else{
                abc=JSON.parse(body);
                session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO; 
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);                   
                    var attachments = [];                                            
                    var attachments = getCardsAttachmentsForExtensionList(session,abc);
                    if(attachments.length>0)
                    {
                        msg.attachments(attachments);
                        session.send(msg);
                        session.endDialog(); 
                    }
                    else
                    {
                        
                        session.send("Extensions not available");
                        session.endDialog(); 
                    }
            }                            
        }); 
        session.endDialog();
    }
    else
    {
        session.send("Extension Not Found");
        session.endDialog();
    }
   
         //DOES NOT WORK
}
]).triggerAction({
    matches: 'Vendor.Extensions'
})

//vendor all document
bot.dialog('AllDocumentDialog',[
    function (session, args, next) {


       if(args.Entity==true)
       {                
       }
       else
       {           
            intent = args.intent;            
            session.conversationData[GloabalIntent] = intent.intent;
            entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');

            if(entity)
            {
               session.conversationData[GlobalVendorName] = entity.entity;   
               session.conversationData[Gloabalentity]="Name";
            }
            else
            {
               session.conversationData[Gloabalentity]="";
               session.conversationData[GlobalVendorName]="";
            }
       }  


       //for cosmos db store data
       BotID=session.conversationData.botID;
       BotName= session.conversationData.botName;
       UserName= session.conversationData.userName;
       UserId=session.conversationData.userID;
       ConversationId=session.conversationData.conversationID;
                
     // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
       createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
     //end cosmos db 
       
        //Get Data From Web Api
        if(session.conversationData[Gloabalentity])
        {
            //var Request = require("request");
           // session.conversationData[GlobalVendorName] = entity.entity;
            
            var abc;
            var dict = [];
            process.env.global_vendor_name_apiurl  = process.env.ApiURLForVendorName + session.conversationData[GlobalVendorName];
            Request.get({ url : process.env.global_vendor_name_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
               session.send("Data not found");
            }
            else{
                abc=JSON.parse(body);
                var i,j; 
                if(abc.length>0)
                {
                if(abc.length == 1)
                {
                    var message;
                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel);
                session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;

                var data1=session.conversationData[GlobalRequestNo];
                var enquryno=data1.replace('/', '_');
                var finaleqno=enquryno.replace('/','_');

              
                var attachments = [];
                    for(i=0; i<abc[0].DOCUMENT_LIST.length; i++)
                    {
                            // create reply with Carousel AttachmentLayout
                                var filename=abc[0].DOCUMENT_LIST[i].FILE_TYPE;
                                var fileopen=abc[0].DOCUMENT_LIST[i].FILE_NAME;
                                var getfileextimage;
                                //get file extension
                                getfileextimage = getfileextensionimage(fileopen,finaleqno);                

                                var card = new builder.ThumbnailCard(session)
                                .title(filename)
                                .images([builder.CardImage.create(session, getfileextimage)]) //http://118.67.249.4:85/GPL-Portal/AttachDocument/
                                .buttons([
                                    builder.CardAction.openUrl(session, 'https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+fileopen+'&filetag=' , 'Open Attachment')
                                ])
            
                                attachments.push(card);                                    
                    }
                    msg.attachments(attachments);
                    session.send(msg);
                    session.endDialog();
                  
                }
                //for multiple record
                else
                {
                    for (i = 0; i < abc.length; i++) 
                    {
                        if(i <= 4)
                        {
                            dict.push(abc[i].VENDOR_NAME +" ("+ abc[i].REQUEST_NO +")");
                        }
                        //choices = dic
                    }
                        if(abc.length > 4)
                        {
                                session.send("More than 5 rows return please narrow your search.If name not found please narrow your search or resubmit the query");
                                builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                        }
                        else{
                                builder.Prompts.choice(session, "Select Name: ", dict,{listStyle:3});
                        }
                }   
            }  
            else{
                session.send("Documents not available for vendor : %s",session.conversationData[GlobalVendorName]);
                session.endDialog();
            }               
             } 
                                       
            });   
        }
        else{
            if(session.conversationData[GlobalRequestNo])
            {
             var bodydata;
          
             process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + session.conversationData[GlobalRequestNo];
                Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
                 if(error) {
                    session.send("Geting error");
                 }
                 else{
                     bodydata=JSON.parse(body);

                        if(bodydata.length>0)
                        {

                     var message;
                     var msg = new builder.Message(session);
                     msg.attachmentLayout(builder.AttachmentLayout.carousel);
                     session.conversationData[GlobalRequestNo] = bodydata[0].REQUEST_NO;
                     var data1=session.conversationData[GlobalRequestNo];
                     var enquryno=data1.replace('/', '_');
                     var finaleqno=enquryno.replace('/','_');
                     var attachments = [];
                         for(i=0; i<bodydata[0].DOCUMENT_LIST.length; i++)
                         {
                                 // create reply with Carousel AttachmentLayout
                                     var filename=bodydata[0].DOCUMENT_LIST[i].FILE_TYPE;
                                     var fileopen=bodydata[0].DOCUMENT_LIST[i].FILE_NAME;
                                     var getfileextimage;
                                     //get file extension
                                     getfileextimage = getfileextensionimage(fileopen,finaleqno);                
     
                                     var card = new builder.ThumbnailCard(session)
                                     .title(filename)                                    
                                     .images([builder.CardImage.create(session, getfileextimage)])
                                     .buttons([
                                         builder.CardAction.openUrl(session,'https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+fileopen+'&filetag=', 'Open Attachment')
                                     ])
                 
                                     attachments.push(card);                                    
                         }
                         msg.attachments(attachments);
                         session.send(msg);
                         session.endDialog();    
                        }
                        else
                        {
                            session.send("Documents not available for vendor : %s",session.conversationData[GlobalVendorName]);
                            session.endDialog();
                        }                   
                 }                            
             });
            }
            else 
            {
                var msgfornodata = new builder.Message();    
                msgfornodata.text("It looks like you are looking for “All document” or “document” but you didn't mention _vendor name_.\n You may ask things like “All documents for _ABC Ltd_” or “documents for _ABC Ltd_” ");        
                session.send(msgfornodata);   
                // session.send("It looks like you are looking for vendor details but you didn't mention vendor name. You may ask things like All document for ABC Ltd");           
                session.endDialog(); 
            }
        }   
      
    },
    function (session, results) {
        var str = results.response.entity;
        if(results.response.entity)
        {
       
        var arr = str.match(/\(([^)]+)\)/)[1];  
        var bodydata;
       
        process.env.global_reqno_apiurl = process.env.ApiURLForRequestNumber + arr;
        Request.get({ url : process.env.global_reqno_apiurl,headers:{"Authorization" : auth}}, (error, response, body) => {
        if(error) {session.send("Geting error");}
            else{
                bodydata=JSON.parse(body);
                session.conversationData[GlobalRequestNo] = bodydata[0].REQUEST_NO;
                var data1=session.conversationData[GlobalRequestNo];
                var enquryno=data1.replace('/', '_');
                var finaleqno=enquryno.replace('/','_');
              
                if(bodydata.length>0)
                {
              //  var card;
                var message;
                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel);
               
                var attachments = [];
                for(i=0; i<bodydata[0].DOCUMENT_LIST.length; i++)
                {
                     // create reply with Carousel AttachmentLayout
                        var filename=bodydata[0].DOCUMENT_LIST[i].FILE_TYPE;
                        var fileopen=bodydata[0].DOCUMENT_LIST[i].FILE_NAME;
                        var getfileextimage;
                        //get file extension
                        getfileextimage = getfileextensionimage(fileopen,finaleqno);                

                        var card = new builder.ThumbnailCard(session)
                        .title(filename)
                        .images([builder.CardImage.create(session, getfileextimage)])
                        .buttons([
                            builder.CardAction.openUrl(session, 'https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+fileopen+'&filetag=' , 'Open Attachment')
                        ])
    
                         attachments.push(card);                                    
               }
               msg.attachments(attachments);
               session.send(msg);
               session.endDialogWithResult(results);

            }
            else{
                session.send("Documents not available for vendor : %s",session.conversationData[GlobalVendorName]);
                session.endDialog();
            }
           }       
           session.endDialog();                     
        }); 
        session.endDialog();       
    }
    else{
        session.endDialog();
    }
         //DOES NOT WORK
}
]).triggerAction({
    matches: 'Vendor.AllDocument'
})

//Material Dialog
bot.dialog('MaterialDialog',[
    function (session, args, next) {

       
        intent = args.intent;
        session.conversationData[GloabalIntent] = intent.intent;    
       
        //for cosmos db store data
        BotID=session.conversationData.botID;
        BotName= session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
      //end cosmos db 

  //Get Data From Web Api
    if(builder.EntityRecognizer.findEntity(intent.entities,'Code'))
    {      
        entity = builder.EntityRecognizer.findEntity(intent.entities,'Code');
        //session.conversationData[Gloabalentity]=entity;

        session.conversationData[GlobalMaterialCode] = entity.entity;         
        var abc;
       
        process.env.global_Material_Details_apiurl  = process.env.ApiURLForMaterialDetails + session.conversationData[GlobalMaterialCode];
        Request.get({ url : process.env.global_Material_Details_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 

                if(abc.length>0)
                    {
                      
                        //material extension list

                        // var prompt1 = new builder.Message(session);
                        // prompt1.attachmentLayout(builder.AttachmentLayout.carousel);
                        // var attachments1 = [];                   
                        // var attachments1=getCardsAttachmentsForMaterialextension(session,abc)
                        // prompt1.attachments(attachments1);
                        // session.send("Up to top 10 Material Details are shown.");
                        // session.send(prompt1);


                        //material details
                        var msg = new builder.Message(session);
                        msg.attachmentLayout(builder.AttachmentLayout.carousel);
                        var attachments = [];                  
                        var attachments=getCardsAttachmentsForMaterialDetails(session,abc);
                        msg.attachments(attachments);                      
                        session.send(msg);                 
                        session.endDialog();                            
                     // session.endDialogWithResult(result);


                    // session.send('Material Group : %s \n Material Type : %s \n Material Status : %s \n Material Description : %s \n Request Status : %s \n Request By : %s \n Request Date : %s',abc[0].MATERIAL_GROUP,abc[0].MATERIAL_TYPE,abc[0].MATERIAL_STATUS,abc[0].MATERIAL_DESCRIPTION,abc[0].REQUEST_STATUS,abc[0].REQUEST_BY,abc[0].REQUEST_DATE);
                    // session.endDialog();
                }
                else{
                    session.send('Data not available for material code : %s',session.conversationData[GlobalMaterialCode]);
                    session.endDialog();
                }
        }                                 
        });   
    }
    else if(builder.EntityRecognizer.findEntity(intent.entities,'Name'))
    {

        var abc;
        var extlistarray=[];
        entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');
        //session.conversationData[Gloabalentity]=entity;
        session.conversationData[GlobalMaterialName] = entity.entity;   
        process.env.global_Material_Details_ByName  = process.env.ApiURLForMaterialDetailsbyMaterialName +"MATERIAL_NAME="+ session.conversationData[GlobalMaterialName] +"&MATERIAL_TYPE=''&MATERIAL_GROUP=''"; ;
        Request.get({ url : process.env.global_Material_Details_ByName ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 

                if(abc.length>0)
                    {                    
                        //material extension list
                        // var prompt1 = new builder.Message(session);
                        // prompt1.attachmentLayout(builder.AttachmentLayout.carousel);
                        // var attachments1 = [];                   
                        // var attachments1=getCardsAttachmentsForMaterialextension(session,abc)
                        // prompt1.attachments(attachments1);
                        // session.send("Up to top 10 Material Details are shown.");
                        // session.send(prompt1);

                        //material details
                        var msg = new builder.Message(session);
                        msg.attachmentLayout(builder.AttachmentLayout.carousel);
                        var attachments = [];                  
                        var attachments=getCardsAttachmentsForMaterialDetails(session,abc);
                        msg.attachments(attachments);                      
                        session.send(msg);                 
                        session.endDialog();                                
                  
                }
                else{
                    session.send('Data Not Available for material Name : %s',session.conversationData[GlobalMaterialName]);
                    session.endDialog();
                }
        }                                 
        });   
    }
    else{
      if(session.conversationData[GlobalMaterialCode])
      {
        process.env.global_Material_Details_apiurl  = process.env.ApiURLForMaterialDetails + session.conversationData[GlobalMaterialCode];
        Request.get({ url : process.env.global_Material_Details_apiurl ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 
            if(abc.length>0)
            {
                session.conversationData[GlobalMaterialCode] = abc[0].MATERIAL_NUMBER;
                    
                    //material extension list
                    // var prompt1 = new builder.Message(session);
                    // prompt1.attachmentLayout(builder.AttachmentLayout.carousel);
                    // var attachments1 = [];                   
                    // var attachments1=getCardsAttachmentsForMaterialextension(session,abc)
                    // prompt1.attachments(attachments1);
                    // session.send("Up to top 10 Material Details are shown.");
                    // session.send(prompt1);


                    //material details
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];                  
                    var attachments=getCardsAttachmentsForMaterialDetails(session,abc);
                    msg.attachments(attachments);                      
                    session.send(msg);                 
                    session.endDialog();                

            }  
            else{
                session.send('Data Not Available for material code : %s',session.conversationData[GlobalMaterialCode]);
                session.endDialog();
            } 
        }

                                   
       });                        
      }
      else 
      {
        var msgfornodata = new builder.Message();    
        msgfornodata.text("It looks like you are looking for “Material Details” or but you didn't mention _material name_ or _material code_.\n You may ask things like “material details for _GRASS CARPET_” or “material details for _200131_” ");        
        session.send(msgfornodata);   
        // session.send("It looks like you are looking for vendor details but you didn't mention vendor name. You may ask things like All document for ABC Ltd");           
        session.endDialog(); 
        //session.beginDialog('askMoreAttribute');  
      }
    }

}
]).triggerAction({
    matches: 'Vendor.Material'
})

//service Dialog

bot.dialog('ServiceDialog',[
    function (session, args, next) {


       
    intent = args.intent;
    session.conversationData[GloabalIntent] = intent.intent;    
       
        //for cosmos db store data
        BotID=session.conversationData.botID;
        BotName= session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                 
      // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
      //end cosmos db 


  //Get Data From Web Api
    if(builder.EntityRecognizer.findEntity(intent.entities,'Code'))
    {      
        entity = builder.EntityRecognizer.findEntity(intent.entities,'Code');
        session.conversationData[Gloabalentity]=entity;

        session.conversationData[GlobalServiceCode] = entity.entity;         
        var abc;
     
        process.env.global_Servcie_Details_ByCode = process.env.ApiURLForServiceDetailsbyServiceCode + session.conversationData[GlobalServiceCode];
        Request.get({ url : process.env.global_Servcie_Details_ByCode ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 
            if(abc.length > 0)
            {
              // session.conversationData[GlobalServiceCode] = abc[0].SERVICE_NUMBER;      
              var msg = new builder.Message(session);
              msg.attachmentLayout(builder.AttachmentLayout.carousel);
              var attachments = [];             
              var attachments=getCardsAttachmentsForServiceDetails(session,abc);
              msg.attachments(attachments);
              session.send("Up to top 10 services are shown.");
              session.send(msg);   
              session.endDialog();                
           }
            else
            {
                session.send('Data not available for service code : %s',session.conversationData[GlobalServiceCode]);
                session.endDialog();
            }
        }                                 
        });   
    }
    else if(builder.EntityRecognizer.findEntity(intent.entities,'Name'))
    {
        entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');
        //session.conversationData[Gloabalentity]=entity;

        session.conversationData[GlobalServiceName] = entity.entity;         
        var abc;
     
        process.env.global_Service_Details_ByName = process.env.ApiForServiceDetailsbyServiceName +"SERVICE_NAME="+ session.conversationData[GlobalServiceName] +"&MATERIAL_GROUP=''&VALUATION_CLASS=''"; 
        Request.get({ url : process.env.global_Service_Details_ByName ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 
            if(abc.length > 0)
            {
              // session.conversationData[GlobalServiceCode] = abc[0].SERVICE_NUMBER;      
              var msg = new builder.Message(session);
              msg.attachmentLayout(builder.AttachmentLayout.carousel);
              var attachments = [];             
              var attachments=getCardsAttachmentsForServiceDetails(session,abc);
              msg.attachments(attachments);
              session.send("Up to top 10 services are shown.");
              session.send(msg);   
              session.endDialog();                
           }
            else
            {
                session.send('Data not available for service Name : %s',session.conversationData[GlobalServiceName]);
                session.endDialog();
            }
        }                                 
        });
    }
   else{
      if(session.conversationData[GlobalServiceCode])
      {
        process.env.global_Servcie_Details_ByCode = process.env.ApiURLForServiceDetailsbyServiceCode + session.conversationData[GlobalServiceCode];
        Request.get({ url : process.env.global_Servcie_Details_ByCode ,headers : { "Authorization" : auth}}, (error, response, body) => {
        if(error) {
            session.send("Data not found");
        }
        else{
            abc=JSON.parse(body);
            var i,j; 
            if(abc.length>0)
            {
              // session.conversationData[GlobalServiceCode] = abc[0].SERVICE_NUMBER;           
               session.conversationData[GlobalServiceCode] = abc[0].SERVICE_NUMBER;      
               var msg = new builder.Message(session);
               msg.attachmentLayout(builder.AttachmentLayout.carousel);
               var attachments = [];             
               var attachments=getCardsAttachmentsForServiceDetails(session,abc);
               msg.attachments(attachments);
               session.send(msg);                 
               session.endDialog(); 
                    
             
            
            }
            else{
                session.send('Data not available for service code : %s',session.conversationData[GlobalServiceCode]);
                session.endDialog();
            }
            }        
                             
       });                        
      }
      else 
      {
        var msgfornodata = new builder.Message();    
        msgfornodata.text("It looks like you are looking for “Service Details” or but you didn't mention _service name_ or _service code_.\n You may ask things like “service details for _Fuel Charges_” or “service details for _3001655_” ");        
        session.send(msgfornodata);   
        // session.send("It looks like you are looking for vendor details but you didn't mention vendor name. You may ask things like All document for ABC Ltd");           
        session.endDialog(); 
        
        //session.beginDialog('askMoreAttributeForService');  
      }
    }

}
]).triggerAction({
    matches: 'Material_Service'
})

//request details bot
bot.dialog('RequestDetailsDialog',[
    function (session, args, next) {

       

        intent = args.intent;
        session.conversationData[GloabalIntent] = intent.intent;   

        //for cosmos db store data
        BotID=session.conversationData.botID;
        BotName= session.conversationData.botName;
        UserName= session.conversationData.userName;
        UserId=session.conversationData.userID;
        ConversationId=session.conversationData.conversationID;
                
        // session.send("botid=%s botName=%s UserName=%s UserId=%s ConversationId=%s Date=%s DateTime=%s",BotID,BotName,UserName,UserId,ConversationId,date,datetime);
        createFamilyItem(BotID,BotName,ConversationId,UserId,UserName,session.message.text,session.conversationData[GloabalIntent]);
        //end cosmos db 




        if(builder.EntityRecognizer.findEntity(intent.entities,'Name')) 
        {
        entity = builder.EntityRecognizer.findEntity(intent.entities,'Name');
        session.conversationData[Gloabalentity]=entity;
            if((entity.entity).toLowerCase()=="me" || (entity.entity).toLowerCase() =="my" || (entity.entity).toLowerCase() =="approval")
            {
                //session.conversationData[GlobalADID]="NSAMARTH"; //pass session id here
            
            }
            else{
                var username=builder.EntityRecognizer.findEntity(intent.entities,'Name');
                session.conversationData[GlobalADID]= username.entity;
                    
            }
        }
       

  //Get Data From Web Api
    if(session.conversationData[Gloabalentity])
    {      
        //session.conversationData[GlobalADID] = entity.entity;   
        
        var abc;
        
        if(builder.EntityRecognizer.findEntity(intent.entities,'Pending'))
            {               
                    session.conversationData[Gloabalentity1]="Pending";
                    process.env.global_Request_Details_ByADID_forPending = process.env.ApiForPendigRequestDetailsbyADID + session.conversationData[GlobalADID];
                
                   
                    Request.get({ url : process.env.global_Request_Details_ByADID_forPending ,headers : { "Authorization" : auth}}, (error, response, body) => {
                
                            if(error) {
                                session.send("Data not found");
                            }
                            else{
                                abc=JSON.parse(body);                       
                                var i,j; 
                                if(abc.length>0)
                                {
                                   
                                    var msg = new builder.Message(session);
                                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                                    var attachments = [];                                      
                                    var attachments=getCardsAttachmentsForPendingRequest(session,abc);
                                    msg.attachments(attachments);
                                    session.send("Up to top 10 pending request are shown");
                                    session.send(msg);                 
                                    session.endDialog();

                                             
                                  //  session.send('Request No : %s \n Request By : %s \n Step Name : %s \n Created Date : %s',abc[i].REQUESTNUMBER,abc[i].REQUESTBY,abc[i].STEPNAME,abc[i].CREATEDDATE+'<br>');
                                   
                                  
                                }
                                else
                                {
                                    session.send("No one request pending for %s  ",session.conversationData[GlobalADID]); 
                                    session.endDialog();
                                }
                            }                                 
                });   
        }
        else if(builder.EntityRecognizer.findEntity(intent.entities,'Details'))
            {
                session.conversationData[Gloabalentity1]='Details';            
                process.env.global_Request_Details_ByADID = process.env.ApiForRequestDetailsbyADID + session.conversationData[GlobalADID];               
                Request.get({ url : process.env.global_Request_Details_ByADID ,headers : { "Authorization" : auth}}, (error, response, body) => {
                if(error) {
                    session.send("Data not found");
                }
                else{
                    abc=JSON.parse(body);
                    var i,j; 
                    if(abc.length > 0)
                    {                   
                        var msg = new builder.Message(session);
                         msg.attachmentLayout(builder.AttachmentLayout.carousel);
                         var attachments = [];                                      
                         var attachments=getCardsAttachmentsForRequestDetails(session,abc);
                         msg.attachments(attachments);
                         session.send("Up to top 10 initiated request are shown")
                         session.send(msg);                 
                         session.endDialog();               
                           
                   // session.send('Request No : %s \n Request By : %s \n Step Name : %s \n Status : %s \n Pending With : %s \n Date : %s',abc[i].REQUESTNUMBER,abc[i].REQUESTBY,abc[i].STEPNAME,abc[i].STATUS,abc[i].PENDINGWITH,abc[i].CREATEDDATE+'<br>');
                    }
                else
                {
                    session.send("Request details not found for: %s  ",session.conversationData[GlobalADID]); 
                }
                }                                 
                });   
        }
        else{
                
                        session.beginDialog('askForPendingorDetailsRequest');
                       // session.endDialog();
            }
       
    }
    else{

      if(session.conversationData[GlobalADID])  
      {
        if(session.conversationData[Gloabalentity1]=='Pending')
        {
           process.env.global_Request_Details_ByADID_forPending = process.env.ApiForPendigRequestDetailsbyADID + session.conversationData[GlobalADID];
            Request.get({ url : process.env.global_Request_Details_ByADID_forPending ,headers : { "Authorization" : auth}}, (error, response, body) => {
        
                if(error) {
                    session.send("Data not found");
                }
                else{
                    abc=JSON.parse(body);
                    var i,j; 
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];
                      if(abc.length>0)
                      {   
                        var msg = new builder.Message(session);
                                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                                    var attachments = [];                                      
                                    var attachments=getCardsAttachmentsForPendingRequest(session,abc);
                                    msg.attachments(attachments);
                                    session.send("Up to top 10 pending request are shown");
                                    session.send(msg);                 
                                    session.endDialog();

                        }
                        else{
                            session.send("No one request pending for: %s  ",session.conversationData[GlobalADID]);
                            session.endDialog(); 
                        }
                }                                 
        });   
       }
       else if(session.conversationData[Gloabalentity1]=='Details')
       {        
           process.env.global_Request_Details_ByADID = process.env.ApiForRequestDetailsbyADID + session.conversationData[GlobalADID];
            Request.get({ url : process.env.global_Request_Details_ByADID ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
                session.send("Data not found");
            }
            else{
                abc=JSON.parse(body);
                var i,j; 
                if(abc.length>0)
                {
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];                                      
                    var attachments=getCardsAttachmentsForRequestDetails(session,abc);
                    msg.attachments(attachments);
                    session.send("Up to top 10 initiated request are shown")
                    session.send(msg);                 
                    session.endDialog();  
                }
                else
                {
                    session.send("Request details not found for: %s  ",session.conversationData[GlobalADID]);
                    session.endDialog(); 
                }

            }                                 
            });   
       }
       else{
       
                if(session.conversationData[GlobalADID])
                {
                    
                }
                else
                {
                    session.conversationData[GlobalADID]="nsamarth";
                }
                session.beginDialog('askForPendingorDetailsRequest');
               // session.endDialog();
       }                   
      }
      else 
      {
        session.send("Please narrow your search.");
        session.endDialog();
      }
    }

}
]).triggerAction({
    matches: 'Request_Details'
})

//common Function

//get extention of file
function getextention(fileopen)
{
   var pdfPath;
         //get file extension
            var path = require('path');
            if(fileopen)
            {
            var ext = path.extname(fileopen);  
            }
            else{
                ext="";
            }                    
return ext;
                      
}

//get image of extension file
function getfileextensionimage(fileopen,finaleqno)
{
    var pdfPath;
    //get file extension
    var path = require('path');
    var ext = path.extname(fileopen);
      console.log(ext);
    if (ext.toLowerCase() == ".pdf")
        {
            pdfPath ="https://vrm.godrejproperties.com:20080/UAT_VRM/AttachDocumentHeaderImage/if_pdf_272711.png"; 
                //HttpContext.Current.Server.MapPath("~/AttachDocumentHeaderImage/if_pdf_272711.png");
        }
        else if (ext.toLowerCase() == ".png" || ext.toLowerCase() == ".jpg" || ext.toLowerCase() == ".jpeg" || ext.toLowerCase() == ".gif")
        {
            pdfPath ="https://vrm.godrejproperties.com:20080/UAT_VRM/AttachDocumentHeaderImage/if_image_272710.png";
            //HttpContext.Current.Server.MapPath("~/AttachDocumentHeaderImage/if_image_272710.png");
        }
        else if (ext.toLowerCase() == ".doc" || ext.toLowerCase() == "docx")
        {
            pdfPath ="https://vrm.godrejproperties.com:20080/UAT_VRM/AttachDocumentHeaderImage/if_word_272714.png";
            //HttpContext.Current.Server.MapPath("~/AttachDocumentHeaderImage/if_word_272714.png");
        }
        else if (ext.toLowerCase() == ".xls" || ext.toLowerCase() == "xlsx" || ext.toLowerCase() == "xlsm" || ext.toLowerCase() == "xltx" || ext.toLowerCase() == "xltm")
        {
            pdfPath ="https://vrm.godrejproperties.com:20080/UAT_VRM/AttachDocumentHeaderImage/if_excel_272709.png";
           // HttpContext.Current.Server.MapPath("~/AttachDocumentHeaderImage/if_excel_272709.png");
        }
        else
        {

        }
return pdfPath;
}

//get attachdocument filename and type
function getattachdocument(session,abc)
{
   var attachdocpath;
    var i;
    var filename;
    var fileopen;
    session.conversationData[GlobalRequestNo] = abc[0].REQUEST_NO;
    var data1=session.conversationData[GlobalRequestNo];
    var enquryno=data1.replace('/', '_');
    var finaleqno=enquryno.replace('/','_');

    for(i=0; i < abc[0].DOCUMENT_LIST.length;i++)
    {
        if(abc[0].DOCUMENT_LIST[i].FILE_TYPE =="PAN Card Copy" && session.conversationData[Gloabalentity1]=="PanNo")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';
        }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="GST Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="GstNo")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        // else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="VAT Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="VAT_Certificate")
        // {
        //     attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        // }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="EM Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="EM_Certificate")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        // else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="CST Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="CST_Certificate")
        // {
        //     attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        // }
        // else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="Company Registration Certificate" && session.conversationData[Gloabalentity1]=="Company_Registration")
        // {
        //     attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        // }
        // else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="IOM/Approval Copy For Procurement" && session.conversationData[Gloabalentity1]=="IOM/Approval")
        // {
        //     attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        // }
        // else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="ST Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="ST_Certificate")
        // {
        //     attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        // }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="PF Certificate/ Undertaking" && session.conversationData[Gloabalentity1]=="PF_Certificate")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }       
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="Proprietorship Declaration" && session.conversationData[Gloabalentity1]=="Proprietorship_Declaration")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="Cancelled Cheque Copy" && session.conversationData[Gloabalentity1]=="Cancelled_Cheque")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="Invoice" && session.conversationData[Gloabalentity1]=="Invoice")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="RERA Certificate/ Declaration" && session.conversationData[Gloabalentity1]=="RERA_Certificate")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
        else if(abc[0].DOCUMENT_LIST[i].FILE_TYPE=="Channel Partner Agreement " && session.conversationData[Gloabalentity1]=="Channel_Partner_Agreement")
        {
            attachdocpath ='https://vrm.godrejproperties.com:20080/UAT_VRM/Common/FileDownload.aspx?enquiryno='+finaleqno+'&filename='+abc[0].DOCUMENT_LIST[i].FILE_NAME+'&filetag=';;
        }
    }
    return attachdocpath;
}

//extra questions
//ask for vendor name in vendor details
bot.dialog('askForVendorName', [
    function (session) {
      //  session.dialogData.alarm = {};
        builder.Prompts.text(session, "It looks like you are looking for vendor details but you didn't mention vendor name, gst or pan. You may ask things like vendor details for ABC Ltd or vendor details for ABCPX0000G");
    },
    function (session, results, next) {
     
        if (results.response) {
            session.dialogData.name = results.response;
         
            if (results.response.length >= 3) {
                
                    session.send("%s",session.conversationData[GloabalIntent]);
                    session.conversationData[GlobalVendorName]= results.response;
                    session.conversationData[Gloabalentity]="Name";
                  
                        if(session.conversationData[GloabalIntent]=="Vendor.AllDocument")
                        {
                            session.beginDialog('AllDocumentDialog',{'Entity': true});
                    
                        }
                        else if(session.conversationData[GloabalIntent]=="Vendor.Number")
                        {
                            session.beginDialog('GSTandPAN_NoDialog',{'Entity': true});
                        }
                        else if(session.conversationData[GloabalIntent]=="Vendor.AllDetails")
                        {
                            session.beginDialog('AllDetailsDialog',{'Entity': true});
                        }  
                        else if(session.conversationData[GloabalIntent]=="Vendor.Extensions")
                        {
                            session.beginDialog('ExtensionDialog',{'Entity': true});
                        }      
                        else
                        {
            
                        }
                    }
                    else{
                        session.send("Please enter at least 4 character in desacription or more");
                        session.beginDialog('askForVendorName');  
                        //next();
                    }
        } else {
            next();
        }
    }
    // function (session, next) {          
    //    if(session){
    //     builder.dialogData.text(session, "Please Enter Vendor Name");
    //    }else{
    //        next();
    //    }
            
    //         //session.send("%s",JSON.parse(session));
    //         console.log("session",session);
    // },
    // function (session,results) {
     
    //     //session.endDialogWithResult(results);
    //     if (results.response.length >= 3) {
    //         session.dialogData.time = builder.EntityRecognizer.resolveTime([results.response]);
     
    //     session.send("%s",session.conversationData[GloabalIntent]);
    //     session.conversationData[GlobalVendorName]= results.response;
    //     session.conversationData[Gloabalentity]="Name";
   
    //         if(session.conversationData[GloabalIntent]=="Vendor.AllDocument")
    //         {
    //             session.beginDialog('AllDocumentDialog',{'Entity': true});
        
    //         }
    //         else if(session.conversationData[GloabalIntent]=="Vendor.Number")
    //         {
    //             session.beginDialog('GSTandPAN_NoDialog',{'Entity': true});
    //         }
    //         else if(session.conversationData[GloabalIntent]=="Vendor.AllDetails")
    //         {
    //             session.beginDialog('AllDetailsDialog',{'Entity': true});
    //         }  
    //         else if(session.conversationData[GloabalIntent]=="Vendor.Extensions")
    //         {
    //             session.beginDialog('ExtensionDialog',{'Entity': true});
    //         }      
    //         else
    //         {

    //         }
    //     }
    //     else{
    //         session.send("Please enter at least 4 character in desacription or more");
    //         session.beginDialog('askForVendorName');  
    //         //next();
    //     }
    
      
    // }
]);

//ask attribute for material code
bot.dialog('askMoreAttribute', [
    function (session) {
        builder.Prompts.text(session, "Please enter material description");
    },
    function (session,result) {
        //session.endDialogWithResult(results);
        if(result.response.length > 3)
        {
        var abc;
        process.env.global_Material_Details_ByName = process.env.ApiURLForMaterialDetailsbyMaterialName +"MATERIAL_NAME="+ result.response +"&MATERIAL_TYPE=''&MATERIAL_GROUP=''"; 
      
        Request.get({ url : process.env.global_Material_Details_ByName ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
                session.send("Data not found");
            }
            else{
                abc=JSON.parse(body);
                var i,j; 
                  if(abc.length>0)
                  {
                    //material extension list

                    // var prompt1 = new builder.Message(session);
                    // prompt1.attachmentLayout(builder.AttachmentLayout.carousel);
                    // var attachments1 = [];                   
                    // var attachments1=getCardsAttachmentsForMaterialextension(session,abc)
                    // prompt1.attachments(attachments1);
                    // session.send("Up to top 10 Material Details are shown.");
                    // session.send(prompt1);


                    //material details
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                    var attachments = [];                  
                    var attachments=getCardsAttachmentsForMaterialDetails(session,abc);
                    msg.attachments(attachments);                      
                    session.send(msg);                 
                    session.endDialogWithResult(result);              
                }
                else
                {
                    session.send("Data not found for material name : %s",result.response);
                    session.endDialogWithResult(result);
                }
                }                                        
           });  

           session.endDialog();  
        }
        else{
           session.send("Please enter at least 4 character in desacription or more");
            session.beginDialog('askMoreAttribute');  
        }  
           
    }
])

//more attribute for service
bot.dialog('askMoreAttributeForService', [
    function (session) {
        builder.Prompts.text(session, "Please enter service description");
    },
    function (session,result) {
        //session.endDialogWithResult(results);
        var abc;
        if(result.response.length > 3)
        {
            process.env.global_Service_Details_ByName = process.env.ApiForServiceDetailsbyServiceName +"SERVICE_NAME="+ result.response +"&MATERIAL_GROUP=''&VALUATION_CLASS=''"; 
      
        Request.get({ url : process.env.global_Service_Details_ByName ,headers : { "Authorization" : auth}}, (error, response, body) => {
            if(error) {
                session.send("Data not found");
            }
            else{
               abc=JSON.parse(body);
               var i,j;
               
               if(abc.length>0)
               {
                            var msg = new builder.Message(session);
                            msg.attachmentLayout(builder.AttachmentLayout.carousel);
                            var attachments = [];             
                            var attachments=getCardsAttachmentsForServiceDetails(session,abc);
                            msg.attachments(attachments);
                            session.send("Up to top 10 material services are shown.");
                            session.send(msg);                      
                            session.endDialogWithResult(result);
                }
                else{
                    session.send("Data not found for service name : %s",result.response);
                    session.endDialogWithResult(result);
                }
                }    
                                                
           });    
        session.endDialog();      
        }
        else{
            session.send("Please enter at least 4 character in desacription or more");
             session.beginDialog('askMoreAttributeForService');  
         }  
    }
])

//ask for pending request
bot.dialog('askForPendingorDetailsRequest', [
    function (session) {
        var dict=[];
        dict.push("Initiated by me");
        dict.push("Pending for action/approval");
       // builder.Prompts.text(session, "Please enter material description");
       builder.Prompts.choice(session, "Please select below options: ", dict,{listStyle:3})
    },
    function (session, results) {          
        var str1 = results.response.entity;     
        var str; 
       if(str1=="Initiated by me")
       {
        str="Details";
       }
       else if(str1=="Pending for action/approval")
       {
        str="Pending";
       }
        if(str)
        {
            
          // session.send(session.conversationData[GlobalADID]);
            if(str =='Pending')
            {
               var abc;
                    session.conversationData[Gloabalentity1]="Pending";
                    process.env.global_Request_Details_ByADID_forPending = process.env.ApiForPendigRequestDetailsbyADID+ session.conversationData[GlobalADID];
                
                   
                    Request.get({ url : process.env.global_Request_Details_ByADID_forPending ,headers : { "Authorization" : auth}}, (error, response, body) => {
                
                            if(error) {
                                session.send("Data not found");
                            }
                            else{
                                abc=JSON.parse(body);                       
                                var i,j; 
                                if(abc.length>0)
                                {
                                    var msg = new builder.Message(session);
                                    msg.attachmentLayout(builder.AttachmentLayout.carousel);
                                    var attachments = [];                                      
                                    var attachments=getCardsAttachmentsForPendingRequest(session,abc);
                                    msg.attachments(attachments);
                                    session.send("Up to top 10 pending request are shown");
                                    session.send(msg);                 
                                    session.endDialogWithResult(results);          
                                }
                                else
                                {
                                    session.send("No one request pending for %s  ",session.conversationData[GlobalADID]); 
                                }
                            }                                 
                });   
            }
            else if(str =='Details')
            {
                session.conversationData[Gloabalentity1]='Details';            
                process.env.global_Request_Details_ByADID = process.env.ApiForRequestDetailsbyADID + session.conversationData[GlobalADID];               
                Request.get({ url : process.env.global_Request_Details_ByADID ,headers : { "Authorization" : auth}}, (error, response, body) => {
                if(error) {
                    session.send("Data not found");
                }
                else{
                    var abc;
                    abc=JSON.parse(body);
                    var i,j; 
                    if(abc.length > 0)
                    {                   
                        var msg = new builder.Message(session);
                        msg.attachmentLayout(builder.AttachmentLayout.carousel);
                        var attachments = [];                                      
                        var attachments=getCardsAttachmentsForRequestDetails(session,abc);
                        msg.attachments(attachments);
                        session.send("Up to top 10 initiated request are shown")
                        session.send(msg);                 
                        session.endDialogWithResult(results);   
                   // session.send('Request No : %s \n Request By : %s \n Step Name : %s \n Status : %s \n Pending With : %s \n Date : %s',abc[i].REQUESTNUMBER,abc[i].REQUESTBY,abc[i].STEPNAME,abc[i].STATUS,abc[i].PENDINGWITH,abc[i].CREATEDDATE+'<br>');
                    }
                else
                {
                    session.send("Request details not found for: %s  ",session.conversationData[GlobalADID]); 
                    session.endDialog();
                }
                }                                 
                });   
            }
            else{
                        //session.beginDialog('askForPendingorDetailsRequest');
                        session.endDialog();
            }
         
    }
    else
    {
        session.send("please select option");
    }
    
}
])



//adaptive card for vendor details
function getCardsAttachmentsForVendorName(session,abc) {

    var statusimage = getstatusURL(session,abc);
    
    var card = {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "1.0",
                "body": [                    
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "ColumnSet",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "items": [
                                            {
                                                "type": "TextBlock",
                                                "size": "Medium",
                                                "weight": "Bolder",
                                                "text": abc[0].VENDOR_NAME,
                                                "wrap": true
                                            },
                                            {
                                                "type": "TextBlock",
                                                "spacing": "None",
                                                "text": abc[0].VENDOR_CODE,
                                                "isSubtle": true,
                                                "wrap": true
                                            }
                                        ],
                                        "width": "stretch"
                                    },
                                    {
                                        "type": "Column",
                                        "items": [
                                            {
                                                "type": "Image",
                                                "style": "Person",
                                                "url":statusimage,
                                                "size": "small"
                                            }
                                        ],
                                        "width": "auto"
                                    },

                                ] }
                            ]
                    },
                    {
                        "type": "Container",
                        "separator": true,
                        "items": [
                            {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",
                                            "weight": "Bolder",
                                            "text": "PAN No:",
                                            
                                        },
                                       
                                    ],
                                    "width": 2
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",                                           
                                            "text": abc[0].PAN_NO,
                                           
                                        }
                                    ],
                                    "width": 3
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",
                                            "weight": "Bolder",
                                            "text": "GST No:",
                                           
                                        },
                                       
                                    ],
                                    "width": 2
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",                                            
                                            "text": abc[0].GST_NO,
                                          
                                        }
                                    ],
                                    "width": 3
                                },



                            ] }
                        ]

                    },
                    {
                        "type": "Container",
                        "items": [
                            {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",
                                            "weight": "Bolder",
                                            "text": "Status:",
                                            
                                        },
                                       
                                    ],
                                    "width": 2
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",                                           
                                            "text": abc[0].STATUS,
                                           
                                        }
                                    ],
                                    "width": 3
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",
                                            "weight": "Bolder",
                                            "text": "By:",
                                           
                                        },
                                       
                                    ],
                                    "width": 2
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",                                            
                                            "text": abc[0].APPROVED_BY,
                                          
                                        }
                                    ],
                                    "width": 3
                                },



                            ] }
                        ]

                    },
                    {
                        "type": "Container",
                        "items": [
                            {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",
                                            "weight": "Bolder",
                                            "text": "Request Number:",
                                            
                                        },
                                       
                                    ],
                                    "width": "auto"
                                },
                                {
                                    "type": "Column",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "size": "Medium",                                           
                                            "text": abc[0].REQUEST_NO,
                                           
                                        }
                                    ],
                                    "width": "auto"
                                }
                          ] }
                        ]

                    }
                            // {
                            //     "type": "FactSet",
                            //     "facts": [
                            //         {
                            //             "title": "Vendor Name:",
                            //             "value": abc[0].VENDOR_NAME
                            //         },
                            //         {
                            //             "title": "Vendor Code:",
                            //             "value": abc[0].VENDOR_CODE
                            //         },
                            //         {
                            //             "title": "Request No:",
                            //             "value": abc[0].REQUEST_NO
                            //         },
                            //         {
                            //             "title": "Status:",
                            //             "value": abc[0].STATUS
                            //         },
                            //         {
                            //             "title": "Approved By:",
                            //             "value": abc[0].APPROVED_BY
                            //         },
                            //         {
                            //             "title": "PAN No:",
                            //             "value": abc[0].PAN_NO
                            //         },
                            //         {
                            //             "title": "GST No:",
                            //             "value": abc[0].GST_NO
                            //         },
                            //     ]
                            // }
                       
                              
                   ]//body close
                }//content
            };
       return card;
    }
    
//adaptive card for ExtensionList
function getCardsAttachmentsForExtensionList(session,abc)
    {  
        var attachments=[];
        for(i=0; i<abc[0].EXTENSION_LIST.length; i++)
        {
                //adaptive
                var card = {
                    'contentType': 'application/vnd.microsoft.card.adaptive',
                    'content': {
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "type": "AdaptiveCard",
                        "version": "1.0",
                        "body": [
                            {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 'auto',
                                    "width": 4,
                                    "items": [
                                            {
                                                'type': 'TextBlock',
                                                'text': 'Organisation Name:',
                                                'weight': 'bolder',
                                            }]
                                },
                                {
                                    "type": "Column",
                                    "width":'6',
                                    "items": [
                                            {
                                                        'type': 'TextBlock',
                                                        'text': abc[0].EXTENSION_LIST[i].ORGANISATION_NAME,
                                            }]
                                }]
                            },
                            {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": '4',
                                    "items": [
                                            {
                                                'type': 'TextBlock',
                                                'text': 'Company Code:',
                                                'weight': 'bolder',
                                            }]
                                },
                                {
                                    "type": "Column",
                                    "width":'6',
                                    "items": [
                                            {
                                                        'type': 'TextBlock',
                                                        'text': abc[0].EXTENSION_LIST[i].COMPANY_CODE,
                                            }]
                                }]
                            }
                                                                                
                                            
                            ]//body close
                        }//content
                    };//card     
                attachments.push(card);      
        }

    return attachments;
}

//adaptive card for material extension attachment
function getCardsAttachmentsForMaterialDetails(session,abc)
{  
        var attachments=[];
        var i,j;
        var extensionlist="";
       var statusimage;

        for(i=0;i<abc.length;i++)
        {
            
            //loop for find extension list 
            for(j=0;j<abc[i].EXTENSION_LIST.length;j++)
            {
                if(abc[i].EXTENSION_LIST[j].PLANT != undefined || abc[i].EXTENSION_LIST[j].PLANT !=null || abc[i].EXTENSION_LIST[j].PLANT !="")
                {
                    extensionlist = extensionlist + "," + abc[i].EXTENSION_LIST[j].PLANT ;
                }
            }

            statusimage = getstatusURL(session,abc[i].REQUEST_STATUS);
            //adaptive
            var card = {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.0",
                    "body": [

                        {
                            "type": "Container",
                            "items": [
                                {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "size": "Medium",
                                                    "weight": "Bolder",
                                                    "text": abc[0].MATERIAL_DESCRIPTION,
                                                    "wrap": true
                                                },
                                                {
                                                    "type": "TextBlock",
                                                    "spacing": "None",
                                                    "text": abc[0].MATERIAL_NUMBER,
                                                    "isSubtle": true,
                                                    "wrap": true
                                                }
                                            ],
                                            "width": 7
                                        },
                                        {
                                            "type": "Column",
                                            "items": [
                                                {
                                                    "type": "Image",
                                                    "style": "Person",
                                                    "url":statusimage,
                                                    "size": "small"
                                                }
                                            ],
                                            "width": 3
                                        },
    
                                    ] }
                                ]
                        },
                        {
                         "type": "Container",
                         "separator": true,
                         "items": [
                        {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "width": 4,
                                            "items": [
                                                    {
                                                        'type': 'TextBlock',
                                                        'text': 'Material Group:',
                                                        'weight': 'bolder',
                                                    }]
                                        },
                                        {
                                            "type": "Column",
                                            "width": 6,
                                            "items": [
                                                    {
                                                                "type": "TextBlock",
                                                                "text": abc[i].MATERIAL_GROUP,
                                                    }]
                                        }]
                        },
                        {
                                "type": "ColumnSet",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "width": 4,
                                        "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "text": "Material Status:",
                                                    "weight": "bolder",
                                                }]
                                    },
                                    {
                                        "type": "Column",
                                        "width": 6,
                                        "items": [
                                                {
                                                            "type": "TextBlock",
                                                            "text": abc[i].MATERIAL_STATUS,
                                                }]
                                    }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "HSN Description:",
                                                "weight": "bolder",
                                            }]
                                },
                                {
                                    "type": "Column",
                                     "width": 6,
                                    "items": [
                                            {
                                                        "type": "TextBlock",
                                                        "text": abc[i].HSN_DESCRIPTION,
                                            }]
                                }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "HSN Code:",
                                                "weight": "bolder",
                                            }]
                                },
                                {
                                    "type": "Column",
                                    "width": 6,
                                    "items": [
                                            {
                                                        "type": "TextBlock",
                                                        "text": abc[i].HSN_CODE,
                                            }]
                                }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "Material Type:",
                                                "weight": "bolder",
                                            }]
                                },
                                {
                                    "type": "Column",
                                     "width": 6,
                                    "items": [
                                            {
                                                        "type": "TextBlock",
                                                        "text": abc[i].MATERIAL_TYPE,
                                            }]
                                }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "Request Status:",
                                                "weight": "bolder",
                                            }]
                                },
                                {
                                    "type": "Column",
                                     "width": 6,
                                    "items": [
                                            {
                                                        "type": "TextBlock",
                                                        "text": abc[i].REQUEST_STATUS + " ("+abc[i].REQUEST_DATE+")",
                                            }]
                                }]
                        },
                        {
                                "type": "ColumnSet",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "width": 4,
                                        "items": [
                                                {
                                                    'type': 'TextBlock',
                                                    'text': 'Valuation Class:',
                                                    'weight': 'bolder',
                                                }]
                                    },
                                    {
                                        "type": "Column",
                                         "width": 6,
                                        "items": [
                                                {
                                                            "type": "TextBlock",
                                                            "text": abc[i].VALUATION_CLASS,
                                                }]
                                    }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                "type": "TextBlock",
                                                "text": "Extension List:",
                                                "weight": "bolder",
                                            }]
                                },
                                {
                                    "type": "Column",
                                     "width": 6,
                                    "items": [
                                            {
                                                        "type": "TextBlock",
                                                        "text": extensionlist,
                                            }]
                                }]
                        },


                    ]
                        },
                        {                                          
                            "type": "Container",
                            "separator": true,
                            "items": [
                              {
                                "type": "TextBlock",
                                "text": (i+1) + "/" + abc.length,                                               
                                "color":"red",
                                "weight": "bolder",
                                "size": "medium"
                              },
                            ]
                        },                 
                       ]//body close
                    }//content
                }//card
                                                   
            attachments.push(card);      
        }//for loop

        return attachments;
}



//adaptive card for ServiceDetails
function getCardsAttachmentsForServiceDetails(session,abc)
{  
        var attachments=[];
        for(i=0;i<abc.length;i++)
        {
            //adaptive
            var card = {
                'contentType': 'application/vnd.microsoft.card.adaptive',
                'content': {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.0",
                    "body": [
                        {                                          
                            "type": "Container",
                            "items": [
                              {
                                "type": "TextBlock",
                                "text": (i+1) + "/" + abc.length,                                               
                                "color":"red",
                                "weight": "bolder",
                                "size": "medium"
                              },
                            ]
                        },
                        {
                         "type": "Container",
                         "separator": true,
                         "items": [
                         {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "width": 4,
                                "items": [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Service Code:',
                                            'weight': 'bolder',
                                        }]
                            },
                            {
                                "type": "Column",
                                "width":6,
                                "items": [
                                        {
                                                    'type': 'TextBlock',
                                                    'text': abc[i].SERVICE_NUMBER,
                                        }]
                            }]
                        },
                        {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "width": 4,
                                "items": [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'Service Description:',
                                            'weight': 'bolder',
                                        }]
                            },
                            {
                                "type": "Column",
                                "width":6,
                                "items": [
                                        {
                                                    'type': 'TextBlock',
                                                    'text': abc[i].SERVICE_DESCRIPTION,
                                        }]
                            }]
                        },
                        {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                'type': 'TextBlock',
                                                'text': 'Service Status:',
                                                'weight': 'bolder',
                                            }]
                                },
                                {
                                    "type": "Column",
                                    "width":6,
                                    "items": [
                                            {
                                                        'type': 'TextBlock',
                                                        'text': abc[i].SERVICEL_STATUS,
                                            }]
                                }]
                        },
                        {
                                "type": "ColumnSet",
                                "columns": [
                                    {
                                        "type": "Column",
                                        "width": 4,
                                        "items": [
                                                {
                                                    'type': 'TextBlock',
                                                    'text': 'Material Group:',
                                                    'weight': 'bolder',
                                                }]
                                    },
                                    {
                                        "type": "Column",
                                        "width":6,
                                        "items": [
                                                {
                                                            'type': 'TextBlock',
                                                            'text': abc[i].MATERIAL_GROUP,
                                                }]
                                    }]
                        },
                        {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "width": 4,
                                            "items": [
                                                    {
                                                        'type': 'TextBlock',
                                                        'text': 'Request Status:',
                                                        'weight': 'bolder',
                                                    }]
                                        },
                                        {
                                            "type": "Column",
                                            "width":6,
                                            "items": [
                                                    {
                                                                'type': 'TextBlock',
                                                                'text': abc[i].REQUEST_STATUS,
                                                    }]
                                        }]
                        },
                        {
                                        "type": "ColumnSet",
                                        "columns": [
                                            {
                                                "type": "Column",
                                                "width": 4,
                                                "items": [
                                                        {
                                                            'type': 'TextBlock',
                                                            'text': 'Request By:',
                                                            'weight': 'bolder',
                                                        }]
                                            },
                                            {
                                                "type": "Column",
                                                "width":6,
                                                "items": [
                                                        {
                                                                    'type': 'TextBlock',
                                                                    'text': abc[i].REQUEST_BY,
                                                        }
                                                    ]
                                            }]
                        },
                               
                    ]
                }               
                                          
                       ]//body close
                    }//content
                }//card
                                                   
            attachments.push(card);      
        }//for loop
                    
        return attachments;
}

//adaptive card for pending request
function getCardsAttachmentsForPendingRequest(session,abc)
{  
    var attachments=[];
    for(i=0;i<abc.length;i++)
     {
                                             //adaptive
        var card = {
        'contentType': 'application/vnd.microsoft.card.adaptive',
         'content': {
         "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
        "type": "AdaptiveCard",
        "version": "1.0",
        "body": [
            {
                "type": "Container",
                "items": [
                {
                "type": "TextBlock",
                "text": (i+1) + "/" + abc.length,                                                               
                "color": "black",
                "weight": "bolder",
                "size": "medium"
                 },
               ]
               },//container
               {
                     "type": "Container",
                     "separator": true,
                     "items": [
                     {
                        "type": "ColumnSet",
                        "columns": [
                         {
                            "type": "Column",
                             "width": 4,
                            "items": [
                                {
                                     'type': 'TextBlock',
                                     'text': 'Request Number:',
                                     'weight': 'bolder',
                                 }]
                                },
                             {
                                "type": "Column",
                                "width":6,
                                 "items": [
                                {
                                     'type': 'TextBlock',
                                     'text': abc[i].REQUESTNUMBER,
                                }]
                                }]
                                },
                                {
                                    "type": "ColumnSet",
                                    "columns": [
                                    {
                                        "type": "Column",
                                        "width": 4,
                                        "items": [
                                         {
                                                'type': 'TextBlock',
                                                'text': 'Request By:',
                                                'weight': 'bolder',
                                        }]
                                     },
                                    {
                                     "type": "Column",
                                     "width":6,
                                     "items": [
                                    {
                                         'type': 'TextBlock',
                                          'text': abc[i].REQUESTEDBY,
                                    }]
                                   }]
                                  },
                                 {
                                     "type": "ColumnSet",
                                     "columns": [
                                         {
                                              "type": "Column",
                                                "width": 4,
                                                "items": [
                                                {
                                                     'type': 'TextBlock',
                                                     'text': 'For :',
                                                     'weight': 'bolder',
                                                }]
                                        },
                                        {
                                                 "type": "Column",
                                                 "width":6,
                                                 "items": [
                                                     {
                                                         'type': 'TextBlock',
                                                         'text': '( ' + abc[i].STEPNAME + ') '+ abc[i].NAME,
                                                     }]
                                                 }]
                                        },
                                        {
                                         "type": "ColumnSet",
                                        "columns": [
                                         {
                                            "type": "Column",
                                             "width": 4,
                                            "items": [
                                             {
                                                'type': 'TextBlock',
                                                'text': 'Created Date:',
                                                'weight': 'bolder',
                                            }]                                   
                                        },
                                        {
                                            "type": "Column",
                                            "width":6,
                                            "items": [
                                                    {
                                                                'type': 'TextBlock',
                                                                'text': abc[i].CREATEDDATE,
                                                    }]
                                        }]
                            },
                                                                                       
                           ]} //container                  
                                              
                           ]//body close
                        }//content
                    }//card                        
                                                                                    
                                             attachments.push(card);      
                                         }//for loop
       return attachments;
}

//adaptive card for RequestDetails
function getCardsAttachmentsForRequestDetails(session,abc)
{
    var attachments=[];
    for(i=0;i<abc.length;i++)
    {
        //adaptive
        var card = {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",                                        
                "type": "AdaptiveCard",
                "version": "1.0",
                "body": [
                    {
                       "type": "Container",
                       "items": [
                         {
                           "type": "TextBlock",
                           "text": (i+1) + "/" + abc.length,                                               
                           "color":"red",
                           "weight": "bolder",
                           "size": "medium"
                         },
                       ]
                   },
                   {
                    "type": "Container",
                    "separator": true,
                    "items": [
                    {
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "width": 4,
                            "items": [
                                    {
                                        'type': 'TextBlock',
                                        'text': 'Request Number:',
                                        'weight': 'bolder',
                                    }]
                        },
                        {
                            "type": "Column",
                            "width":6,
                            "items": [
                                    {
                                                'type': 'TextBlock',
                                                'text': abc[i].REQUESTNUMBER,
                                    }]
                        }]
                    },
                    {
                    "type": "ColumnSet",
                    "columns": [
                        {
                            "type": "Column",
                            "width": 4,
                            "items": [
                                    {
                                        'type': 'TextBlock',
                                        'text': 'Request By :',
                                        'weight': 'bolder',
                                    }]
                        },
                        {
                            "type": "Column",
                            "width":6,
                            "items": [
                                    {
                                                'type': 'TextBlock',
                                                'text': abc[i].REQUESTEDBY,
                                    }]
                        }]
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "width": 4,
                                "items": [
                                        {
                                            'type': 'TextBlock',
                                            'text': 'For :',
                                            'weight': 'bolder',
                                        }]
                            },
                            {
                                "type": "Column",
                                "width":6,
                                "items": [
                                        {
                                                    'type': 'TextBlock',
                                                    'text': '(' + abc[i].STEPNAME +') '+ abc[i].NAME,
                                        }]
                            }]
                    },
                    {
                       "type": "ColumnSet",
                       "columns": [
                           {
                               "type": "Column",
                               "width": 4,
                               "items": [
                                       {
                                           'type': 'TextBlock',
                                           'text': 'Request Status :',
                                           'weight': 'bolder',
                                       }]
                           },
                           {
                               "type": "Column",
                               "width":6,
                               "items": [
                                       {
                                                   'type': 'TextBlock',
                                                   'text': abc[i].STATUS,
                                       }]
                           }]
                   },
                    {
                   "type": "ColumnSet",
                   "columns": [
                       {
                           "type": "Column",
                           "width":4,
                           "items": [
                                   {
                                       'type': 'TextBlock',
                                       'text': 'Pending With :',
                                       'weight': 'bolder',
                                   }]
                       },
                       {
                           "type": "Column",
                           "width":6,
                           "items": [
                                   {
                                               'type': 'TextBlock',
                                               'text': abc[i].PENDINGWITH,
                                   }]
                       }]
                     },
                    {
                            "type": "ColumnSet",
                            "columns": [
                                {
                                    "type": "Column",
                                    "width": 4,
                                    "items": [
                                            {
                                                'type': 'TextBlock',
                                                'text': 'Created Date :',
                                                'weight': 'bolder',
                                            }]
                                },
                                {
                                    "type": "Column",
                                    "width":6,
                                    "items": [
                                            {
                                                        'type': 'TextBlock',
                                                        'text': abc[i].CREATEDDATE,
                                            }]
                                }]
                    },
                   ]                                                          
                                        
                   }                 
                   ]//body close
                }//content
            }//card
                                               
        attachments.push(card);      
    }//for loop msg.attachments(attachments);

    return attachments;
}

//greeting dialog
bot.dialog('SmalltalkDialog',[
    function (session, args, next) {  
        // session.send("welcome smalltalk"); 
        // session.send("%s",session.message.text);
        qnaClient.post({ question: session.message.text }, function (err, res) {
            if (err) {
               // console.error('Error from callback:', err);               
                session.send('wrong - something went wrong.');
                return;
            }
        
            if (res) {
                // Send reply from QnA back to user
                session.send(res);
            } else {
                // Confidence in top result is not high enough - discard result
                session.send('Hmm, I didn\'t quite understand you there. Care to rephrase?')
            }
        });
        
        
        // session.send('%s.',session.message.text);   
         session.endDialog();
    }
]).triggerAction({
    matches:'SmallTalk'
})

function getstatusURL(session,status)
{
    var url;
    if(status=="Approved" || status=="Submit")
    {
       url="http://118.67.249.4:85/UAT_VRM/assets/img/approved1.png"; 
    }
    else if(status =="Cancel")
    {
        url="http://118.67.249.4:85/UAT_VRM/assets/img/cancel.png"; 
    }
    else if(status =="Resubmit" )
    {
        url="http://118.67.249.4:85/UAT_VRM/assets/img/resubmite.png";
    }
    return url;
}


function createFamilyItem(BotId,BotName,ConversationId,UserId,UserName,UserQuery,UserResponse)  {
    var date = new Date;
        // "currentDate":start.toISOString()
        var datetime = new Date().getTime();
    var createdid = BotName + "|"+ UserId + "|" + datetime;
    console.log("createdid",createdid);
    var documentDefinition = {"id":createdid,
      "data": { 
        "BotId":BotId,
        "ConversationId":ConversationId,
        "UserID": UserId,
        "UserName": UserName,
        "UserQuery":UserQuery,
        "UserResponse":UserResponse
   }};
   try {
     var { item } =  client.database(databaseId).container(containerId).items.create(documentDefinition);
           console.log(`Created family item with id:\n${documentDefinition.id}\n`);      
   }
   catch (error) {
     console.log('Somthing getting worng',error);     
   }
  };


