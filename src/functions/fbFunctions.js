import fetch from 'node-fetch';

export function quickReplies(title, quickReplies){
	return {
		"quickReplies": {
          "title": title,
		  "quickReplies": quickReplies,
		},
		"platform": "FACEBOOK"
	  }
}

export function fbCard(title, subtitle, img){
	return {
        "card": {
            "title": title,
            "subtitle": subtitle,
            "imageUri": img
        },
        "platform": "FACEBOOK"
      };
}

export function pushNotif(id, payload) {
	const url = 'https://graph.facebook.com/v2.6/me/messages?access_token=';
	const pageAccessToken = 'EAAHkRuPI8FUBAFyiJy8Mjz2B7LpIHn680ZAUqweJdrsCC8FcsCTy5d6VguZAXpIwnXqBtOZB9LJscvzkLFRH2MauOSCcMUPJQxxgH2fkbCjcNGJFh1qAwXinppfTySc6ttdT0v7ZBKXJ6XZAvSmISrdiZBHRo2mJtbaX6XaVeNhOR5SVZClSY6K'
	
	fetch(url + pageAccessToken, {
		headers: { 'Content-Type': 'application/json' },
		method: "POST",
		body: JSON.stringify(payload)	  	
	})
		.catch((e) => { console.log(e); });
}

export function pushQuickReplies(id, text, replies, img) {
	pushNotif(id, {
		messaging_type: 'UPDATE',
		recipient: {
			id: id
		},
		message: {
			text: text,
			quick_replies: replies.map(reply => {
				return {
					content_type: 'text',
					image_url:img,
					title: reply,
					payload: reply
				}
			})
		}
	});
}


export function pushMessage(id, text) {
	pushNotif(id, {
		messaging_type: 'UPDATE',
		recipient: {
			id: id
		},
		message: {
			text: text,
		}
	});
}

export function cardQuickMessages(title, img, subtitle, url, quickReply){
	return {'fulfillmentMessages': [{
        'payload': {
            "facebook": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [           {
                            "title": title,
                            "image_url": img,
                            "subtitle": subtitle,
                            "default_action": {
                              "type": "web_url",
                              "url": url,
                              "webview_height_ratio": "tall",
                            },
                            "buttons":[
                              {
                                "type":"postback",
                                "title": quickReply,
                                "payload": quickReply
                              }              
                            ]}]
                    }
                }
            }
        }
        }]
    }
}