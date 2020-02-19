(function () {
  // Description:
  //   Automatically post webqueue links and details when issue numbers are seen

  // Dependencies:
  //   None

  // Commands:
  //   none

  // Notes:
  //   None

  // Author:
  //   Ben Scholer <benscholer3248511@gmail.com>
  module.exports = function (robot) {
    //scp2 for downloading tickets from pier, fs for reading those downloaded tickets
    var client = require('scp2');
    var fs = require('fs');

    //Regex stuff
    var regex, multipleSameQueueRegex, subjectRegex, fromRegex, forRegex, statusRegex, shortRegex, windowsRegex;
    // The part of this in brackets [] is where different separators should be added. For example, if somebody uses a , in their ticket numbers (ce,32)
    regex = /(?:^|\b)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-|#]+?(\d{1,3})\b/gmi;
    // regex = /(?:^|\s)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-]?(\d+)($|.+)?/i;
    multipleSameQueueRegex = /(?:^|\b)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-|#]+?(\d{1,3})\b(\s|and|or|\/|-|,)*(\d{1,3})/i;
    shortRegex = /([A-Za-z]+)[\s|.|-|#]+?(\d{1,3})/i;
    subjectRegex = /Subject: .+/;
    fromRegex = /From:.+/;
    forRegex = /(?<=QAssigned-To: )(.+)/;
    statusRegex = /(?<=QStatus: )(.+)/;
    // windowsRegex = /(7|8(\.1)?|3(\.1|\.0)|10|95|98|2000|1\.0[1-4]|2\.(03|1[0|1]))$/i;

    let tickets = [];

    //Called when a new message matching the regex comes through
    return robot.hear(regex, function (res) {
      let msg = res.message.rawMessage.text;

      // See if the message has multiple items from the same queue referenced, but only that.
      if (msg.match(multipleSameQueueRegex) && res.match.length === 1) {
        let match = msg.match(multipleSameQueueRegex);
        handleTicket(match[1], match[2]);
        handleTicket(match[1], match[4]);
        //Otherwise, assume there are one or more distinct items mentioned.
      } else {
        //Separate/combine parts of the regex match, and make the URL
        tickets = res.match;
        console.log(tickets);
        var itemNumber, queue;
        // return if msg.subtype is 'bot_message'
        for (let item of res.match) {
          queue = item.match(shortRegex)[1].toLowerCase();
          itemNumber = item.match(shortRegex)[2].toLowerCase();

          handleTicket(queue, itemNumber);
        }
      }

      // Given a queue and itemNumber, download the ticket, parse it, put together a message, and ask it to be sent.
      function handleTicket(queue, itemNumber) {
        // if (queue.toLowerCase() === "windows" && itemNumber.match(windowsRegex)) return;
        let title = queue.toUpperCase() + ' ' + itemNumber;
        let url = "https://engineering.purdue.edu/webqueue/?action=show_item&queue=" + queue + "&number=" + itemNumber + "&archive=";

        // CODE WITHOUT TICKET DETAILS
        // Put together the fancy message with the button
        let newMessage = {
          "attachments": [
            {
              "fallback": title,
              "callback_id": "ticketer",
              "color": "#CEB888",
              "attachment_type": "default",
              "actions": [
                {
                  "text": title,
                  "type": "button",
                  "url": url
                }
              ]
            }
          ]
        };
        sendMessage(newMessage);
      }

      function sendMessage(message) {
        // Per sundeep, bot replies shouldn't be in threads, unless the message was already a thread.
        console.log("Message sent");
        return res.send(message);

      }
    });
  };

}).call(this);
