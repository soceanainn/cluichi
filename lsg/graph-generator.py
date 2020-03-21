from lxml import etree
import json
import csv
from collections import OrderedDict

import json
class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)

tree = etree.parse("lsg-lmf.xml")

root = tree.getroot()[0]

sense_sets = {}
words = {}
output = OrderedDict()
for entry in root:
    if entry.tag == 'LexicalEntry':
        key = ""
        type = ""
        senses = set()
        for field in entry:
            if field.tag == 'Lemma':
                key = field.attrib['writtenForm']
                type = field.attrib['partOfSpeech']
            else:
                senses.add(field.attrib['synset'])
        for s in senses:
            words[key]= words.get(key, []) + [{'node-type': type, 'synset': {'id': s}}]
            sense_sets[s] = sense_sets.get(s, set()) | {key}

for word in words:
    for sense in range(len(words[word])):
        words[word][sense]['synset']['similar'] = words[word][sense]['synset'].get('similar', set()) | sense_sets.get(words[word][sense]['synset']['id'], set())
        words[word][sense]['synset']['similar'].remove(word)

print("WORDS: " + str(len(words)))

with open('graph.js', 'w+') as fd:
    fd.write('module.exports = { nodes: ' + json.dumps(dict(map(lambda x: (x, {'id': x, 'meanings': words[x]}), words)), indent=4, ensure_ascii=False, cls=SetEncoder) + '\n};\n')
