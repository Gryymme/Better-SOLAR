"""Tiny fixture-only HTML tree serializer using the Python standard library."""
from html.parser import HTMLParser
import json, sys
class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root={'tag':'body','attrs':{},'children':[]}; self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        e={'tag':tag,'attrs':dict(attrs),'children':[]};self.stack[-1]['children'].append(e)
        if tag not in {'input','br','hr','img','link','meta','source','wbr'}: self.stack.append(e)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i]['tag']==tag:
                self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1]['children'].append(data)
p=Parser();p.feed(sys.stdin.read());json.dump(p.root,sys.stdout)
