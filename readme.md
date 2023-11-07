# ZSTIO-TV - An app for school announcement tv's

<p align="center"><img src="https://raw.githubusercontent.com/lemonekq/zstio-tv/main/img/head.png"></p>
<hr>

<p align="center">Everything you need to know about zstio-tv</p>

# Building - TV
> In order to build you will need msbuild (17 recommended)

1. Enter the zstio-tv directory (.csproj file location)
2. Open the command line and enter `msbuild` command (Make sure you have right msbuild in system env)

# Building - Modules
> As for example there, we will chose the happynumber module. Building modules is a bit harder than building the whole application. Before you will do anything with it, read the most important things about it.

- Structure of .tvmodule file:
	- `.tvmodule` file is an zstio-tv module packed into an **.7z** format. Every module can contain mostly api's that are required for the app in order to run with every single information avalible.

- Purpose of .tvmodule file:
	- We use them only for the easier implementation of things that could been done in c# - `We got an already done api in nodejs, why we wont use it?` thats why we made modules.

- Configuration of .tvmodule: 
	- In every single .tvmodule file, there should be an `executable` file without an extension, it will contain the command that will be executed in module folder.
	
	- `address` file will contain information useful for making powerful nodejs apis. for example; `localhost:2023` - an address for happynumber module.

1. Compress it into an .7z archive. Remember to make the filename same as the directory inside the archive that contains the module code.
2. Rename the extension into `.tvmodule` file
3. Drag and drop into modules folder of your zstio-tv (Automatically generated, in the directory where app was ran.)
# Running
> In order to run the app, just double-click on the executable of zstio-tv. It will automatically create an `modules` folder, where you can drop your built "binaries". You implement your modules yourself. You customize what modules you want.
>
> Modules loading times are different for every single system - matters from cpu.

# Spotify integration
>If you want to run it on your own, replace the Config.cs spotify data. Users are added in spotify development panel as long our spotify app isnt verified.
>
>Update: zstio-tv is skipping spotify integration by default. Enable it via config window [ESC]

<hr>

Fully Maintained by [lemonek](https://github.com/lemonekq) (GFX, CODE, DESIGN).
Built Using [WPF](https://github.com/dotnet/wpf), [.NET Framework](https://dotnet.microsoft.com/en-us/)
[See MIT License (ZSTIO-TV, WPF)](https://github.com/lemonekq/zstio-tv/blob/main/LICENSE).
<br><br>
