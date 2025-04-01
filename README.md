# a habit keeper app [inspired](#why) by [Everyday](https://everyday.app) habit app

## currently broken i think `3c77dc4` commit is the last one that's usable, sorry i will try to finish this refactoring a bit faster

first time using deno

i have not used a javascript framework in my entire life, thanks to this project maybe i can see the benefits of using one
i hate unnecessary web apps, they annoy me as a user and will annoy me if i will have to use them as an api or something probably i don't know. what i want to say is that `habit-keeper` is made with requests because i see it more or less as an universal api

i wish you a good life and succesful new habits or something

# TODO
- test creating a habit because i think something is wrong with the startingDate
- add option in config to enable/disable user registration
- mask data file names with a hash
- CHOSEN VIEW ARCHITECTURE?
    - views
    - no signals
    - new sites (nevermind not necessarily just return the element)
    - no live updates
    - subgrid
- add views - should they be on the server? yes, but add it in the server config as an option
- write the thing in the deno file for normal running or whatever
- check the bug where default login does not work (look into requests in the browser), but it's hard to reproduce
- add a screenshot to this file
- add user registration
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
- IS THERE GOING TO BE A RACE CONDITION???????????????????? (if yes, maybe with each getData thing also response with datafile hash or something and when an action is performed check if hashes are equal, if yes then proceed, else disregard action and refresh data)

# IMPORTANT (for me):
## PERMISSIONS:
1. read (1)
2. write (2)

## ADMIN PERMISSIONS:
1. read (1)

# why
because i saw it. it was bautiful. and then i got angry because it wasn't open source and i want it to run locally
if i'm wrong, please tell me somehow, maybe through issues on github
also it's very likely that i will copy the design, because it would be very hard to come up with a better one, maybe even impossible
