const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * This function activates upon the creation of a new pushID account. This will not work
 * if it overloads the same user account. If you want it to change it so it also works when
 * a data value is changed, change ".onCreate" to ".onWrite" or something and change the
 * parameters to match appropriately. 
 */
exports.scoreboard = functions.database.ref('{folderId}').onCreate((snapshot, context) => {

    // This retrieves the room and message ID and logs it into console
    const roomId = context.params.roomId;
    const messageId = context.params.messageId;
    console.log('New Message ' + messageId + ' in room ' + roomId);

    // This gets the message data values
    const messageData = snapshot.val();

    const promises = [];
    
    for (let index = 10; index > 0; index--) {

        //let leaderBoardRef = admin.database().ref('highscores/' + index);

        // This is bad code, like the uploader is telling me this is bad code.
        // and to not to delcare a function in the to the loop. 
        const p3 = admin.database().ref('highscores/' + index).once('value').then(function(snapshot) {

            tempPromises = [];

            if (messageData.score > snapshot.val().score) {

                // Above rank 10 needs to shift down 1
                if (index < 10) {

                    let prevLeaderBoardRef = admin.database().ref('highscores').child(index + 1);
    
                    const p1 = prevLeaderBoardRef.update({
                        score: snapshot.val().score,
                        userName: snapshot.val().userName
                    })
    
                    const p2 = admin.database().ref('highscores').child(index).update({
                        score: messageData.score,
                        userName: messageData.userName
                    })
    
                    // Pushes the promise
                    tempPromises.push(p1);
                    tempPromises.push(p2);
    
                // It is index 10
                } else {
                    
                    const p = admin.database().ref('highscores').child(index).set({
                        score: messageData.score,
                        userName: messageData.userName
                    })
    
                    tempPromises.push(p);
    
                }
    
            } else {
                return tempPromises;
            }

            return tempPromises;

        })

        promises.push(p3);

    }

    const all = Promise.all(promises).then(() => {
        return true;
    }).catch(er => {
        console.error('...', err);
    });

    admin.database().ref(snapshot.key).remove();

    return all;

})


    // // Original data value
    // // const original = snapshot.val();

    // rScore = snapshot.val();
    // rName = snapshot.val();

    // // References to high scores
    // //let highScoreRef = firebase.database().ref('highscores');

    // for (let index = 10; index >= 0; index--) {

    //     let highScoreRef = admin.database().ref('highscore/' + index);

    //     if (rScore > highScoreRef.child('/score').once('value')) {

    //         // Current pointer high score
    //         let tempScore = highScoreRef.ref('score');
    //         let tempName = highScoreRef.ref('userName');

    //         // If it is a number greater than 10, it swaps the two
    //         if (index < 10) {

    //             admin.database.ref('highscores/' + (index - 1) + '/score').set(tempScore);
    //             admin.database.ref('highscores/' + (index - 1) + '/score').set(tempName);

    //             // highScoreRef.ref('score').set(rScore);
    //             // highScoreRef.reg('name').set(rName);

    //             highScoreRef.set({
    //                 userName: rName,
    //                 score: rScore
    //             })

    //         // If it is score 10, then it just replaces the values
    //         } else {

    //             // Just another way to set things
    //             admin.database().ref('highscore/10').set({
    //                 userName: rName,
    //                 score: rScore
    //             })

    //         }

    //     // End the sequence if it completes
    //     } else {

    //         // If it isn't greater than that value, it doesn't do anything
    //         break;
    //     }

    // }

    // //snapshot.ref('score').remove();
    // //snapshot.ref('userName').remove();
    // //snapshot.remove();

    // return snapshot.ref.parent.child('snapshot').set(snapshot);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


// exports.helloWorld = functions.https.onRequest((request, response) => {
//     response.send("Hello from Firebase!");
// });

// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     const original = req.query.text;
//     const snapshot = await admin.database().ref('/messages').push({original: original});
//     res.redirect(303, snapshot.ref.toString());
// });

// exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
//     .onCreate((snapshot, context) => {
//         const original = snapshot.val();
//         console.log('Uppercasing', context.params.pushId, original);
//         const uppercase = original.toUpperCase();
//         return snapshot.ref.parent.child('uppercase').set(uppercase);
// })

// exports.addScore = functions.https.onRequest(async (req, res) => {
//     const original = req.query.text;
//     const snapshot = await admin.database().ref('/scores').push({original, original});
//     res.redirect(303, snapshot.ref.toString());
// })