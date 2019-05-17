/*
* Vieb - Vim Inspired Electron Browser
* Copyright (C) 2019 Jelmer van Arnhem
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
/* global SETTINGS */
"use strict"

const path = require("path")
const rimraf = require("rimraf").sync
const {remote} = require("electron")

//This regex will be compiled when the file is loaded, so it's pretty fast
//The regex is explained in the isUrl function below
//eslint-disable-next-line max-len
const urlRegex = /^(([a-zA-Z\d]+\.|([a-zA-Z\d]+[a-zA-Z\d-][a-zA-Z\d]+)+\.)+[a-zA-Z]{2,}|localhost|(\d{1,3}\.){3}\d{1,3})(:\d{2,5})?(|\/.*|\?.*|#.*)$/
const protocolRegex = /^[a-z][a-z0-9-+.]+:\/\//

const hasProtocol = location => {
    //Check for a valid protocol at the start
    //This will ALWAYS result in the url being valid
    return protocolRegex.test(location)
}

const isUrl = location => {
    return hasProtocol(location) || urlRegex.test(location)
    //Checks if the location starts with one of the following:
    //- Valid domain with 0 or more subdomains
    //  - subdomains can have letters, digits and hyphens
    //  - hyphens cannot be at the end or the start of the subdomain
    //  - toplevel domains can only contain letters
    //- localhost
    //- An ipv4 address
    //After that, an optional port in the form of :22 or up to :22222
    //Lastly, it checks if the location ends with one of the following:
    //- Nothing
    //- Single slash character with anything behind it
    //- Single question mark with anything behind it
    //- Single number sign with anything behind it
}

const notify = (message, type="info") => {
    let properType = "info"
    if (type.startsWith("warn")) {
        properType = "warning"
    }
    if (type.startsWith("err")) {
        properType = "error"
    }
    const image = `img/notifications/${properType}.svg`
    if (SETTINGS.get("notification.system")) {
        new Notification(`Vieb ${properType}`, {
            "body": message,
            "image": image,
            "icon": image
        })
        return
    }
    const notificationsElement = document.getElementById("notifications")
    notificationsElement.className = SETTINGS.get("notification.position")
    const notification = document.createElement("span")
    const iconElement = document.createElement("img")
    iconElement.src = image
    notification.appendChild(iconElement)
    const textElement = document.createElement("span")
    textElement.innerHTML = message
        .replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/\n/g, "<br>")
    notification.appendChild(textElement)
    notificationsElement.appendChild(notification)
    setTimeout(() => {
        notificationsElement.removeChild(notification)
    }, SETTINGS.get("notification.duration"))
}

const specialPage = page => {
    return `file://${path.join(__dirname, `../pages/${page}.html`)}`
}

const clearCache = () => {
    rimraf(path.join(remote.app.getPath("appData"), "Cache"))
    rimraf(path.join(remote.app.getPath("appData"), "Code Cache"))
    rimraf(path.join(remote.app.getPath("appData"), "GPUCache"))
    rimraf(path.join(remote.app.getPath("appData"), "File System"))
}

const clearLocalStorage = () => {
    rimraf(path.join(remote.app.getPath("appData"), "IndexedDB"))
    rimraf(path.join(remote.app.getPath("appData"), "Local Storage"))
}

module.exports = {
    hasProtocol,
    isUrl,
    notify,
    specialPage,
    clearCache,
    clearLocalStorage
}
