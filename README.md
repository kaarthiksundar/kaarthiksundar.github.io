# Personal Webpage of Kaarthik Sundar

Source code for my [homepage](https://kaarthiksundar.github.io). Styles are obtained from the [Tachyons](https://tachyons.io) CSS toolkit. Front-end
UI loading and routing is handled with [MithrilJS](https://mithril.js.org).

## Developing
First, run `npm run start`. This command rebuilds "bin/app.js" whenever any JS file in the "src/" folder changes. This will build the application in development mode. 

Next, run `npm run bs`. This serves "index.html" at `http://localhost:3000`. 

## Deploying
Run `npm run build`. This prepares a minified JS bundle script at "bin/app.js". When this built file is committed to master, the update will be visible on the page. Here, the app will be built in the production mode.

