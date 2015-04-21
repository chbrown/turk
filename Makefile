DT := form-data/form-data lodash/lodash mocha/mocha node/node request/request yargs/yargs

all: $(DT:%=type_declarations/DefinitelyTyped/%.d.ts) index.js

%.js: %.ts
	node_modules/.bin/tsc -m commonjs -t ES5 $+

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@
