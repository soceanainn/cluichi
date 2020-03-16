#!/usr/bin/env python3

import sys
import csv
import json

numbers = set()
goto = {'0'}
output = {}


def parse_choices(raw_choices, paragraph, choices):
    if raw_choices[0] == '' or raw_choices[1] == '':
        print('Tá rogha do ailt %s mícheart' % paragraph)
    else:
        goto.add(raw_choices[1])
        choices.append({'text': raw_choices.pop(0), 'goto': raw_choices.pop(0)})
        choice_set = set(raw_choices)
        choice_set.add('')
        if len(choice_set) > 1:
            return parse_choices(raw_choices, paragraph, choices)
        else:
            return choices



def main():
    with open(sys.argv[1]) as fd:
        rd = csv.reader(fd, delimiter="\t", quotechar='"')
        next(rd)
        for uimhir, teideal, ailt, rogha1, teigh1, rogha2, teigh2, rogha3, teigh3, rogha4, teigh4 in rd:
            if uimhir in numbers:
                print("WARN: Tá ailt %s ann faoi dhó" % uimhir)
            else:
                numbers.add(uimhir)
            choice_list = list([rogha1, teigh1, rogha2, teigh2, rogha3, teigh3, rogha4, teigh4])
            choice_set = set(choice_list)
            choice_set.add('')
            choices = []
            if len(choice_set) != 1:
                choices = parse_choices(choice_list, uimhir, [])
            output[uimhir] = {'title': teideal, 'text': ailt, 'choices': choices}

        for number in numbers:
            if number not in goto:
                print('WARN: Ní féidir ailt %s a shroichint' % number)

    with open(sys.argv[2] + '/sceal.js', 'w+') as fd:
        fd.write('const sceal = ' + json.dumps(output, ensure_ascii=False) + ';\n')


if __name__ == '__main__':
    main()
