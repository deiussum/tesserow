# Tesserow

Mosaic Pattern Maker for Crocheting

## Project notes

This project is a work in progress.  The goal is to create a tool that will allow you to create a mosaic pattern for crocheting.  The tool will allow you to import an image.  It will then generate a pattern that you can use to crochet the image.

## Running the app

This is a Tauri + React desktop application. Building it requires a Rust toolchain (`cargo`) in addition to Node, plus WebKitGTK dev headers on Linux.

To run this:

- Run `npm install` to install all of the dependencies.
- Run `npm start` to run the application.

## Installing

Installers for each release are attached to its [GitHub release](https://github.com/deiussum/tesserow/releases): a Flatpak bundle, `.deb`, `.rpm`, and AppImage for Linux, and an `.msi` and `-setup.exe` for Windows.

### Flatpak

```sh
flatpak install --user Tesserow_<version>_x86_64.flatpak
flatpak run com.deiussum.tesserow
```

The GNOME runtime it needs is installed from Flathub automatically. The Flatpak can read and write files anywhere in your home directory; to use files elsewhere (for example a USB drive under `/media`), grant access with:

```sh
flatpak override --user --filesystem=/media com.deiussum.tesserow
```

### Windows

The Windows installers are not code-signed, so Windows SmartScreen shows a "Windows protected your PC" warning when you run one. Choose **More info**, then **Run anyway** to install.

## Building the Flatpak

`npm run flatpak` builds the Flatpak from source and writes the bundle to `flatpak/dist/`. It needs `flatpak` with the Flathub remote added, plus either `flatpak-builder` or the Flathub-packaged builder (`flatpak install flathub org.flatpak.Builder`), and Python 3 to generate the offline dependency lists. The GNOME SDK and the Rust/Node SDK extensions are installed on first run. (The Flathub-packaged builder is sandboxed and can't see `/tmp`, so build from a checkout elsewhere when using it.)
