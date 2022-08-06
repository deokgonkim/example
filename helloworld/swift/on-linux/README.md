# Swift example project running on Linux

## Install Swift on Linux

  - Download : https://www.swift.org/download/
  - Extract

    ```bash
    cd ~/Applications
    tar xvfz ~/swift-5.6.2-RELEASE-ubuntu20.04.tar.gz
    ```

  - Prepare envfile

    `~/swift.sh`
    ```bash
    export SWIFT_HOME=~/Applications/swift-5.6.2-RELEASE-ubuntu20.04/usr
    
    export PATH=$SWIFT_HOME/bin:$PATH
    ```

## Prepare project

  - Reference : https://developer.apple.com/documentation/xcode/creating-a-standalone-swift-package-with-xcode

## Run project

  - (build and) Run

    - `swift run`
      ```
      Building for debugging...
      Build complete! (0.07s)
      Hello World
      ```

## Build project

  - Build

    - `swift build`
      ```bash
      Building for debugging...
      [6/6] Linking Hello
      Build complete! (0.72s)
    - `ls -l .build/debug`
      ```
      description.json  Hello.abi.json  Hello.build  Hello.product   Hello.swiftmodule      index
      Hello             Hello.autolink  Hello.o      Hello.swiftdoc  Hello.swiftsourceinfo  ModuleCache
      ```
    - `cd .build/debug`
    - `./Hello`
      ```
      Hello World
      ```
