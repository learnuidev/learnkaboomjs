# Learn and Understand KaboomJS

In this tutorial series, we will learn and understand the internals of KaboomJS. We will look at every namespace in the source code.

We will be using version 0.6 (this is the latest version as of 2021/07/28), but this will change as the time passes.

## Introduction

KaboomJS is a JavaScript library for making interactive apps. you can make 2d games, slideshows etc..

## KaboomJS 0.6 namespaces (9)

To view all the namespace go to src/kaboomV6. Number in parens represent LOC. This helps better understand which files are small/large

- app.js (332) - responsible for registering event handlers
- assets.js (271) - loaders
- audio.js (202) - audio module
- gfx.js (825) - graphics (most complex)
- kaboom.js (2151) - core library. we are importing this file when we use kaboom
- logger.js (83)
- math.js (587)
- net.js (76) - multiplayer
- utils.js (28) - contains one function called deepEq, which gets used in one file (gfx.js)
