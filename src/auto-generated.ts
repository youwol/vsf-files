
const runTimeDependencies = {
    "externals": {
        "@youwol/http-clients": "^3.0.1",
        "@youwol/rx-tree-views": "^0.3.3",
        "@youwol/vsf-core": "^0.3.1",
        "rxjs": "^7.5.6"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/http-clients": {
        "commonjs": "@youwol/http-clients",
        "commonjs2": "@youwol/http-clients",
        "root": "@youwol/http-clients_APIv3"
    },
    "@youwol/rx-tree-views": {
        "commonjs": "@youwol/rx-tree-views",
        "commonjs2": "@youwol/rx-tree-views",
        "root": "@youwol/rx-tree-views_APIv03"
    },
    "@youwol/vsf-core": {
        "commonjs": "@youwol/vsf-core",
        "commonjs2": "@youwol/vsf-core",
        "root": "@youwol/vsf-core_APIv03"
    },
    "rxjs": {
        "commonjs": "rxjs",
        "commonjs2": "rxjs",
        "root": "rxjs_APIv7"
    },
    "rxjs/operators": {
        "commonjs": "rxjs/operators",
        "commonjs2": "rxjs/operators",
        "root": [
            "rxjs_APIv7",
            "operators"
        ]
    }
}
const exportedSymbols = {
    "@youwol/http-clients": {
        "apiKey": "3",
        "exportedSymbol": "@youwol/http-clients"
    },
    "@youwol/rx-tree-views": {
        "apiKey": "03",
        "exportedSymbol": "@youwol/rx-tree-views"
    },
    "@youwol/vsf-core": {
        "apiKey": "03",
        "exportedSymbol": "@youwol/vsf-core"
    },
    "rxjs": {
        "apiKey": "7",
        "exportedSymbol": "rxjs"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./index.ts",
    "loadDependencies": [
        "@youwol/vsf-core",
        "rxjs"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {
    "explorer": {
        "entryFile": "./lib/explorer/index.ts",
        "loadDependencies": [
            "@youwol/vsf-core",
            "@youwol/rx-tree-views",
            "rxjs",
            "@youwol/http-clients"
        ],
        "name": "explorer"
    },
    "reader": {
        "entryFile": "./lib/reader/index.ts",
        "loadDependencies": [
            "@youwol/vsf-core",
            "rxjs",
            "@youwol/http-clients"
        ],
        "name": "reader"
    }
}

const entries = {
     '@youwol/vsf-files': './index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/vsf-files/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/vsf-files',
        assetId:'QHlvdXdvbC92c2YtZmlsZXM=',
    version:'0.2.0-wip',
    shortDescription:"Visual Studio Flow toolbox gathering modules related to files management.",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/vsf-files&tab=doc',
    npmPackage:'https://www.npmjs.com/package/@youwol/vsf-files',
    sourceGithub:'https://github.com/youwol/vsf-files',
    userGuide:'https://l.youwol.com/doc/@youwol/vsf-files',
    apiVersion:'02',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/vsf-files_APIv02`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<WindowOrWorkerGlobalScope>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/vsf-files#0.2.0-wip~dist/@youwol/vsf-files/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/vsf-files/${entry.name}_APIv02`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}
