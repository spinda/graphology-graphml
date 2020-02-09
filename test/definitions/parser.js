/**
 * Graphology Browser GRAPHML Unit Tests Parser Definitions
 * =========================================================
 *
 * Definitions of the GRAPHML files stored in `./resources` so we can test
 * that the parser works as expected.
 */
module.exports = [
  {
    title: 'Basic Graph',
    graphml: 'basic',
    basics: {
      type: 'undirected',
      multi: false,
      meta: {
        id: 'G'
      },
      order: 11,
      node: {
        key: 'n5',
        attributes: {}
      },
      size: 12,
      edge: {
        source: 'n5',
        target: 'n7',
        attributes: {}
      }
    }
  },
  // {
  //   title: 'Attributes Graph',
  //   graphml: 'attributes',
  //   basics: {
  //     type: 'undirected',
  //     multi: false,
  //     meta: {
  //       id: 'G'
  //     }
  //   }
  // }
];
