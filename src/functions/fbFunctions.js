import fetch from "node-fetch";

export function quickReplies(title, quickReplies) {
  return {
    quickReplies: {
      title: title,
      quickReplies: quickReplies
    },
    platform: "FACEBOOK"
  };
}

export function fbCard(title, subtitle, img) {
  return {
    card: {
      title: title,
      subtitle: subtitle,
      imageUri: img
    },
    platform: "FACEBOOK"
  };
}

export function pushNotif(id, payload) {
  const url = "https://graph.facebook.com/v2.6/me/messages?access_token=";
  const pageAccessToken =
    "EAAHkRuPI8FUBAFTfjenED8ibP5YU490mu5jbqH04p9nEmlWZBLXf1hUI939eWCvSzuoRVTY7wXWa4jPKeJXwbqbeyhjZBLmobOdcQn1IER6gnRjFeE3ZCNbcZAgrfX59bBZCDXBTN6cu0wEDe6d62ZA4DtOxebRk8OcXJPFHhJFSZA95aaQ2XQP";

  fetch(url + pageAccessToken, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(payload)
  }).catch(e => {
    console.log(e);
  });
}

export function pushQuickReplies(id, text, replies) {
  pushNotif(id, {
    messaging_type: "UPDATE",
    recipient: {
      id: id
    },
    message: {
      text: text,
      quick_replies: replies.map(reply => {
        return {
          content_type: "text",
          title: reply,
          payload: reply
        };
      })
    }
  });
}

// export function pushMessage(id, message) {
//   var FBMessenger = require("fb-messenger");
//   var messenger = new FBMessenger();
//   ("EAAHkRuPI8FUBAFTfjenED8ibP5YU490mu5jbqH04p9nEmlWZBLXf1hUI939eWCvSzuoRVTY7wXWa4jPKeJXwbqbeyhjZBLmobOdcQn1IER6gnRjFeE3ZCNbcZAgrfX59bBZCDXBTN6cu0wEDe6d62ZA4DtOxebRk8OcXJPFHhJFSZA95aaQ2XQP");
//   messenger.sendTextMessage(id, message, function(err, body) {
//     if (err) return console.error(err);
//     console.log(body);
//   });
// }
export function pushMessage(id, text) {
  pushNotif(id, {
    messaging_type: "UPDATE",
    recipient: {
      id: id
    },
    message: {
      text: text
    }
  });
}

export function cardQuickMessages(title, img, subtitle, url, quickReply) {
  return {
    payload: {
      facebook: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: title,
                image_url: img,
                subtitle: subtitle,
                default_action: {
                  type: "web_url",
                  url: url,
                  webview_height_ratio: "tall"
                },
                buttons: [
                  {
                    type: "postback",
                    title: quickReply,
                    payload: quickReply
                  }
                ]
              }
            ]
          }
        }
      }
    }
  };
}
