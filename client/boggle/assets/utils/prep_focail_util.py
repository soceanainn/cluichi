#!/usr/bin/env python3

import sys
import re
from collections import OrderedDict
import json

chars = open('utils/gaelspell.txt').read().strip().lower().split('\n')
chars = [w for w in chars if re.search(r'[^A-ZÁÉÍÓÚ]', w)]
chars = list(map(lambda x: re.sub(r'([^a-záéíóú\n]+)', '', x), chars))
with open('focail.js', 'w+') as fd:
    fd.write("let focail=" + json.dumps(chars, indent=4, ensure_ascii=False) + ";\n");

