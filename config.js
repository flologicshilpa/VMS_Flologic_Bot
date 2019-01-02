var config = {}

config.endpoint = "https://gplflologiccosmosdbuat.documents.azure.com:443/";
config.primaryKey = "dmlyKuqhXlLQto7bY8tsZLJpM11Iq3x9FSKfllqZisN55YMrg18FfBJ6jh2u7JXWxAsnm44Um9iTijn4Geq77A==";

config.database = {
   "id": "botdocs"
};

config.container = {
  "id": "botdata"
};

config.items = {
//    "Andersen": {
//        "id": "Anderson.1",
//        "lastName": "Andersen",
//        "parents": [{
//          "firstName": "Thomas"
//      }, {
//              "firstName": "Mary Kay"
//          }],
//      "children": [{
//          "firstName": "Henriette Thaulow",
//          "gender": "female",
//          "grade": 5,
//          "pets": [{
//              "givenName": "Fluffy"
//          }]
//      }],
//      "address": {
//          "state": "WA",
//          "county": "King",
//          "city": "Seattle"
//      }
//  },
//  "Wakefield": {
//      "id": "Wakefield.7",
//      "parents": [{
//          "familyName": "Wakefield",
//          "firstName": "Robin"
//      }, {
//              "familyName": "Miller",
//              "firstName": "Ben"
//          }],
//      "children": [{
//          "familyName": "Merriam",
//          "firstName": "Jesse",
//          "gender": "female",
//          "grade": 8,
//          "pets": [{
//              "givenName": "Goofy"
//          }, {
//                  "givenName": "Shadow"
//              }]
//      }, {
//              "familyName": "Miller",
//              "firstName": "Lisa",
//              "gender": "female",
//              "grade": 1
//          }],
//      "address": {
//          "state": "NY",
//          "county": "Manhattan",
//          "city": "NY"
//      },
//      "isRegistered": false
//    }
};


 
// this.helloCosmos= function (qsn,ans,userid,userName) {
//     var start = new Date;
     
//     var id=new Date().getTime();
//     console.log('id 55',id);
//     console.log('enter 55'+qsn+" ans :"+ans+" date :-",start.toISOString());
//   var documentDefinition = {"id": "Haz5jKSodkk6"+id+"|Ask_Birdie&Ellie"+",conversationData", "data": { "userQuestion": qsn,
//        "botreply": ans,
//        "userID":userid,
//        "userName":userName,
//        "currentDate":start.toISOString()
//    }};
//   console.log('documentDefinition 39:-',documentDefinition);
//   console.log('enter 55',endpoint);
//     console.log('enter 55',masterKey);
//       console.log('enter 55',databaseId);
//         console.log('enter 59',containerId);

//    try {
//      var { item } =  client.database(databaseId).container(containerId).items.create(documentDefinition);
//            console.log(`Created family item with id:\n${documentDefinition.id}\n`);
      
//    }
//    catch (error) {
//      console.log('error 68',error);
     
//    }
// };






module.exports = config;