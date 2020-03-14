#!/usr/bin/env python3
import sys
import re
from collections import OrderedDict
import json

chars = re.sub(r'([^a-záéíóú\n]+)', '', open(sys.argv[1]).read().strip().lower())
print("let focail=`" + chars + "`.trim()");
