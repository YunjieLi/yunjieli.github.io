
const Jetski_REGEX_CASE_INSENSATIVE = 'i'
const Jetski_REGEX_FIND_ALL = 'g'
const Jetski_BUILD_REGEX = (expressions, options) => {
    if ((options || '').constructor === String) {
        options = [options]
    }
    return new RegExp(expressions.join(''), options.join(''))
}
const Jetski_REGEX_CAPTURE = (expression) => `(${expression})`

const Jetski_Const = {
    Syntax: {
        TOKEN_START: '{{',
        TOKEN_END: '}}',
        IF: 'if',
        END: 'end',
        WRAP: 'wrap',
        YIELD: 'yield',
        ITSIF: 'itsif',
        UPPERCASE: 'uppercase',
        LOWERCASE: 'lowercase',
        TITLECASE: 'titlecase',
        YIELD_CONTENT: '_content',
    },

    Instruction: {
        IMPORT: 'IMPORT',
        IF: 'IF',
        END: 'END',
        WRAP: 'WRAP',
        YIELD: 'YIELD',
        ITSIF: 'ITSIF',
        UPPERCASE: 'UPPERCASE',
        LOWERCASE: 'LOWERCASE',
        TITLECASE: 'TITLECASE',
    },

    RegExSyntax: {
        MUST_START: '^',
        MUST_END: '$',
        ANYTHING_LAZY: '[\\S\\s]*?',
        REQUIRED_WHITESPACE: '\\s',
        OPTIONAL_WHITESPACE: '\\s*',
        COMMA_SEPARATED_NUMBERS: '[,0-9]+',
    },

    RegEx: {
        get TOKEN() {
            return Jetski_BUILD_REGEX([
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.ANYTHING_LAZY,
                Jetski_Const.Syntax.TOKEN_END,
            ], Jetski_REGEX_CASE_INSENSATIVE)
        },
        ALL_HTML_TAGS_WITH_CONTENTS: (tagName) => {
            return Jetski_BUILD_REGEX([
                '<' + tagName + Jetski_Const.RegExSyntax.ANYTHING_LAZY + '>',
                Jetski_REGEX_CAPTURE(Jetski_Const.RegExSyntax.ANYTHING_LAZY),
                '<\\/' + tagName + '>'
            ], [Jetski_REGEX_CASE_INSENSATIVE, Jetski_REGEX_FIND_ALL])
        },
        ALL_HTML_OPEN_OR_CLOSE_TAGS: (tagName) => {
            return Jetski_BUILD_REGEX([
                '<' + '\\/?' + tagName + Jetski_Const.RegExSyntax.ANYTHING_LAZY + '>',
            ], [Jetski_REGEX_CASE_INSENSATIVE, Jetski_REGEX_FIND_ALL])
        },
        get ALL_SINGLE_OR_QUOTED_WORDS_OR_KEY_VALUES() {
            return Jetski_BUILD_REGEX([
                `(\\w*[\\s]*=[\\s]*)?("(?:[^"\\\\]|\\\\.)+")|[\\S\\w]+`
            ], [Jetski_REGEX_CASE_INSENSATIVE, Jetski_REGEX_FIND_ALL])
        },
        get VARIATION_SPEC() {
            return Jetski_BUILD_REGEX([
                Jetski_Const.RegExSyntax.MUST_START,
                '\\(',
                Jetski_REGEX_CAPTURE(Jetski_Const.RegExSyntax.COMMA_SEPARATED_NUMBERS),
                '\\)',
                Jetski_Const.RegExSyntax.MUST_END
            ])
        },
        COMPLETE_CONDITIONAL: (parameter) => {
            if (parameter == undefined) {
                parameter = Jetski_Const.RegExSyntax.ANYTHING_LAZY
            }
            return Jetski_BUILD_REGEX([
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.IF,
                Jetski_Const.RegExSyntax.REQUIRED_WHITESPACE,
                Jetski_REGEX_CAPTURE(parameter),
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.TOKEN_END,
                Jetski_REGEX_CAPTURE(Jetski_Const.RegExSyntax.ANYTHING_LAZY),
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.END,
                Jetski_Const.RegExSyntax.REQUIRED_WHITESPACE,
                parameter,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.TOKEN_END
            ], Jetski_REGEX_CASE_INSENSATIVE)
        },
        COMPLETE_WRAP: (layout) => {
            return Jetski_BUILD_REGEX([
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.WRAP,
                Jetski_Const.RegExSyntax.REQUIRED_WHITESPACE,
                layout,
                Jetski_Const.RegExSyntax.ANYTHING_LAZY,
                Jetski_Const.Syntax.TOKEN_END,
                Jetski_REGEX_CAPTURE(Jetski_Const.RegExSyntax.ANYTHING_LAZY),
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.END,
                Jetski_Const.RegExSyntax.REQUIRED_WHITESPACE,
                layout,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.TOKEN_END
            ], Jetski_REGEX_CASE_INSENSATIVE)
        },
        get YIELD_TOKEN() {
            return Jetski_BUILD_REGEX([
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.YIELD,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.TOKEN_END,
            ], Jetski_REGEX_CASE_INSENSATIVE)
        },
        get ITSIF_TOKEN() {
            return Jetski_BUILD_REGEX([
                Jetski_Const.Syntax.TOKEN_START,
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.ITSIF,
                Jetski_Const.RegExSyntax.REQUIRED_WHITESPACE,
                Jetski_REGEX_CAPTURE(Jetski_Const.RegExSyntax.ANYTHING_LAZY),
                Jetski_Const.RegExSyntax.OPTIONAL_WHITESPACE,
                Jetski_Const.Syntax.TOKEN_END,
            ], Jetski_REGEX_CASE_INSENSATIVE)
        },
    },

    USERNAMES: {
        'dhamlin': 'drew',
    },
}







const Jetski_Filesystem = {
    exists: (path) => {
        return fs.existsSync(path)
    },
    read: (file) => {
        return fs.readFileSync(file, 'utf8')
    },
    write: (file, contents) => {
        return fs.writeFileSync(file, contents)
    },
    modify(file, modifyFn) {
        Jetski_Filesystem.write(file, modifyFn(Jetski_Filesystem.read(file)))
    },
    contentsOfFolder: (folder) => {
        if (!Jetski_Filesystem.exists(folder)) {
            return []
        }
        return fs.readdirSync(folder).filter(file => file != '.DS_Store')
    },
    recursiveContentsOfFolder: (folder) => {
        let files = Jetski_Filesystem.contentsOfFolder(folder)
        let toRemove = ['.DS_Store']
        for (let subfolder of files) {
            if (Jetski_Filesystem.isFolder(`${folder}/${subfolder}`)) {
                toRemove.push(subfolder)
                let children = Jetski_Filesystem.recursiveContentsOfFolder(`${folder}/${subfolder}`)
                files = files.concat(children.map(file => `${subfolder}/${file}`))
            }
        }
        return files.filter(item => toRemove.indexOf(item) < 0)
    },
    isFolder: (path) => {
        return Jetski_Filesystem.exists(path) && fs.lstatSync(path).isDirectory()
    },
    copy: (origin, destination) => {
        return fs.copySync(origin, destination)
    },
    move: (origin, destination) => {
        return fs.moveSync(origin, destination)
    },
    watch: (path, fn) => {
        return fs.watch(path, { 'recursive': true }, fn)
    },
    open: (path) => {
        opn(path)
    },
    trash: (path) => {
        if (path == undefined || path == null || path == '' || path == "/") {
            console.log('Will not trash: ' + path)
        } else {
            trash(path)
        }
    }
}



const Jetski_Helpers = {
    uniqueID: () =>
        'x'.repeat(16).replace(/x/g, () => (Math.random() * 16 | 0).toString(16)),
        
    filenameWithoutExtension: (filename) =>
        filename.replace(/\.[^/.]+$/, '')
}






let encounteredVariations = new Set([])

const Jetski_Parser = {
    contentsOfHTMLTags: (markup, tag) => {
        let tags = markup.match(Jetski_Const.RegEx.ALL_HTML_TAGS_WITH_CONTENTS(tag))
        let contentsOfTags = []
        if (tags != null) {
            contentsOfTags = tags.map(val => val.replace(Jetski_Const.RegEx.ALL_HTML_OPEN_OR_CLOSE_TAGS(tag), ''))
        }
        return contentsOfTags
    },

    nextToken: (markup) => {
        let match = markup.match(Jetski_Const.RegEx.TOKEN)
        return match ? match[0] : null
    },

    resolveAllTokens: (markup, layouts, currentVariation, config) => {
        let nextMatch
        while (nextMatch = Jetski_Parser.nextToken(markup)) {
            let [instruction, layoutName, parameters, matchingVariations] = Jetski_Parser.parseToken(nextMatch)

            if (matchingVariations != undefined && !matchingVariations.has(currentVariation)) {
                markup = markup.replace(Jetski_Const.RegEx.TOKEN, '')
                continue
            }

            let content = Jetski_Parser.markupForLayout(layoutName, parameters, layouts, config)
            switch (instruction) {
                case Jetski_Const.Instruction.END:
                    markup = markup.replace(Jetski_Const.RegEx.TOKEN, '')
                    break

                case Jetski_Const.Instruction.WRAP:
                    let completeWrap = markup.match(Jetski_Const.RegEx.COMPLETE_WRAP(layoutName))
                    content = content.replace(Jetski_Const.RegEx.YIELD_TOKEN, completeWrap[1])
                    markup = markup.replace(Jetski_Const.RegEx.COMPLETE_WRAP(layoutName), content)
                    break
                
                case Jetski_Const.Instruction.YIELD:
                    console.log(parameters)
                    markup = markup.replace(Jetski_Const.RegEx.YIELD_TOKEN, config[Jetski_Const.Syntax.YIELD_CONTENT] || '')
                    break

                case Jetski_Const.Instruction.UPPERCASE:
                    markup = markup.replace(Jetski_Const.RegEx.TOKEN, parameters.toUpperCase())
                    break

                case Jetski_Const.Instruction.LOWERCASE:
                    markup = markup.replace(Jetski_Const.RegEx.TOKEN, parameters.toLowerCase())
                    break

                case Jetski_Const.Instruction.TITLECASE:
                    markup = markup.replace(Jetski_Const.RegEx.TOKEN, parameters.replace(/\w\S*/g,
                        text => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()))
                    break

                default:
                    markup = markup.replace(Jetski_Const.RegEx.TOKEN, content)
            }
        }
        return markup
    },

    markupForLayout: (layoutName, parameters, layouts, config) => {
        if (layoutName == undefined) {
            return ''
        }

        // Match config values
        if (layoutName.startsWith('jetski:')) {
            let parameter = layoutName.replace('jetski:', '')
            let value = config[parameter]
            if (!value) {
                console.error("Config value not found: " + parameter)
            }
            return value || ''
        }

        // Match imports
        if (layoutName.startsWith('import:')) {
            let project = encodeURI(layoutName.replace('import:', ''))
            let uniqueID = Jetski_Helpers.uniqueID()
            let wrapContent = ''
            return `<script data-jetski-import="${project}" data-jetski-template="${uniqueID}"></script>\n` +
                `<template id="${uniqueID}">${wrapContent}</template>`
        }

        if (!layouts[layoutName]) {
            console.error("Layout not found: " + layoutName)
        }

        let markup = layouts[layoutName] || ''
        let parameterKeys = Object.keys(parameters).map(key => key.replace(/^"(.+(?="$))"$/, '$1'))

        // Substitue known numbered parameters with their values
        for (let i = 0; i < parameterKeys.length; i++) {
            markup = markup.replace(new RegExp(`\\$${i}`, 'g'), parameterKeys[i])
        }

        // Substitute known named parameters with their values
        for (let parameterKey of parameterKeys) {
            markup = markup.replace(new RegExp(`\\$${parameterKey}`, 'g'), parameters[parameterKey])
        }

        // Substitute every $_uid with a unique ID
        while (markup.match('\\$_uid')) {
            markup = markup.replace(new RegExp('\\$_uid'), () => Jetski_Helpers.uniqueID())
        }

        // Substitute $_id with a per-session ID
        let sessionID = Jetski_Helpers.uniqueID()
        while (markup.match('\\$_id')) {
            markup = markup.replace(new RegExp('\\$_id'), sessionID)
        }

        // Parse conditionals
        let parameterSet = new Set(parameterKeys)
        while (true) {
            let conditionalMatch = markup.match(Jetski_Const.RegEx.COMPLETE_CONDITIONAL())
            if (!conditionalMatch) {
                break
            }

            let requiredParameter = conditionalMatch[1]
            conditionalMatch = markup.match(Jetski_Const.RegEx.COMPLETE_CONDITIONAL(requiredParameter))
            if (!conditionalMatch) {
                console.error("Conditional not closed: " + requiredParameter)
                break
            }

            if (parameterSet.has(requiredParameter)) {
                let conditionalMarkup = conditionalMatch[2]
                markup = markup.replace(Jetski_Const.RegEx.COMPLETE_CONDITIONAL(requiredParameter), conditionalMarkup)
            } else {
                markup = markup.replace(Jetski_Const.RegEx.COMPLETE_CONDITIONAL(requiredParameter), '')
            }
        }

        // Parse itsifs
        while (true) {
            let itsifMatch = markup.match(Jetski_Const.RegEx.ITSIF_TOKEN)
            if (!itsifMatch) {
                break
            }

            let requiredParameter = itsifMatch[1]
            if (parameterSet.has(requiredParameter)) {
                markup = markup.replace(Jetski_Const.RegEx.ITSIF_TOKEN, requiredParameter)
            } else {
                markup = markup.replace(Jetski_Const.RegEx.ITSIF_TOKEN, '')
            }
        }

        return markup
    },

    parseToken: (token) => {
        let allComponents = (token || "").replace(new RegExp(`${Jetski_Const.Syntax.TOKEN_START}\\s*`, 'ig'), '')
                                      .replace(new RegExp(`\\s*${Jetski_Const.Syntax.TOKEN_END}`, 'ig'), '')

        let components = allComponents.match(Jetski_Const.RegEx.ALL_SINGLE_OR_QUOTED_WORDS_OR_KEY_VALUES)
        let layoutName = undefined
        let rawInstruction = components.shift() || ""

        let matchingVariations = undefined
        let isVariationDependant = rawInstruction.match(Jetski_Const.RegEx.VARIATION_SPEC)
        if (isVariationDependant) {
            matchingVariations = new Set(isVariationDependant[1].split(',').map(number => parseInt(number)))
            layoutName = components.shift()

            encounteredVariations.add(1)
            for (let variation of matchingVariations) {
                encounteredVariations.add(variation)
            }
        }

        let conditionalParameters = undefined
        let instruction = undefined
        switch (rawInstruction.toLowerCase()) {
            case Jetski_Const.Syntax.IF:
                instruction = Jetski_Const.Instruction.IF
                conditionalParameters = [components.shift()]
                break

            case Jetski_Const.Syntax.END:
                instruction = Jetski_Const.Instruction.END
                layoutName = components.shift()
                break

            case Jetski_Const.Syntax.WRAP:
                instruction = Jetski_Const.Instruction.WRAP
                layoutName = components.shift()
                break

            case Jetski_Const.Syntax.YIELD:
                instruction = Jetski_Const.Instruction.YIELD
                break

            case Jetski_Const.Syntax.LOWERCASE:
                instruction = Jetski_Const.Instruction.LOWERCASE
                conditionalParameters = components.join(' ')
                break

            case Jetski_Const.Syntax.UPPERCASE:
                instruction = Jetski_Const.Instruction.UPPERCASE
                conditionalParameters = components.join(' ')
                break

            case Jetski_Const.Syntax.TITLECASE:
                instruction = Jetski_Const.Instruction.TITLECASE
                conditionalParameters = components.join(' ')
                break

            default:
                layoutName = rawInstruction
                instruction = Jetski_Const.Instruction.IMPORT
        }

        let parameters = {}
        if (conditionalParameters == undefined) {
            for (let component of components) {
                if (component.match('=')) {
                    let [parameter, value] = component.split('=')
                    value = value.match(/"([\w\S\s]*)"/)[1] || value
                    value = value.replace(/\\"/g, '"')
                    parameters[parameter] = value
                } else {
                    parameters[component] = true
                }
            }
        }

        return [instruction, layoutName, conditionalParameters || parameters, matchingVariations]
    },

}












const Jetski_Project = {
    getName: (path) => {
        return path.split('/').pop()
    },

    isValid: (path) => {
        return Jetski_Filesystem.exists(`${path}/jetski.json`)
    },

    exitIfInvalid: (path) => {
        if (!Jetski_Project.isValid(path)) {
            console.error("Error: " + chalk.bold(path) + " is not a Jetski project. Please " + chalk.bold("cd") + " into the project directory.\n");
            process.exit()
        }
    },

    create: (path, projectName) => {
        if (Jetski_Filesystem.exists(path)) {
            console.log("This project folder already exists.\n")
            process.exit()
        }

        console.log("Creating " + chalk.bold(projectName) + "...")
        Jetski_Filesystem.copy('templates/new', path)

        Jetski_Filesystem.modify(`${path}/jetski.json`, markup => {
            markup = markup.replace('{{ jetski:title }}', projectName)
            return markup
        })
    },

    build: (path, options = {}) => {
        let projectName = Jetski_Project.getName(path)
        console.log("Building " + chalk.bold(projectName) + "...")

        let config
        try {
            config = JSON.parse(Jetski_Filesystem.read(`${path}/jetski.json`))
        } catch (error) {
            console.log(`jetski.json:\t${error}\n`)
            process.exit()
        }

        // Link config-specified CSS and JS
        let cssFilesMarkup = (config['css_files'] || []).map(cssFile => `    <link rel="stylesheet" type="text/css" href="${cssFile}">\n`).join('')
        let jsFilesMarkup = (config['js_files'] || []).map(jsFile => `<script src="${jsFile}"></script>\n`).join('')

        // Copy layouts
        let layouts = {}
        let files = Jetski_Filesystem.recursiveContentsOfFolder(`${path}/layouts`)
        for (let filename of files) {
            let layoutName = Jetski_Helpers.filenameWithoutExtension(filename)
            if (layoutName == '') continue
            let file = `${path}/layouts/${layoutName}.html`
            if (Jetski_Filesystem.exists(file)) {
               layouts[layoutName] = Jetski_Filesystem.read(file)
            }
        }

        // Grab inline CSS and JS out of the markup
        let inlineMarkup = {'style': '', 'script': ''}
        for (let tag of Object.keys(inlineMarkup)) {
            for (let layoutName of Object.keys(layouts)) {
                let layoutMarkup = layouts[layoutName]
                let markupBlocks = Jetski_Parser.contentsOfHTMLTags(layoutMarkup, tag)
                for (let markup of markupBlocks) {
                    inlineMarkup[tag] += `\n/* ${layoutName}.html */\n`
                    inlineMarkup[tag] += markup
                }
                layouts[layoutName] = layoutMarkup.replace(Jetski_Const.RegEx.ALL_HTML_TAGS_WITH_CONTENTS(tag), '')
            }
        }

        // Remove old build folder and create new one from prototype
        if (Jetski_Filesystem.exists(`${path}/build`)) {
            let deprecatedBuildFolder = `/tmp/jetski-build-${projectName}-build-${Date.now()}${Math.round(Math.random() * 100)}`
            Jetski_Filesystem.move(`${path}/build`, deprecatedBuildFolder)
            Jetski_Filesystem.trash(deprecatedBuildFolder)
        }
        Jetski_Filesystem.copy('templates/build', `${path}/build`)

        // Bundle CSS and LESS
        let cssFileMarkup = ''
        let cssFiles = Jetski_Filesystem.contentsOfFolder(`${path}/static/css`)
        for (let cssFile of cssFiles) {
            cssFileMarkup += `\n/* ${cssFile} */\n`
            cssFileMarkup += Jetski_Filesystem.read(`${path}/static/css/${cssFile}`)
        }
        let lessFiles = Jetski_Filesystem.contentsOfFolder(`${path}/static/less`)
        for (let lessFile of lessFiles) {
            cssFileMarkup += `\n/* ${lessFile} */\n`
            cssFileMarkup += Jetski_Filesystem.read(`${path}/static/less/${lessFile}`)
        }

        // Compile LESS and write as CSS
        let projectCSS = cssFileMarkup + inlineMarkup['style']
        less.render(projectCSS, {}, function (err, result) {
            if (err) {
                console.error(err)
            } else {
                Jetski_Filesystem.write(`${path}/build/static/css/project.css`, result['css'])
            }
        })

        // Bundle JS
        let jsFileMarkup = ''
        let jsFiles = Jetski_Filesystem.contentsOfFolder(`${path}/static/js`)
        for (let jsFile of jsFiles) {
            jsFileMarkup += `\n/* ${jsFile} */\n`
            jsFileMarkup += Jetski_Filesystem.read(`${path}/static/js/${jsFile}`)
        }

        // Write JS
        Jetski_Filesystem.write(`${path}/build/static/js/project.js`, jsFileMarkup + inlineMarkup['script'])

        // Compile Jetski Engine JS
        let jetskiEngineMarkup = ''
        let jetskiEngineFilesToExclude = new Set(['init.js', 'watcher.js'])
        let jetskiEngineFiles = Jetski_Filesystem.contentsOfFolder(__dirname).filter(file => !jetskiEngineFilesToExclude.has(file))
        for (let jetskiEngineFile of jetskiEngineFiles) {
            jetskiEngineMarkup += Jetski_Filesystem.read(`${__dirname}/${jetskiEngineFile}`)
        }

        jetskiEngineMarkup = jetskiEngineMarkup.replace(/(.*require\('\S+'\).*)/g, "")

        // Namespace Jetski Engine JS
        let namespace = 'Jetski_'
        let constantsRegEx = new RegExp(/const\s+(\w+)(\s+=.*)/g)
        let constantsToModify = jetskiEngineMarkup.match(constantsRegEx).map(partial => partial.replace(constantsRegEx, '$1'))
        jetskiEngineMarkup = jetskiEngineMarkup.replace(constantsRegEx, `const ${namespace}$1$2`)
        for (let constantToModify of constantsToModify) {
            jetskiEngineMarkup = jetskiEngineMarkup.replace(new RegExp(`((?!([${namespace}]))(.)|^)${constantToModify}`, 'g'), `$1${namespace}${constantToModify}`)
        }

        // Write Jetski Engine JS
        let globalsRegEx = /(.*global\.(.*))/
        while (jetskiEngineMarkup.match(globalsRegEx)) {
            jetskiEngineMarkup = jetskiEngineMarkup.replace(globalsRegEx, 'let $2')
        }
        Jetski_Filesystem.write(`${path}/build/static/js/jetski-engine.js`, jetskiEngineMarkup)

        function buildBaseForVariation(variation, filename) {
            Jetski_Filesystem.modify(`${path}/build/${filename}`, markup => {
                markup = markup.replace(/{{ jetski:title }}/g, config['title'])
                markup = markup.replace(/{{ base }}/g, Jetski_Parser.markupForLayout('base', {}, layouts))
                markup = markup.replace('    {{ jetski:css_files }}\n', cssFilesMarkup)
                markup = markup.replace('{{ jetski:js_files }}\n', jsFilesMarkup)
                markup = Jetski_Parser.resolveAllTokens(markup, layouts, variation, config)
                return markup
            })
        }

        // Build index.html and variation files from base layout
        buildBaseForVariation(1, 'index.html')
        for (let variation of encounteredVariations) {
            Jetski_Filesystem.copy('templates/build/index.html', `${path}/build/v${variation}.html`)
            buildBaseForVariation(variation, `v${variation}.html`)
        }

        // Get imported JSON
        let importedJSON = {}
        let jsonFiles = Jetski_Filesystem.recursiveContentsOfFolder(`${path}/static/json`)
        for (let jsonFile of jsonFiles) {
            let filename = Jetski_Helpers.filenameWithoutExtension(jsonFile)
            let filepath = `${path}/static/json/${jsonFile}`
            try {
                importedJSON[filename] = JSON.parse(Jetski_Filesystem.read(filepath))
            } catch (error) {
                console.error(`Error parsing JSON in ${filename}: ${error}`)
                importedJSON[filename] = {}
            }
        }

        // Copy Jetski engine
        Jetski_Filesystem.modify(`${path}/build/static/js/jetski.js`, markup => {
            markup = markup.replace('{{ jetski:auto_refresh }}', options.auto_refresh == true)
            markup = markup.replace('{{ jetski:layouts }}', JSON.stringify(layouts, undefined, 4))
            markup = markup.replace('{{ jetski:json }}', JSON.stringify(importedJSON))
            markup = markup.replace('{{ jetski:config }}', JSON.stringify(config))
            return markup
        })
    
        // Bundle other static resources
        let staticFiles = new Set(Jetski_Filesystem.contentsOfFolder(`${path}/static`))
        staticFiles.delete('css')
        staticFiles.delete('js')
        for (let staticFile of staticFiles) {
            Jetski_Filesystem.copy(`${path}/static/${staticFile}`, `${path}/build/static/${staticFile}`)
        }

        if (options.auto_refresh) {
            BUILD_LAST_UPDATED = Date.now()
        }

        console.log("Build complete.\n")
    },

    watch: (path) => {
        let projectName = Jetski_Project.getName(path)
        console.log("Watching " + chalk.bold(projectName) + "...")

        function onChange(eventType, filename) {
            console.log(`\nFile ${eventType}: ${filename}`)
            Jetski_Project.build(path, { auto_refresh: true })
        }

        Jetski_Filesystem.watch(`${path}/layouts`, (eventType, filename) => onChange(eventType, filename))
        Jetski_Filesystem.watch(`${path}/static`, (eventType, filename) => onChange(eventType, filename))
        Jetski_Filesystem.watch(`${path}/jetski.json`, (eventType, filename) => onChange(eventType, filename))
    },

    deploy: (path, buildPath) => {
        let projectName = Jetski_Project.getName(path)

        function randomIntBetween(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min)
        }

        function randomize(string) {
            return string.replace(/x/g, () => { return randomIntBetween(0, 35).toString(36) })
        }

        let username = shell.exec('whoami', { silent: true }).stdout.split('\n')[0].toLowerCase()
        if (Jetski_Const.USERNAMES[username]) {
            username = Jetski_Const.USERNAMES[username]
        }

        let projectHash = Date.now().toString(36) + randomize("xxxxxxxx-") + projectName
        let projectURL = `quip.design/${username}/${projectHash}`
        console.log("Uploading project to " + chalk.bold("http://" + projectURL) + "...")

        shell.exec(`/usr/local/bin/aws s3 sync "${path + buildPath}" s3://${projectURL}`, { silent: true })
        Jetski_Filesystem.open(`http://${projectURL}`)
    },

    openFolder: (path) => {
        console.log("Success! Opening project folder...\n")
        console.log("Now get started by typing " + chalk.inverse(` cd ${path.split('/').pop()} `) + ", editing " + chalk.underline("layouts/base.html") + ", and using " + chalk.inverse(" jetski build ") + " (build once) or " + chalk.inverse(" jetski watch ") + " (continuously monitor changes) to see your work.\n")
        Jetski_Filesystem.open(path)
    },

    openInBrowser: (path) => {
        let projectName = Jetski_Project.getName(path)
        console.log("Opening " + chalk.bold(projectName) + "...")
        Jetski_Filesystem.open(`${path}/build/index.html`)
    },
}


