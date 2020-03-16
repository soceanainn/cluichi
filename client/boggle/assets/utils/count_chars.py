#!/usr/bin/env python3
import sys
import re
from collections import OrderedDict
import json

chars = re.sub(r'([^a-záéíóú]+)', '', open(sys.argv[1]).read().strip().replace("\n", "").lower())

a = dict()
for c in sorted(set([c for c in chars])):
    a[c] = chars.count(c)

b = OrderedDict();
for k in sorted(a, key=a.get, reverse=True):
    b[k] = a[k]

print(json.dumps(b, ensure_ascii=False))
