let _element_stack = []

/**
 * A raw value to be shown
 * @param  {string} text What values to be displayed
 */
function v(...text) {
    if(_element_stack.length > 0) {
        const textNode = document.createTextNode(text.join(', '))
        _element_stack[_element_stack.length-1].push(textNode)
        return textNode
    }
}

/**
 * 
 * @param {*} args 
 * @returns {{
 *  body: (function():HTMLElement?)?,
 *  attrs: object?
 * }}}
 */
function parseComponentArgs(args) {
    const unsupportedArgs = args.filter(a => !(typeof a == 'function' || (typeof a == 'object' && !Array.isArray(a))))
    if(unsupportedArgs.length) throw new Error(`Unsupported element generator arguments: ${unsupportedArgs.join(', ')}`)
    
    if(args.filter(a => typeof a == 'function').length > 1) throw new Error(`Only one element body function can be present, more were found`)
    const body = args.find(a => typeof a == 'function')

    if(args.filter(a => typeof a == 'object' && !Array.isArray(a)).length > 1) throw new Error(`Only one element attribute object can be present, more were found`)
    const attrs = args.find(a => typeof a == 'object' && !Array.isArray(a))

    return {body, ...attrs}
}

/** @type {HTMLElementTagNameMap} */
const e = new Proxy({}, {
    get(_, tagName) {
        const element = document.createElement(tagName)

        return (...args) => {
            const {body, ...attrs} = parseComponentArgs(args)

            if(body) {
                _element_stack.push([])
                body()
                const children = _element_stack.pop()
                children.forEach(child => {
                    element.appendChild(child)
                })
            }

            if(attrs) {
                if('style' in attrs && typeof(attrs.style) !== 'string') attrs.style = stylesheet(attrs.style)
                for(let attrName in attrs) {
                    if(attrName.startsWith('$')) {
                        element.addEventListener(attrName.slice(1), attrs[attrName])
                    } else {
                        element.setAttribute(attrName, attrs[attrName])
                    }
                }
            }

            if(_element_stack.length > 0) {
                _element_stack[_element_stack.length-1].push(element)
            }

            return element
        }
    }
})

/**
 * @typedef {Object} Styles
 * @property {string} accentColor - Specifies an accent color for user-interface controls
 * @property {"stretch"|"center"|"flexStart"|"flexEnd"|"spaceBetween"|"spaceAround"|"spaceEvenly"|"initial"|"inherit"} alignContent - Specifies the alignment between the lines inside a flexible container when the items do not use all available space
 * @property {"normal"|"stretch"|"center"|"flexStart"|"flexEnd"|"start"|"end"|"baseline"|"initial"|"inherit"} alignContent - Specifies the alignment for items inside a flexible container
 * @property {"auto"|"stretch"|"center"|"flexStart"|"flexEnd"|"baseline"|"initial"|"inherit"} alignSelf - Specifies the alignment for selected items inside a flexible container
 * @property {"initial"|"inherit"|"unset"} all - Resets all properties (except unicode-bidi and direction)
 * @property {string} animation - A shorthand property for all the animation-* properties
 * @property {string} animationDelay - Specifies a delay for the start of an animation
 * @property {"normal"|"reverse"|"alternate"|"alternate-reverse"|"initial"|"inherit"} animationDirection - Specifies whether an animation should be played forwards, backwards or in alternate cycles
 * @property {string} animationDuration - Specifies how long an animation should take to complete one cycle
 * @property {"none"|"forwards"|"backwards"|"both"|"initial"|"inherit"} animationFillMode - Specifies a style for the element when the animation is not playing (before it starts, after it ends, or both)
 * @property {number} animationIterationCount - Specifies the number of times an animation should be played
 */

/**
 * @param {Styles} object 
 * @returns 
 */
function stylesheet(object) {
    const camelCaseToKebabCase = (str) => str.replace(/([A-Z])/g, (_, letter) => `-${letter.toLowerCase()}`)
    let strings = [];
    for(let property in object) {
        const realProperty = camelCaseToKebabCase(property)
        strings.push(`${realProperty}: ${object[property]}`)
    }
    return strings.join('; ')
}

let _mount_listener_stack = []

function onMount(callback) {
    if(_mount_listener_stack.length < 1) throw new Error(`No mounts to listen to`)
    _mount_listener_stack[_mount_listener_stack.length-1].push(callback)
}

/**
 * 
 * @param {HTMLElement|string}} target 
 * @param {function(): HTMLElement?} renderer 
 */
function add(target, renderer) {
    if(typeof renderer != 'function') throw new Error(`Renderer must be a callback function`)

    if(typeof target == 'string') target = document.querySelector(target)
    if(!(target instanceof HTMLElement)) throw new Error('Invalid target')

    _element_stack.push([])
    _mount_listener_stack.push([])
    renderer()
    const elements = _element_stack.pop()
    for(let element of elements) {
        target.appendChild(element)
    }
    const mountListeners = _mount_listener_stack.pop()
    mountListeners.forEach(listener => {
        listener()
    })

    return target
}