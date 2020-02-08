/* eslint no-self-compare: 0 */
/**
 * Graphology Browser GRAPHML Parser
 * ==================================
 *
 * Browser version of the graphology GRAPHML parser using DOMParser to function.
 */
var isGraphConstructor = require('graphology-utils/is-graph-constructor');

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
    if (!isGraphConstructor(Graph))
      throw new Error('graphology-graphml/parser: invalid Graph constructor.');
  };
};
