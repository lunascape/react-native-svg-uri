'use strict'
import React, { Component } from 'react'
import { View } from 'react-native'
import PropTypes from 'prop-types'
import xmldom from 'xmldom'
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'

import Svg, {
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Use,
  Defs,
  Stop
} from 'react-native-svg'

import * as utils from './utils'

const ACEPTED_SVG_ELEMENTS = [
  'svg',
  'g',
  'circle',
  'path',
  'line',
  'rect',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'ellipse',
  'polygon'
]

// Attributes from SVG elements that are mapped directly.
const SVG_ATTS = ['viewBox']
const G_ATTS = ['id']

const CIRCLE_ATTS = ['cx', 'cy', 'r']
const PATH_ATTS = ['d']
const LINE_ATTS = ['x1', 'x2', 'y1', 'y2']
const RECT_ATTS = ['width', 'height']
const LINEARG_ATTS = ['id', 'x1', 'y1', 'x2', 'y2', 'gradientUnits']
const RADIALG_ATTS = ['id', 'cx', 'cy', 'r', 'gradientUnits']
const STOP_ATTS = ['offset', 'stopColor']
const ELLIPSE_ATTS = ['cx', 'cy', 'rx', 'ry']

const POLYGON_ATTS = ['points']
const POLYLINE_ATTS = ['points']

const COMMON_ATTS = ['fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeOpacity', 'strokeLinecap', 'strokeLinejoin',
  'strokeDasharray', 'strokeDashoffset', 'x', 'y', 'rotate', 'scale', 'origin', 'originX', 'originY']

let ind = 0

class SvgUri extends Component {

  constructor (props) {
    super(props)

    this.state = {
      svgXmlData: props.svgXmlData
    }

    this.createSVGElement = this.createSVGElement.bind(this)
    this.obtainComponentAtts = this.obtainComponentAtts.bind(this)
    this.inspectNode = this.inspectNode.bind(this)
    this.fecthSVGData = this.fecthSVGData.bind(this)

    this.isComponentMounted = false

    // Gets the image data from an URL or a static file
    if (props.source) {
      const source = resolveAssetSource(props.source) || {}
      this.fecthSVGData(source.uri)
    }
  }

  componentWillMount () {
    this.isComponentMounted = true
  }

  componentWillUnmount () {
    this.isComponentMounted = false
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.source) {
      const source = resolveAssetSource(nextProps.source) || {}
      const oldSource = resolveAssetSource(this.props.source) || {}
      if (source.uri !== oldSource.uri) {
        this.fecthSVGData(source.uri)
      }
    }
  }

  async fecthSVGData (uri) {
    let responseXML = null
    try {
      let response = await fetch(uri)
      responseXML = await response.text()
    } catch (e) {
      console.error('ERROR SVG', e)
    } finally {
      if (this.isComponentMounted) {
        this.setState({svgXmlData: responseXML})
      }
    }

    return responseXML
  }

  createSVGElement (node, childs, styleClasses) {
    let componentAtts = {}
    let i = ind++
    switch (node.nodeName) {
      case 'svg':
        componentAtts = this.obtainComponentAtts(node, SVG_ATTS, styleClasses)
        if (this.props.width)
          componentAtts.width = this.props.width
        if (this.props.height)
          componentAtts.height = this.props.height

        return <Svg key={i} {...componentAtts}>{childs}</Svg>
      case 'g':
        componentAtts = this.obtainComponentAtts(node, G_ATTS, styleClasses)
        return <G key={i} {...componentAtts}>{childs}</G>
      case 'path':
        componentAtts = this.obtainComponentAtts(node, PATH_ATTS, styleClasses)
        return <Path key={i} {...componentAtts}>{childs}</Path>
      case 'line':
        componentAtts = this.obtainComponentAtts(node, LINE_ATTS, styleClasses)
        return <Line key={i} {...componentAtts}>{childs}</Line>
      case 'circle':
        componentAtts = this.obtainComponentAtts(node, CIRCLE_ATTS, styleClasses)
        return <Circle key={i} {...componentAtts}>{childs}</Circle>
      case 'rect':
        componentAtts = this.obtainComponentAtts(node, RECT_ATTS, styleClasses)
        return <Rect key={i} {...componentAtts}>{childs}</Rect>
      case 'defs':
        return <Defs key={i}>{childs}</Defs>
      case 'linearGradient':
        componentAtts = this.obtainComponentAtts(node, LINEARG_ATTS, styleClasses)
        return <LinearGradient key={i} {...componentAtts}>{childs}</LinearGradient>
      case 'radialGradient':
        componentAtts = this.obtainComponentAtts(node, RADIALG_ATTS, styleClasses)
        return <RadialGradient key={i} {...componentAtts}>{childs}</RadialGradient>
      case 'stop':
        componentAtts = this.obtainComponentAtts(node, STOP_ATTS, styleClasses)
        return <Stop key={i} {...componentAtts}>{childs}</Stop>
      case 'ellipse':
        componentAtts = this.obtainComponentAtts(node, ELLIPSE_ATTS, styleClasses)
        return <Ellipse key={i} {...componentAtts}>{childs}</Ellipse>
      case 'polygon':
        componentAtts = this.obtainComponentAtts(node, POLYGON_ATTS, styleClasses)
        return <Polygon key={i} {...componentAtts}>{childs}</Polygon>
      case 'polyline':
        componentAtts = this.obtainComponentAtts(node, POLYLINE_ATTS, styleClasses)
        return <Polyline key={i} {...componentAtts}>{childs}</Polyline>
      default:
        return null
    }
  }

  obtainComponentAtts ({attributes}, enabledAttributes, styleClasses) {
    let styleAtts = {}

    const classObj = Array.from(attributes).filter(attr => {
      return attr.name === 'class'
    })[0]

    if (classObj) {
      Object.keys(styleClasses[classObj.nodeValue]).forEach(key => {
        if (utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS))({nodeName: key})) {
          styleAtts[key] = styleClasses[classObj.nodeValue][key]
        }
      })
      if (this.props.classes && this.props.classes[classObj.nodeValue]) {
        Object.keys(this.props.classes[classObj.nodeValue]).forEach(key => {
          if (utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS))({nodeName: key})) {
            styleAtts[key] = this.props.classes[classObj.nodeValue][key]
          }
        })
      }
    }

    Array.from(attributes).forEach(({nodeName, nodeValue}) => {
      Object.assign(styleAtts, utils.transformStyle({nodeName, nodeValue, fillProp: this.props.fill}))
    })

    let componentAtts = Array.from(attributes)
      .map(utils.camelCaseNodeName)
      .map(utils.removePixelsFromNodeValue)
      .filter(utils.getEnabledAttributes(enabledAttributes.concat(COMMON_ATTS)))
      .reduce((acc, {nodeName, nodeValue}) => ({
        ...acc,
        [nodeName]: this.props.fill && nodeName === 'fill' ? this.props.fill : nodeValue,
      }), {})
    Object.assign(componentAtts, styleAtts)

    return componentAtts
  }

  inspectNode (node, styleClasses) {
    //Process the xml node
    let arrayElements = []

    // Only process accepted elements
    if (!ACEPTED_SVG_ELEMENTS.includes(node.nodeName))
      return null
    // if have children process them.

    // Recursive function.
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        let nodo = this.inspectNode(node.childNodes[i], styleClasses)
        if (nodo != null)
          arrayElements.push(nodo)
      }
    }
    let element = this.createSVGElement(node, arrayElements, styleClasses)
    return element
  }

  render () {
    try {
      if (this.state.svgXmlData == null)
        return null

      ind = 0
      let inputSVG = this.state.svgXmlData.substring(this.state.svgXmlData.indexOf('<svg '), (this.state.svgXmlData.indexOf('</svg>') + 6))

      let doc = new xmldom.DOMParser().parseFromString(inputSVG)
      let styleClasses = utils.extractStyleClasses(doc.childNodes[0])
      let rootSVG = this.inspectNode(doc.childNodes[0], styleClasses)

      return (
        <View style={this.props.style}>
          {rootSVG}
        </View>
      )
    } catch (e) {
      console.error('ERROR SVG', e)
      return null
    }
  }
}

SvgUri.propTypes = {
  fill: PropTypes.string,
}

module.exports = SvgUri
