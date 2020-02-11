![](vara.gif)
# Vara 
![](https://img.shields.io/badge/Vara.js-1.2.2-brightgreen.svg) ![](https://img.shields.io/badge/License-MIT-blue.svg) [![Paypal Donate](https://img.shields.io/badge/Donate-paypal-9c27b0.svg)](https://www.paypal.me/akzhy/10)

Vara is a javascript library that can create text drawing animations

#### [Website](http://vara.akzhy.com) | [Examples](http://vara.akzhy.com/examples) | [Codepen 1](https://codepen.io/akzhy/pen/YdbYbj) | [Codepen 2](https://codepen.io/akzhy/pen/OrdYGO)


## Installation and Basic usage

**Using NPM**

```
npm install vara --save
```

Or download and include the library as follows

```html
<script src="./src/vara.min.js" type="text/javascript"></script>
<!-- Or jsdelivr -->
<script src="https://cdn.jsdelivr.net/gh/akzhy/vara@master/src/vara.min.js" type="text/javascript"></script>
```
```javascript
new Vara("#element","font.json",[{
	text:"Handwritten"
}],{
	fontSize:46
});
```

The first argument, #element is the container element for the SVG.

The font used is a specially created JSON file that contains the information needed to create the text. It is included by passing the URL of the font as the second argument.
A few custom fonts are available in the Github repository, more will be added soon. Creation of custom fonts are explained [here](http://vara.akzhy.com/creating-fonts).

The third argument is an array of objects, where each object will represent a block of text to be drawn. The text to be drawn is passed as the text property.

The last argument is an object to provide the options like fontSize,color etc.

## Options

```javascript
new Vara("#container","font.json",[
{
	text:"Hello World", // String, text to be shown
	fontSize:24, // Number, size of the text
	strokeWidth:.5, // Width / Thickness of the stroke
	color:"black", // Color of the text
	id:"", // String or integer, for if animations are called manually or when using the get() method. Default is the index of the object.
	duration:2000, // Number, Duration of the animation in milliseconds
	textAlign:"left", // String, text align, accepted values are left,center,right
	x:0, // Number, x coordinate of the text
	y:0, // Number, y coordinate of the text
	fromCurrentPosition:{ // Whether the x or y coordinate should be from its calculated position, ie the position if x or y coordinates were not applied
		x:true, // Boolean
		y:true, // Boolean
	},
	autoAnimation:true, // Boolean, Whether to animate the text automatically
	queued:true, // Boolean, Whether the animation should be in a queue
    delay:0,     // Delay before the animation starts in milliseconds
    /* Letter spacing can be a number or an object, if number, the spacing will be applied to every character.
    If object, each letter can be assigned a different spacing as follows,
    letterSpacing: {
        a: 4,
        j: -6,
        global: -1
    }
    The global property is used to set spacing of all other characters
    */
	letterSpacing:0
}],{
	// The options given below will be applicable to every text created,
	// however they will not override the options set above.
	// They will work as secondary options.
	fontSize:24, // Number, size of the text
	strokeWidth:.5, // Width / Thickness of the stroke
	color:"black", // Color of the text
	duration:2000, // Number, Duration of the animation in milliseconds
	textAlign:"left", // String, text align, accepted values are left,center,right
	autoAnimation:true, // Boolean, Whether to animate the text automatically
	queued:true, // Boolean, Whether the animation should be in a queue
	letterSpacing:0
})
```

## Methods

#### `.ready(function)`
Is used to execute a function when the font is loaded and the elements are created.

**Any other method should be called inside this function.**

----

#### `.get(id)`
Returns an object with properties `characters` and `container`.

`characters` is an array of svg `g` elements, each representing a letter and container is an svg `g` wrapping the text block.
If an id was given to the text during creation, it should be given as the argument, otherwise use the index of the text block.

----

#### `.draw(id)`
Used to animate texts with `autoAnimation:false`.

If an `id` was given to the text during creation it should be given as the argument, otherwise use the index of the text block.

----

#### `.animationEnd(function(i,o){})`
Used to execute a function once animation ends, triggers every time a block of text is drawn.
Has two arguments,

`i` - The id of the drawn text.

`o` - The object described in the `get()` method.

----

#### `.playAll()`
*Introduced in v1.1.0*

Is used to play the animation of every text block, obeying `delay` and `queue`

## Sponsors

Browser testing provided by 

<a href="http://browserstack.com/" title="Browserstack">
	<img src="./browserstack.png" width="240" alt="Browserstack Logo"/>
</a>


## Contact
If you find an issue or a bug or want to suggest a new feature, you can
* [Raise an issue](https://github.com/akzhy/Vara/issues)
* [Contact me through my webpage](http://www.akzhy.com/contact/)
* [Contact by Email](mailto:hi@akzhy.com)
* [Comment on relevant page](http://vara.akzhy.com/)
* [Contact through twitter](https://twitter.com/_akzhy)

If you would like to have a specific font created, you can mail me with the details and i will try to create it, if the font have a suitable license.
