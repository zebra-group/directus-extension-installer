import path from "node:path";
import {
    readDependenciesFromFile,
    parseStringToDependencies,
    parseYamlToDependencies,
    getExtensionPath,
    parseBoolean 
} from "../src/helpers";

describe('Parser', () => {
    const expectedObject = [{
        name: "extension-1",
        git: "https://github.com/zebra-group/extension-1",
        type: "endpoint",
        npm_install: true
    },
    {
        name: "extension-2",
        git: "https://github.com/zebra-group/extension-2",
        type: "hook"
    },
    {
        name: "extension-3",
        git: "https://github.com/zebra-group/extension-3",
        type: "module"
    }]

    it('readDependenciesFromFile should return Dependency Object from json file', () => {
        expect(readDependenciesFromFile(path.resolve('./tests/assets/test.json'))).toEqual(expectedObject)
    })
    it('parseStringToDependencies should return dependency object from stringyfied json', () => {
        const jsonString = '[{"name": "extension-1","git": "https://github.com/zebra-group/extension-1","type": "endpoint","npm_install": true},{"name": "extension-2","git": "https://github.com/zebra-group/extension-2","type": "hook"},{"name": "extension-3","git": "https://github.com/zebra-group/extension-3","type": "module"}]'
        expect(parseStringToDependencies(jsonString)).toEqual(expectedObject)
    })
    it('parseYamlToDependencies should return dependency object from yaml file with the right format', () => {
        expect(parseYamlToDependencies('./tests/assets/correct-test.yaml')).toEqual(expectedObject)
    })
    it('parseYamlToDependencies should throw error because no directus key was found in yaml', () => {
        expect(() => parseYamlToDependencies('./tests/assets/no_directus-test.yaml')).toThrow('There is no "directus" object in your yaml file. Please make sure to provide the right structure.')
    })
    it('parseYamlToDependencies should throw error because no extra_extensions key was found in yaml', () => {
        expect(() => parseYamlToDependencies('./tests/assets/no_extra_extensions-test.yaml')).toThrow('There are no extensions inside of your yaml or you have the wrong format.')
    })
    it('parseYamlToDependencies should throw error because no extensions were found in yaml', () => {
        expect(() => parseYamlToDependencies('./tests/assets/no_extensions-test.yaml')).toThrow('There are no extensions inside of your yaml or you have the wrong format.')
    })
})

describe('getExtensionPath', () => {
    it('should return the right path', () => {
        const testData =[
            {
                type: 'endpoint',
                path: 'endpoints'
            },
            {
                type: 'module',
                path: 'modules'
            },
            {
                type: 'hook',
                path: 'hooks'
            },
            {
                type: 'display',
                path: 'displays'
            },
            {
                type: 'interface',
                path: 'interfaces'
            },
            {
                type: 'layout',
                path: 'layouts'
            },
            {
                type: 'operation',
                path: 'operations'
            },
            {
                type: 'panel',
                path: 'panels'
            },
            {
                type: 'bundle',
                path: ''
            },
        ]
        for(const data of testData) {
            expect(getExtensionPath('extensions/', data.type, 'extension')).toBe(path.resolve('extensions/', data.path, 'extension'))
        }
    })
})

describe('parseBoolean', () => {
    it('should return true as bool', () => {
        expect(parseBoolean("true")).toBeTruthy()
    })
    it('should return false as bool', () => {
        expect(parseBoolean("false")).toBeFalsy()
    })
})