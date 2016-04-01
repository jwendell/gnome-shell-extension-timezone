# Timezone extension for GNOME Shell

Timezone is an extension for GNOME Shell aimed at helping remote teams by making
it easier to see where and **when** their coworkers are. It's inspired on 
**[Timezone.io](http://timezone.io)** .

![Screenshot](https://dl.dropboxusercontent.com/s/xkwsfafitt17598/s1.png)

# Status

It's in a very early stage but it's working, although you have to edit config
file manually.

# Versions supported

It has been tested against GNOME Shell 3.18 and 3.20.

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
    "gravatar": "niel@example.com",
    "city": "Cape Town",
    "tz": "Africa/Johannesburg"
  }
]
```
Timezone codes for the `tz` field can be found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

Photos can be provided through 2 fields:
- `gravatar`: Supply the email address registered at gravatar.com or libravatar.org
  - **_Niel_** in the example above
- `avatar`: Supply directly the URL of the image
  - **_Dan_** in the example above

