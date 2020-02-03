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
    var regex, multipleSameQueueRegex, subjectRegex, fromRegex, forRegex, statusRegex, shortRegex;
    // The part of this in brackets [] is where different separators should be added. For example, if somebody uses a , in their ticket numbers (ce,32)
    regex = /(?:^|\b)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-]?(\d{1,3})\b/gmi;
    // regex = /(?:^|\s)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-]?(\d+)($|.+)?/i;
    multipleSameQueueRegex = /(?:^|\b)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-]?(\d{1,3})\b(\s|and|or|\/|-|,)*(\d{1,3})/i;
    shortRegex = /([A-Za-z]+)[\s|.|-]?(\d{1,3})/i;
    subjectRegex = /Subject: .+/;
    fromRegex = /From:.+/;
    forRegex = /(?<=QAssigned-To: )(.+)/;
    statusRegex = /(?<=QStatus: )(.+)/;

    //Called when a new message matching the regex comes through
    return robot.hear(regex, function (res) {
      let msg = res.message.rawMessage.text;

      if (msg.match(multipleSameQueueRegex)) {
        let match = msg.match(multipleSameQueueRegex);
        handleTicket(match[1], match[2]);
        handleTicket(match[1], match[4]);
      } else {
        //Separate/combine parts of the regex match, and make the URL
        console.log(res.match);
        var itemNumber, queue;
        // return if msg.subtype is 'bot_message'
        for (let item of res.match) {
          queue = item.match(shortRegex)[1].toLowerCase();
          itemNumber = item.match(shortRegex)[2].toLowerCase();

          handleTicket(queue, itemNumber);
        }
      }

      function handleTicket(queue, itemNumber) {
        let title = queue.toUpperCase() + ' ' + itemNumber;
        let url = "https://engineering.purdue.edu/webqueue/?action=show_item&queue=" + queue + "&number=" + itemNumber + "&archive=";
        // Download the ticket's file from pier
        client.scp("bscholer:@pier.ecn.purdue.edu:/home/pier/e/queue/Mail/" + queue + "/" + itemNumber, './' + queue + itemNumber, function (err) {
          // If anything went wrong (almost always when someone posts a ticket that doesn't exist), just return.
          if (err) {
            console.error(err);
            sendMessage({"text": "Item " + title + " doesn't exist in the queue."});
            return;
          }

          let subject, fromPerson, forPerson, status;
          // Open and read the downloaded file
          fs.readFile('./' + queue + itemNumber, {encoding: 'utf-8'}, function (err, data) {
            // If it worked
            if (!err) {
              // Get the subject, from, for, and status lines
              subject = data.match(subjectRegex);
              fromPerson = data.match(fromRegex);
              forPerson = data.match(forRegex);
              status = data.match(statusRegex);

              // For debugging
              // console.log("FROM");
              // console.log(fromPerson);
              // console.log("FOR");
              // console.log(forPerson);
              // console.log("SUBJECT");
              // console.log(subject);
              // console.log("STATUS");
              // console.log(status);

              // Come up with a message to send
              let messageText = "";
              if (fromPerson) messageText += fromPerson[0];
              if (forPerson) messageText += "\nFor: " + forPerson[0];
              if (subject) messageText += "\n" + subject[0];
              if (status) messageText += "\nStatus: " + status[0];

              console.log("----------------");
              console.log(title);
              console.log(res.message.rawMessage.text);

              // Put together the fancy message with the button
              let newMessage = {
                "attachments": [
                  {
                    "text": messageText,
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
            } else {
              console.error(err);
            }
          });

          // Delete the downloaded ticket
          fs.unlink('./' + queue + itemNumber, function (err) {
            if (err) console.error(err);
          });
        });
      }

      function sendMessage(message) {
        // Don't try to send the message in a thread if it already is one.
        if (res.message.thread_ts) {
          console.log("Message sent");
          return res.send(message);
        } else {
          res.message.thread_ts = res.message.id;
          console.log("Message sent");
          return res.send(message);
        }
      }
    });
  };

}).call(this);
