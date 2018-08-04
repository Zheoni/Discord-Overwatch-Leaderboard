This is a projet in wich I aim to learn JavaScript while making a useful bot
for the discord app. I'm using node.js with discord.js and overwatch-js.

The leadeboard that you will see is like this one:
![image](https://i.imgur.com/Q0tDYvA.png)

# How To
Download this repository. Install node (this is tested with 8.11.3) and npm. Then use on a terminal, in the bot folder:

`npm install`

**Create the botconfig.json** like this one, but replace with your bot token (find it in discord.com/developers) and the prefix you want:
```json
{
  "token": "yourwonderfultoken",
  "prefix": "anytingyouwantbeforethecomands"
}
```

Then, for starting the bot use:

`node index.js`

And the bot is running. Add it to the server and the command help (after the prefix) will show you the commnands!
## Disclaimer
This is just a little project, probably there are errors. The data is not protected in any way, its just in a json file in the bot folder. I cannot afford to host the bot for all of you, you have to host it. The bot is not tested working in many server at the same time, but it should work.
