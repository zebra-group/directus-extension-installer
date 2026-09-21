# Directus Extension Installer
This little script was written to simlify our process with installing multiple directus extnsions in one instance while deploying a directus contaier to our kubernetes cluster.

It provides several diffrent methods to install the extensions from.  
You can provide your extension list as `*.json`, `string` or use the helm values file of the Directus Helm Chart.

## Installation
1. Download your needed version from our [latest release](https://github.com/zebra-group/directus-extension-installer/releases/latest)
2. Place the dowloaded executable in a folder that is inside your `$PATH`. e.g. on unix in `/bin` oder `/usr/bin`.

**Prerequisites**  
- git
- nodejs (with npm)

### MacOs
1. place downloaded executable in a folder within your `$PATH`
```console
mv ~/Downloads/dei-mac /usr/local/bin/dei
```
2. make it executable
```console
chmod +x /usr/local/bin/dei
```
3. allow the unsigned binary to be executed
```console
spctl --add --label "DEI" /usr/local/bin/dei
```
4. **(OPTIONAL)** remove it from quarantine
```console
xattr -d com.apple.quarantine /usr/local/bin/dei
```

### Windows
1. place downloaded executable somewhere safe  
e.g. create a folder `C:\bin` and put it there.
2. Press `WIN`-key + `R` and enter `sysdm.cpl` and hit `Enter`.
3. Navigate to the tab `Advanced`
4. Open `Environmentvariables` at the bottom
5. Double click on the `Path`-variable
6. Click on `New` and enter the location of the directory where the executable is located  
e.g. `C:\bin` 

## Usage
### with `*.json` file
**Required format:**
```json
[{
    "name": "<extension_name>",
    "git": "https://<git_url>",
    "type": "<extension_type>",
    "npm_install": true | false
}]
```
```console
directus-extension-installer <extensions-folder-path> -f extensions.json
```
```console
directus-extension-installer <extensions-folder-path> --file extensions.json
```
### with `string` format
It's basically a stringyfied version of the `json`-file contents.
```console
directus-extension-installer <extensions-folder-path> -s '[{"name": "EXTENSION_NAME","git": "HTTPS_GIT_URL","type": "EXTENSION_TYPE", "npm_install": "true | false"}]'
```
```console
directus-extension-installer <extensions-folder-path> --string '[{"name": "EXTENSION_NAME","git": "HTTPS_GIT_URL","type": "EXTENSION_TYPE", "npm_install": "true | false"}]'
```
### with `values.yaml` (helm)
**more information about format:** the extension list is read from `directus.extra_extensions.extensions` in your Directus Helm Chart `values.yaml`
```console
directus-extension-installer <extensions-folder-path> -y values.yaml
```
```console
directus-extension-installer <extensions-folder-path> --yaml values.yaml
```
## Required Values
> **name**  
> *should be a string that is complement with unix filesystem paths e.g. 'directus-extension'. This will be used as the extension name inside one of the extensions folders.*

> **git**  
> *Should be a full https-git-url in order to clone the extension properly. Also if it is located inside of a private repository the url should include the authentication*

> **type**  
> *should be one of the following: display, endpoint, hook, interface, layout, module, operation, panel or bundle. This places the extension inside the right extensions-subfolder.*

> **npm_install**  
> *OPTIONAL! Defaults to false. When set tu true it will run the `npm install` command inside the extension folder.*