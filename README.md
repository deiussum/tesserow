# Deiussum.PatternMaker

Mosaic Pattern Maker for Crocheting

## Project notes

This project is a work in progress.  The goal is to create a tool that will allow you to create a mosaic pattern for crocheting.  The tool will allow you to import an image.  It will then generate a pattern that you can use to crochet the image.

## Deiussum.PatternMaker.ElectronReact

This is the main desktop application.  It is written using Electron and React.  

To run this:

- From a console, change to the `Deiussum.PatternMaker.ElectronReact` directory
- Run `npm install` to install all of the dependencies.  
- Run `npm start` to run the application.

## Deiussum.PaternMaker.WebApi

This is a dotnet WebApi application that will eventually be used to verify licensing, provide data for the main web page etc.  It is currently a work in progress.

To run this, simply change to the `Deiussum.PatternMaker.WebApi` directory and run `dotnet run`

## Deiussum.PatternMaker.WebNext

This is a NextJS application that will serve as the web page for info on the application, where to download, how to register, etc.

To run this:

- From a console, change to the `Deiussum.PatternMaker.WebNext` directory.
- Run `npm install` to install all of the dependencies.  
- Run `npm start` to run the web app.
- In a browser window, open up the URL indicated in the console.
