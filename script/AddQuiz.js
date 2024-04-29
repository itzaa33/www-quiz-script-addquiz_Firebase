
var axios = require('axios');
var fs = require('fs');
var csvjson = require('csvjson');

var path = require('path');

var firebase = require('firebase');

global.XMLHttpRequest = require("xhr2");
require('firebase/firestore');
require('firebase/storage');

    firebase.initializeApp({
        apiKey: "",
        authDomain: "",
        databaseURL: "",
        projectId: "quiz",
        storageBucket: "quiz.appspot.com",
        messagingSenderId: ""
    });

    const firestore = firebase.firestore();
    firestore.settings({ timestampsInSnapshots: true });


 try {

    var data = fs.readFileSync(path.join(__dirname, 'Quiz-Table.csv'), { encoding: 'utf8' });

    if (data != null) {

        let options = {
            delimiter: ',', // optional
            quote: '"' // optional
        };

        let rows = csvjson.toObject(data, options);

        var choiceCSV = fs.readFileSync(path.join(__dirname, 'Choice-Table.csv'), { encoding: 'utf8' });

        let choice = csvjson.toObject(choiceCSV, options);

        let choiceArr = []
       
      for(let i = 0 ;i < choice.length ;i++ )
      {
        choiceArr.push(choice[i].Choice)
      }

        
        
        console.log(rows)
        const promises = []

        rows.forEach(columns => {
           
            promises.push(new Promise((resolve, reject) =>
            {
                firebase
                .storage()
                .ref('footballworldcup/image_quiz/'+ columns.Picture)
                .getDownloadURL()
                .then(url =>
                {
                    console.log (url)
                    resolve({
                        Index       :   columns.Index,
                        Picture     :   url,
                        Proposition :   columns.Proposition,
                        result_true :   columns.result_true,
                      
                    })
                })
            }))            
        });

        Promise.all(promises).then( arr => 
        {
            if(arr.length > 0 && choice.length > 0)
            {
                console.log(arr)
                const apiUrlcreat_quiz = 'https://us-central1-quiz.cloudfunctions.net/creat_quiz'
                return axios.post( apiUrlcreat_quiz , {
    
                    key         :   "key",
                    questions   :   arr,
                    choice      :   choiceArr ,
                
                })
               
            }
   
        })
        .then(res =>
        {
            console.log(res)
        })
        .catch( err => {
            console.log(err)
        })


    }
    else {
        console.log("data is null")
    }
}
catch(err)
{
    console.log("error = "+err)
}




