# Hubot Webqueue

Hubot Webqueue (aka webqueue-linker) is a chat bot built on the [Hubot][hubot] framework. It was
initially generated by [generator-hubot][generator-hubot], and configured to be
deployed on Windows.

[hubot]: http://hubot.github.com
[generator-hubot]: https://github.com/github/generator-hubot

### Running Hubot Webqueue Locally

You can start Hubot Webqueue locally by running, replacing TOKEN with the token provided to you on the Hubot configuration's page on Slack:

    % $env:HUBOT_SLACK_TOKEN = 'xoxb-TOKEN'; .\bin\hubot -a slack

### Scripting

The main script is at `scripts/webqueuelinks.js`.
