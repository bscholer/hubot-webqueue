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

    //Regex stuff
    var regex, queueRegex, numberRegex;

    // Regex used to initially filter out the chunks of text containing ticket numbers (queue mention).
    // The part of this in brackets [] is where different separators should be added. For example, if somebody uses a , in their ticket numbers (ce,32)
    regex = /(?:^|\b)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s](\d{1,3})\b((\s|and|or|\/|-|,)*((\d{1,3})))*/gmi;
    // Regex used to grab the queue name once we already found the queue mention
    queueRegex = /(^[A-Za-z]+)(.+)/i;
    // Regex used to find the numbers that are part of the queue mention.
    numberRegex = /(\d+)/ig;

    //Called when a new message matching the regex comes through
    return robot.hear(regex, function (res) {
      console.log(JSON.stringify(res.match));
      for (let queueMention of res.match) {

        // Match the queue name
        let queueMatch = queueMention.match(queueRegex);
        // Get the queue name
        let queue = queueMatch[1].toLowerCase();
        // Get the string of numbers after.
        let numbers = queueMatch[2];
        // Match the individual numbers from the string of them.
        let numbersMatch = numbers.match(numberRegex);
        // Iterate over each and send details to handleTicket()
        for (let itemNumber of numbersMatch) {
          handleTicket(queue, itemNumber);
        }
      }

      // Given a queue and itemNumber, download the ticket, parse it, put together a message, and ask it to be sent.
      function handleTicket(queue, itemNumber) {
        // if (queue.toLowerCase() === "windows" && itemNumber.match(windowsRegex)) return;
        let title = queue.toUpperCase() + ' ' + itemNumber;
        let url = "https://engineering.purdue.edu/webqueue/?action=show_item&queue=" + queue + "&number=" + itemNumber + "&archive=";

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
