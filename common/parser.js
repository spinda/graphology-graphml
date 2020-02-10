/**
 * Graphology GRAPHML Parser
 * ==========================
 *
 * graphology GRAPHML parser using DOMParser to function.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

var DEFAULTS = require('./defaults.js');
var DEFAULT_FORMATTER = DEFAULTS.DEFAULT_FORMATTER;

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
    };

    if (typeof defaultValue !== 'undefined')
      defaults[m][name] = defaultValue;
  }

  return {
    models: models,
    defaults: defaults
  };
}

function collectAttributes(model, defaults, element) {
  var dataElements = element.getElementsByTagName('data'),
      dataElement;

  var i, l, key, spec;

  var attr = {};

  for (i = 0, l = dataElements.length; i < l; i++) {
    dataElement = dataElements[i];
    key = dataElement.getAttribute('key');
    spec = model[key];

    if (typeof spec === 'undefined')
      attr[key] = dataElement.textContent.trim();
    else
      attr[spec.name] = spec.cast(dataElement.textContent.trim());
  }

  for (key in defaults) {
    if (!(key in attr))
      attr[key] = defaults[key];
  }

  return attr;
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
    var EDGE_DEFAULT_TYPE = GRAPH_ELEMENT.getAttribute('edgedefault') || 'undirected';

    var MODEL = collectModel(MODEL_ELEMENTS);

    var graph = new Graph({type: EDGE_DEFAULT_TYPE});

    var addDefaultEdge = EDGE_DEFAULT_TYPE === 'undirected' ?
      [graph.addDirectedEdge.bind(graph), graph.addUndirectedEdge.bind(graph)] :
      [graph.addUndirectedEdge.bind(graph), graph.addDirectedEdge.bind(graph)];

    // var addDefaultEdgeWithKey = EDGE_DEFAULT_TYPE === 'undirected' ?
    //   [graph.addDirectedEdgeWithKey.bind(graph), graph.addUndirectedEdgeWithKey.bind(graph)] :
    //   [graph.addUndirectedEdgeWithKey.bind(graph), graph.addDirectedEdgeWithKey.bind(graph)];

    // Graph-level attributes
    var graphId = GRAPH_ELEMENT.getAttribute('id');

    if (graphId)
      graph.setAttribute('id', graphId);

    // Collecting nodes
    var i, l, nodeElement, key, attr;

    for (i = 0, l = NODE_ELEMENTS.length; i < l; i++) {
      nodeElement = NODE_ELEMENTS[i];
      key = nodeElement.getAttribute('id');

      attr = collectAttributes(MODEL.models.node, MODEL.defaults.node, nodeElement);
      attr = DEFAULT_FORMATTER(attr);

      graph.addNode(key, attr);
    }

    // Collecting edges
    var edgeElement, s, t;

    // TODO: mixed graphs
    // TODO: edges with keys
    for (i = 0, l = EDGE_ELEMENTS.length; i < l; i++) {
      edgeElement = EDGE_ELEMENTS[i];
      s = edgeElement.getAttribute('source');
      t = edgeElement.getAttribute('target');

      attr = collectAttributes(MODEL.models.edge, MODEL.defaults.edge, edgeElement);
      attr = DEFAULT_FORMATTER(attr);

      addDefaultEdge[1](s, t, attr);
    }

    return graph;
  };
};
