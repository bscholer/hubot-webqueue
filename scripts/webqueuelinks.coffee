# Description:
#   Automatically post jira links when issue numbers are seen
#
# Dependencies:
#   None
#
# Commands:
#   none
#
# Notes:
#   None
#
# Author:
#   Brad Clark <bdashrad@gmail.com>

module.exports = (robot) ->

  regex = ///
    (?:^|\s) # start of line or space
    (aae|abe|acmaint|alexa|app|backup|bidc|bio|bme|ce|cgt|che|cnit|comm|coral|dave|doe|dp|dpweb|ece|ecnaccts|eee|emacs|ene|epics|flex|graddb|hardware|helpdesk|ie|imi|ipad-help|itap|latex|linux|machelp|mailman|mathematica|me|mecl|mse|ne|perl|portals|potr|price|printers|queue|root-mail|sitemgrs|software|sscan|steam|swt|tech|trash|uds|udsprojects|vet|vprweb|wang|webmaster|webmse|webprojects|windows|zsite)
    [\s|.|-]?
    (\d+) # one or more digits
    \b # word boundary
    ///i # case insensitive

  robot.hear regex, (res) ->
    # return if msg.subtype is 'bot_message'
    queue = res.match[1].toUpperCase()
    itemNumber = res.match[2]
    title = queue + ' ' + itemNumber
    url = "https://engineering.purdue.edu/webqueue/?action=show_item&queue=" + queue + "&number=" + itemNumber + "&archive="
    newMessage = {"attachments": [{"fallback": "Ticket URL","callback_id": "ticketer", "color": "#3AA3E3", "attachment_type": "default", "actions": [{"text": title, "type": "button", "url": url}]}]}
    res.send newMessage
