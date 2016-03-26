# Timezone extension for GNOME Shell

Timezone is an extension for GNOME Shell aimed at helping remote teams by making
it easier to see where and **when** their coworkers are. It's inspired on 
**[Timezone.io](http://timezone.io)** .

![Screenshot](https://dl.dropboxusercontent.com/s/xkwsfafitt17598/s1.png)

# Status

It's in a very early stage but it's working, although you have to edit config
file manually.

# Versions supported

It has been tested against GNOME Shell 3.18.

# Install
### Easy way
Go to https://extensions.gnome.org/ and install it from there.  
**NOTE: This is not yet available.**

### Other way:
* Clone this [repo](https://github.com/jwendell/gnome-shell-extension-timezone.git) or download the [zip](https://github.com/jwendell/gnome-shell-extension-timezone/archive/master.zip)
* Copy or move or symlink the downloaded/cloned dir to `~/.local/share/gnome-shell/extensions/timezone@jwendell`.
  * `timezone@jwendell` Must be the name of the directory, otherwise the extension will not be loaded.
* Enable the extension, either:
  * Use `gnome-tweak-tool` if you have it installed (go to **Extensions** item); or
  * Use the command line: `gnome-shell-extension-tool -e timezone@jwendell`

# Configuration

Add a `people.json` file in your home directory in the following format:
```json
[
  {
    "name": "Dan",
    "avatar": "https://d389zggrogs7qo.cloudfront.net/images/team/dan.jpg",
    "city": "NYC",
    "tz": "America/New_York"
  },
  {
    "name": "Niel",
    "avatar": "https://d389zggrogs7qo.cloudfront.net/images/team/niel.jpg",
    "city": "Cape Town",
    "tz": "Africa/Johannesburg"
  }
]
```
Timezone codes for the `tz` field can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

**NOTE**: Every time you modify people.json file you need to restart gnome shell
`(ALT-F2 + r <ENTER>)` in order to changes take effect. This will be fixed
[soon](https://github.com/jwendell/gnome-shell-extension-timezone/issues/3).

