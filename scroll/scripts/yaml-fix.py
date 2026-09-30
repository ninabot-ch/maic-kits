#!/usr/bin/env python3
"""Cite les valeurs YAML nues qui contiennent « : » ou « # » (interdits en scalaire nu) et vérifie que le fichier se charge.
Outil de développement pour les échantillons : python3 scripts/yaml-fix.py samples/*/content.yaml"""
import re, sys, yaml
pat = re.compile(r'^(\s*(?:- )?[\w-]+:\s)(?![\["\'{|>])(.*\S)\s*$')
for f in sys.argv[1:]:
    out = []
    for line in open(f, encoding='utf-8'):
        m = pat.match(line.rstrip('\n'))
        if m and (': ' in m.group(2) or ' #' in m.group(2) or m.group(2).endswith(':')):
            out.append(m.group(1) + '"' + m.group(2).replace('\\', '\\\\').replace('"', '\\"') + '"\n')
        else: out.append(line)
    open(f, 'w', encoding='utf-8').write(''.join(out))
    d = yaml.safe_load(open(f, encoding='utf-8'))
    print(f, 'ok', list(d.keys()) if isinstance(d, dict) else type(d))
