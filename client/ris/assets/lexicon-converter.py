from lxml import etree
import json
import csv
from collections import OrderedDict

tree = etree.parse("lsg-lmf.xml")

root = tree.getroot()[0]

words = {}
relevant_words = []
sense_sets = {}
output = OrderedDict()

types = set()
for entry in root:
    if entry.tag == 'LexicalEntry':
        key = ""
        senses = set()
        for field in entry:
            if field.tag == 'Lemma':
                key = field.attrib['writtenForm']
            else:
                senses.add(field.attrib['synset'])
            words[key] = senses | words.get(key, set())
            for s in senses:
                sense_sets[s] = sense_sets.get(s, set()) | {key}


with open('focail.txt') as fd:
    rd = csv.reader(fd, delimiter="\t", quotechar='"')
    next(rd)
    for word in rd:
        relevant_words.append(word[0])

for word in relevant_words:
    if word in words:
        for sense in words[word]:
            output[word] = output.get(word, set()) | sense_sets.get(sense, set())
        temp = output[word]
        temp.remove(word)
        output[word] = temp
        output[word] = list(output[word])
        if len(output[word]) == 0:
            output.pop(word)

print("TEST 'ar': " + str(output['ar']))
print("WORDS: " + str(len(output)))

with open('focail.js', 'w+') as fd:
    fd.write('const focail = ' + json.dumps(list(map(lambda x: {'word': x[0], 'similar': x[1]},output.items())), indent=4, ensure_ascii=False) + ';\n')
