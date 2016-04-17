# Timezone extension for GNOME Shell

Timezone is an extension for GNOME Shell aimed at helping remote teams by making
it easier to see where and **when** their coworkers are. It's inspired on 
**[Timezone.io](http://timezone.io)** .

![Screenshot](https://dl.dropboxusercontent.com/s/pmbc9psvmd97f4j/s2.png)

# Versions supported

It has been tested against GNOME Shell 3.16, 3.18 and 3.20.

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

You need a `people.json` file. By default we look for this file at your home directory. You can use a different path if you want. Just go to the preferences dialog. You can even use a remote location for this file (e.g.: https://domain.com/my-team/people.json). This way a whole team can share the `people.json` file.

The format of `people.json` file is the following:
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
  },
  {
    "github": "torvalds",
    "tz": "America/Los_Angeles"
  }
]
```
The only mandatory field is `tz`. Timezone codes are found [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

Photos can be provided through 3 fields:
- `gravatar`: Supply the email address registered at gravatar.com or libravatar.org
  - **_Niel_** in the example above
- `avatar`: Supply directly the URL of the image
  - **_Dan_** in the example above
- `github`: Supply a GitHub username.
  - **_torvalds_** in the example above

Instead of filling individual fields you can supply a **GitHub** username. Then
we try to get user's avatar, name and city from there. Still, we need the `tz`
field. GitHub doesn't provide one for us. See **_torvalds_** in the example above.
(Hopefully this might [change in the future](https://github.com/jwendell/gnome-shell-extension-timezone/issues/13)).

Individual fields have preference over remote providers. For instance, if you fill
the fields `name` and `github`, we will use the name you provided, not the github
one (although we still use github to fetch other data, like avatar and city).
