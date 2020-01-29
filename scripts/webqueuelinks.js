(function () {
  // Description:
  //   Automatically post jira links when issue numbers are seen

  // Dependencies:
  //   None

  // Commands:
  //   none

  // Notes:
  //   None

  // Author:
  //   Ben Scholer <benscholer3248511@gmail.com>
  module.exports = function (robot) {
    var regex;
    // The part of this in brackets [] is where different separators should be added. For example, if somebody uses a , in their ticket numbers (ce,32)
    regex = /(?:^|\s)(aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)[\s|.|-]?(\d+)\b/i; // start of line or space // case insensitive
    return robot.hear(regex, function (res) {
      var itemNumber, newMessage, queue, title, url;
      // return if msg.subtype is 'bot_message'
      queue = res.match[1].toLowerCase();
      itemNumber = res.match[2];
      title = queue.toUpperCase() + ' ' + itemNumber;
      url = "https://engineering.purdue.edu/webqueue/?action=show_item&queue=" + queue + "&number=" + itemNumber + "&archive=";
      newMessage = {
        "attachments": [
          {
            "fallback": "Ticket URL",
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
      if (res.message.thread_ts) {
        return res.send(newMessage);
      } else {
        res.message.thread_ts = res.message.id;
        return res.send(newMessage);
      }
    });
  };

}).call(this);
