const graph = require('./graph.js');

module.exports = {
    fetchGraph: function (word, depth) {
        let nodes = [];
        let edges = [];

        parseWord(word, depth);
        return {"nodes": nodes, "edges": edges};

        function parseWord(someWord, someDepth) {
            const node = graph.nodes[someWord];
            nodes.push(node);
            if (someDepth > 0) {
                for (let m in node.meanings) {
                    for (let s in node.meanings[m].synset.similar) {
                        foundWord = node.meanings[m].synset.similar[s];
                        edges.push({'source': node.id, 'target': foundWord, 'value': (1 / node.meanings[m].synset.similar.length)});
                        parseWord(foundWord, someDepth - 1);
                    }
                }
            }
        }
    }
};
