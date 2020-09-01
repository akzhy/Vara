//# sourceMappingURL=./vara.js.map

class Vara {
    constructor(elem, fontSource, text, options){
        this.elemntName = elem;
        this.element = document.querySelector(elem);
        this.fontSource = fontSource;
        this.options = options;
        this.textItems = text;
        this.rendered = false;

        this.defaultOptions = {
            fontSize: 21,
            strokeWidth: 0.5,
            color: "#000",
            id: false,
            duration: 1000,
            textAlign: "left",
            x: 0,
            y: 0,
            fromCurrentPosition: {
                x: true,
                y: true,
            },
            autoAnimation: true,
            queued: true,
            delay: 0,
            breakWord: false,
            letterSpacing: {
                "global": 0,
            }
        }

        this.defaultCharacters = {
            "63" : {
                "paths": [{
                    "w": 8.643798828125,
                    "h": 14.231731414794922,
                    "my": 22.666500004827977,
                    "mx": 0,
                    "pw": 28.2464542388916,
                    "d": "m 0,0 c -2,-6.01,5,-8.64,8,-3.98,2,4.09,-7,8.57,-7,11.85"
                }, {
                    "w": 1.103759765625,
                    "h": 1.549820899963379,
                    "my": 8.881500004827977,
                    "mx": 1,
                    "pw": 4.466640472412109,
                    "d": "m 0,0 a 0.7592,0.7357,0,0,1,0,0.735,0.7592,0.7357,0,0,1,-1,-0.735,0.7592,0.7357,0,0,1,1,-0.738,0.7592,0.7357,0,0,1,0,0.738 z"
                }],
                "w": 8.643798828125
            },
            "space": {
                "paths": [{
                    get d(){
                        if(this.rendered){
                            return "M0,0 l" + this.fontProperties.space + " 0"
                        }
                        return false;
                    },
                    mx: 0,
                    my: 0,
                    get w(){
                        if(this.rendered){
                            return this.fontProperties.space
                        }
                        return false;
                    },
                    h: 0
                }],
                get w(){
                    if(this.rendered){
                        return this.fontProperties.space
                    }
                    return false;
                },
            }
        }

        this.svg = this.createNode("svg", {
            width: "100%"
        })

        this.element.appendChild(this.svg);

        this.init();
    }

    init(){
        const xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', this.fontSource, true);
        xmlhttp.onreadystatechange = () => {
            if (xmlhttp.readyState == 4) {
                if (xmlhttp.status == 200) {
                    const contents = JSON.parse(xmlhttp.responseText)
                    this.fontCharacters = contents.c;
                    this.fontProperties = contents.p;
                    this.render();
                }
            }
        };
        xmlhttp.send(null);
    }

    render(){

        this.normalize();

        this.getLineCharacteristics(this.textItems[1]);

    }


    normalize(){

        this.options = this.options || {};

        Object.keys(this.defaultOptions).forEach(option => {

            if(this.options[option] === undefined)
                this.options[option] = this.defaultOptions[option];
        })

        this.textItems.forEach((textItem,i) => {

            if(typeof textItem === "string"){
                this.textItems[i] = {
                    text: textItem,
                    ...this.defaultOptions
                }
            } else if(typeof textItem === "object") {
                Object.keys(this.options).forEach(option => {
                    if(textItem[option] === undefined)
                        this.textItems[option] = this.options[option];
                })
            }

        })

        Object.keys(this.defaultCharacters).forEach(character => {

            if(this.fontCharacters[character] === undefined){
                this.fontCharacters[character] = this.defaultCharacters[character];
            }

        })
    }

    getLineCharacteristics(textItem){
        
        this.canvasOriginalWidth = this.svg.getBoundingClientRect().width;

        if(!textItem.breakWord) {

            const textBlock = typeof textItem.text === "string" ? [textItem.text] : textItem;

            const breakedTextBlock = textBlock.map(line => {
                return line.split(" ");
            })

            let lineWidth = 0;

            breakedTextBlock.forEach(word => {
                let wordWidth = 0;

                [...word].forEach(letter => {
                    const charCode = letter.charCodeAt(0);
                    
                    const currentLetter = this.fontCharacters[charCode] || this.fontCharacters["63"];

                    
                })

            })

        }

    }


    createNode(n,v){
        n = document.createElementNS("http://www.w3.org/2000/svg", n);
        for (var p in v)
            n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) {
                return "-" + m.toLowerCase();
            }), v[p]);
        return n
    }
}

if (typeof module !== 'undefined') {
    module.exports = Vara;
} else {
    window.Vara = Vara;
}