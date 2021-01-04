const graph = require('./graph.js');

module.exports = {
    fetchGraph: function (word, depth) {
        let nodes = [];
        let edges = [];
        let seenNodes = [];
        let stack = [];
        word = word.trim();
        if (Object.keys(graph.nodes).indexOf(word) === -1) {
            word = word.toLowerCase();
            if (Object.keys(graph.nodes).indexOf(word) === -1) return {};
        }

        stack.push({'id': word, 'depth': depth});
        parseStack();

        return {"nodes": nodes, "edges": edges};

        function parseStack(someWord, someDepth) {
            while(stack.length > 0) {
                let s = stack.pop();
                someWord = s.id;
                someDepth = s.depth;

                const node = graph.nodes[someWord];
                nodes.push(node);
                seenNodes.push(node.id);

                for (let m in node.meanings) {
                    for (let s in node.meanings[m].synset.similar) {
                        let foundWord = node.meanings[m].synset.similar[s];
                        if (seenNodes.indexOf(foundWord) !== -1) {
                            edges.push({
                                'source': node.id,
                                'target': foundWord,
                                'synset': node.meanings[m].synset.id,
                                'members': node.meanings[m].synset.similar,
                                'value': (1 / node.meanings[m].synset.similar.length)
                            });
                        } else if (someDepth > 0) {
                            if (stack.map(x => x.id).indexOf(foundWord) === -1)
                                stack.push({'id': foundWord, 'depth': someDepth - 1});
                        }
                    }
                }
            }
        }
    }
};
