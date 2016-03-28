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
Go to [GNOME Extensions page](https://extensions.gnome.org/extension/1060/timezone/) and install it from there.


### Other way:
```sh
$ mkdir -p ~/.local/share/gnome-shell/extensions
$ git clone https://github.com/jwendell/gnome-shell-extension-timezone.git ~/.local/share/gnome-shell/extensions/timezone@jwendell
$ gnome-shell-extension-tool -e timezone@jwendell
```
If it doesn't appear near to the clock, try restarting the shell: `(ALT-F2 + r <ENTER>)`

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

