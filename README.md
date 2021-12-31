# Migirh

Migirh (*pronounced me-gi-li, or みぎり*): A **Mi**nyami **G**UI for **I**ndependent **R**ecording **H**LS.

[Minyami](https://github.com/Last-Order/Minyami) GUI based on electron.

Migirh is the successor and extension of the original biliroku-minyami project.

## Project structure

Migirh is divided into three repository:

|Name|Description
|:---|:---
|[Migirh-core](https://github.com/zyzsdy/Migirh-core)|Core components, providing database API and Minyami process management
|[Migirh-frontend](https://github.com/zyzsdy/Migirh-frontend)|Front-end interface
|[Migirh-electron](https://github.com/zyzsdy/Migirh-electron)|Electron API and build script

## Download

Please visit: https://github.com/zyzsdy/Migirh-electron/releases

## Build and contribute

1. Clone this repository, and then run `npm install`.

2. Execute `npm run start` to start the development server. The server will automatically restart after you make any changes.

3. Execute `npm run build` after modification to generate the latest build.

4. Execute `node dist/main.js` to run from the build.

> Please note: When sending a pull request, do not include configuration or automatically generated files such as `dist`, `config.yaml`, `.migirh`, and `.db3` files.

## Build with Electron

See: https://github.com/zyzsdy/Migirh-electron

## License

The code in this repository is licensed under the GNU General Public License Version 3. This license allows you to freely modify, personal or public use, commercial use, and redistribution. However, works that modify or use this code must be licensed under the same (GPLv3) license.

Full text of the license is available in the [LICENSE](LICENSE) file.
