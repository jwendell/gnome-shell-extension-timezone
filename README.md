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
Timezone codes for the `tz` field can be found [here](http://momentjs.com/timezone/).

