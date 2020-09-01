"use strict"

const path = require("path")
const babel = require("rollup-plugin-babel")
const minify = require("rollup-plugin-babel-minify")
const resolve = require('@rollup/plugin-node-resolve');


const outputs = [
    {
        file: "./dist/vara.js",
        format: "iife",
        name: "vara",
    },
    {
        file: "./dist/vara.min.js",
        format: "iife",
        name: "vara",
        min: true,
    },
]

const shouldMinify = output => {
    return output.min ? minify() : null
}

module.exports = outputs.map(output => {
    return {
        input: path.resolve(__dirname, `./src/index.js`),
        output,
        plugins: [
            resolve(),
            babel({
                exclude: "node_modules/**",
                runtimeHelpers: true 
            }),
            shouldMinify(output),
        ],
    }
})
