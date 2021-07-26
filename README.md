# Mini Youtube
An extension that makes YouTube video float while you're reading/writing comments so you can do both at the same time.
The floating screen is resizable and can be dragged and placed anywhere on the screen.

## Safari
# Faster installation but annoying on the long run:
1. [Download the latest zip](https://github.com/Jonass-K/miniyoutube/releases/download/v1.3.0/Mini_Y.zip)
2. Extract the zip file and move the application to the Application directory
3. 
```bash
cd <path_of_downloaded_folder>
xattr -d com.apple.quarantine Mini\ Y.app
```
4. a. Open Safari and go to preferences
   
   b. develop menu -> click allow unsigned extension need to do this every time you start safari)
   
   c. extensions tab -> click the extension and allow the website youtube.com
   
# Bit more complicated but much better on the long run:
1. Clone the repository
2. Open the project in Xcode and sign both targets with your apple id account
   ![Signing Targets Screenshot](https://github.com/Jonass-K/miniyoutube/blob/safari-extension/Bildschirmfoto%202021-07-26%20um%2012.34.33.png?raw=true)
3. a. In top bar: Product->Archive

   b. Distribute -> Copy App
   
   c. Select a directory where to store the app
4. a. Open Safari and go to preferences
   
   b. develop menu -> click allow unsigned extension (just once to allow the extension)
   
   c. extensions tab -> click the extension and allow the website youtube.com


## Chrome
Download it on the [Chrome Web Store](http://goo.gl/TyNOlF)

## Edge
1. [Download the latest zip](https://github.com/japborst/miniyoutube/archive/master.zip)
2. Extract the zip file somewhere safe (it will need to remain there as long as you use the extension)
3. Browse to `about:flags` in Edge and turn on the option `Enable extension developer features`
4. Restart your browser
5. Go to Extensions in the browser menu and click `Load extension`
6. Select the `miniyoutube-master` folder you extracted earlier

Edge disables side-loaded extensions whenever you restart the browser, unfortunately. However after a few seconds you will get a prompt to re-enable them with a single click.

![Banner](https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/screenshots/promotional_tile_marquee.png)

# Screenshots

![Screenshot 1](https://raw.githubusercontent.com/jianweichuah/miniyoutube/master/screenshots/Screenshot1.png)

![Screenshot 2](https://raw.github.com/jianweichuah/miniyoutube/master/screenshots/Screenshot2.png)

# Changelogs
v1.3.0:
- The extension is now also available for safari.

v1.2.2:
- Show alert "flash videos not supported" when a flash video is being played

v1.2.1:
- Added option to pin the screen which would save the screen position and size for the future (even after you restart chrome).

v1.2.0:
- Added a set of predefined sizes S, M, L, XL so it's easier to resize the screen.
- You can still customize the size by dragging and resizing the bottom right corner.

v1.1.5:
- Added progress bar.

v1.1.1:
- Fixed minor bug of screen lingering after video has ended.

v1.1.0:
- Now supports screen resize!
- Just hover to the top right/bottom right corner and drag to resize the floated screen.

v1.0.3:
- Short click on the small screen to pause/play. Dragging won't interfere with this.

# License

[MIT License](https://github.com/jianweichuah/miniyoutube/blob/master/LICENSE.md)
