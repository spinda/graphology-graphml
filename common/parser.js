/* eslint no-self-compare: 0 */
/**
 * Graphology Browser GRAPHML Parser
 * ==================================
 *
 * Browser version of the graphology GRAPHML parser using DOMParser to function.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

function numericCaster(v) {
  return +v;
}

function identity(v) {
  return v;
}

var CASTERS = {
  boolean: function(v) {
    return v.toLowerCase() === 'true';
  },
  int: numericCaster,
  long: numericCaster,
  float: numericCaster,
  double: numericCaster,
  string: identity
};

function collectModel(modelElements) {
  var i, l, m, id, name, type, element, defaultElement, defaultValue;

  var models = {
    node: {},
    edge: {}
  };

  var defaults = {
    node: {},
    edge: {}
  };

  for (i = 0, l = modelElements.length; i < l; i++) {
    element = modelElements[i];
    m = element.getAttribute('for') || 'node';
    id = element.getAttribute('id');
    name = element.getAttribute('attr.name');
    type = element.getAttribute('attr.type') || 'string';

    defaultValue = undefined;
    defaultElement = element.getElementsByTagName('default');

    if (defaultElement.length !== 0)
      defaultValue = defaultElement[0].textContent;

    models[m][id] = {
      name: name,
      cast: CASTERS[type]
    }

    if (typeof defaultValue !== 'undefined')
      defaults[m][id] = defaultValue;
  }

  return {
    models: models,
    defaults: defaults
  };
}

function collectAttributes(model, defaults, element) {

}

/**
 * Factory taking implementations of `DOMParser` & `Document` returning
 * the parser function.
 */
module.exports = function createParserFunction(DOMParser, Document) {

  /**
   * Function taking either a string or a document and returning a
   * graphology instance.
   *
   * @param  {function}        Graph  - A graphology constructor.
   * @param  {string|Document} source - The source to parse.
   */
  return function parse(Graph, source) {
    var xmlDoc = source;

    if (!isGraphConstructor(Graph))
      throw new Error('graphology-graphml/parser: invalid Graph constructor.');

    // If source is a string, we are going to parse it
    if (typeof source === 'string')
      xmlDoc = (new DOMParser()).parseFromString(source, 'application/xml');

    if (!(xmlDoc instanceof Document))
      throw new Error('graphology-gexf/parser: source should either be a XML document or a string.');

    var GRAPH_ELEMENT = xmlDoc.getElementsByTagName('graph')[0];
    var MODEL_ELEMENTS = xmlDoc.getElementsByTagName('key');
    var NODE_ELEMENTS = xmlDoc.getElementsByTagName('node');
    var EDGE_ELEMENTS = xmlDoc.getElementsByTagName('edge');
    var EDGE_DEFAULT_TYPE = GRAPH_ELEMENT.getAttribute('edgedefault');

    var modelResult = collectModel(MODEL_ELEMENTS);

    var graph = new Graph({type: EDGE_DEFAULT_TYPE});

    var addDefaultEdge = EDGE_DEFAULT_TYPE === 'undirected' ?
      [graph.addDirectedEdge.bind(graph), graph.addUndirectedEdge.bind(graph)] :
      [graph.addUndirectedEdge.bind(graph), graph.addDirectedEdge.bind(graph)];

    // Graph-level attributes
    var graphId = GRAPH_ELEMENT.getAttribute('id');

    if (typeof graphId !== 'undefined')
      graph.setAttribute('id', graphId);

    // Collecting nodes
    var i, l, nodeElement;

    for (i = 0, l = NODE_ELEMENTS.length; i < l; i++) {
      nodeElement = NODE_ELEMENTS[i];

      graph.addNode(nodeElement.getAttribute('id'));
    }

    // Collecting edges
    var edgeElement, s, t;

    for (i = 0, l = EDGE_ELEMENTS.length; i < l; i++) {
      edgeElement = EDGE_ELEMENTS[i];
      s = edgeElement.getAttribute('source');
      t = edgeElement.getAttribute('target');

      addDefaultEdge[1](s, t);
    }

    return graph;
  };
};
