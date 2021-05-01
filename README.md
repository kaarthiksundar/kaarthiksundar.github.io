# kaarthiksundar.github.io

Source code for my [homepage](https://kaarthiksundar.github.io). Styles are obtained from the [Tachyons](https://tachyons.io) CSS toolkit. Front-end
UI loading and routing is handled with [MithrilJS](https://mithril.js.org).

## Developing
First, run `npm run start`. This command rebuilds "bin/app.js" whenever any JS file in the "src/" folder changes. 

Next, run `npm run bs`. This launches firefox and serves "index.html" at
`https://localhost:3000`. This command uses Browsersync to reload the webpage whenever "index.html", "bin/app.js" or any asset files change.

## Deploying
Run `npm run build`. This prepares a minified JS bundle script at "bin/app.js". When this built file is committed to master, the update will be visible on the page. 

