# a habit keeper app [inspired](#why) by [Everyday](https://everyday.app) habit app

first time using deno

i have not used a javascript framework in my entire life, thanks to this project maybe i can see the benefits of using one
i hate unnecessary web apps, they annoy me as a user and will annoy me if i will have to use them as an api or something probably i don't know. what i want to say is that `habit-keeper` is made with requests because i see it more or less as an universal api

i wish you a good life and successful new habits or something

# TODO
- test creating a habit because i think something is wrong with the startingDate
- add option in config to enable/disable user registration
- add quick habit management (rename, create, colors?)
- actually check if a color function is dynamic. also i have to somehow store the arguments
- add a button for logging out
- add more color schemas
- add support for external api to automatically create offsets?
- possibly split code into two (branches?), one with only api and the other one this or just client? DO THIS BEFORE CREATING A RELEASE!!!!!!
- add views - should they be on the server? yes, but add it in the server config as an option
- write the thing in the deno file for normal running or whatever
- add view creator
- check the bug where default login does not work (look into requests in the browser), but it's hard to reproduce
- add like combined habits or something
- test the editor
- css
- add a screenshot to this file <- no because i can't with the GUIs i'm so bad
- add more colors
- maybe require some kind of additional confirmation in requests to perform more dangerous actions
- check if very bad requests crash the server
- create a release
- FOCUS ON MAKING IT USABLE and then improve
- variable habit length? in smaller intervals than 1 day if i'm crazy enough
- replace all console.warn with just assert()
- add clean up for expired tokens
- add admin control panel
- add data file backups
- write documentation
    - json schema
    - decrypting datafile locally
    - actions
- should i add a log (history) on the client side to display the status of changes?
- should i create some sort of teams/groups?
- should i create real integration between some apps, for automatic habiting?
- IS THERE GOING TO BE A RACE CONDITION???????????????????? (if yes, maybe with each getData thing also response with datafile hash or something and when an action is performed check if hashes are equal, if yes then proceed, else disregard action and refresh data)

# IMPORTANT (for me):
## PERMISSIONS:
1. read (1)
2. write (2)

## ADMIN PERMISSIONS:
1. read (1)

# why
because i saw it. it was beautiful. and then i got angry because it wasn't open source and i want it to run locally
if i'm wrong, please tell me somehow, maybe through issues on github
also it's very likely that i will copy the design, because it would be very hard to come up with a better one, maybe even impossible
