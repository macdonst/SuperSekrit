var app = {
    // Application Constructor
    initialize: function() {
        //console.log("init");
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        console.log("bind");
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        // Fast click
        new FastClick(document.body);
        
        // Swipe events
        Hammer(document.body).on("swiperight", function() {
            conference.showSpeakers();
        });
        Hammer(document.body).on("swipeleft", function() {
            conference.showSessions();
        });
        
        // Click events
        document.getElementById("left").addEventListener('click', conference.showSpeakers, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log("we got a deviceready");
        console.log("width = " + window.innerWidth);
        console.log("height = " + window.innerHeight);
        
        // load language strings
        app.loadStrings();

        app.receivedEvent('deviceready');
        conference.init();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    },
    loadStrings: function() {        
        var lang = "en_US";
        conference.setLocal(lang);
        XHR("i18n/strings-"+lang+".json", function(data) {
            AppStrings = JSON.parse(data);  
            app.localize();                     
        });
    },
    localize: function() {
        var tabbar = document.getElementById("tabbar");
        tabbar.innerHTML = HungryFox.applyTemplate({}, tabbar.innerHTML);
        
        // bind click events
        document.getElementById("cBtn").addEventListener('click', conference.showSpeakers, false);
        document.getElementById("wBtn").addEventListener('click', conference.showSessions, false);
    }
};

var conference = {
    speakers: [],
    locale: "en_US",
    currentPanel: "speakers",
    init: function() {
        this.loadSpeakers();
        this.listSessions();
    },
    loadSpeakers: function() {
        var that = this;
        XHR("data/speakers.json", function(data) {
            that.speakers = JSON.parse(data);
            that.listSpeakers();
        });
    },
    setLocal: function (loc) {
    	console.log("setLocal = " + loc);
        this.locale = loc;
    },
    listSpeakers: function() {
        var text = document.getElementById("speaker-template").innerHTML;
        var list = document.createElement("ul");
        list.addEventListener("click", this.showSpeaker, true);
        var main = document.getElementById("speakers");
        for(var i = 0; i < this.speakers.length; i++) {
            var speaker = this.speakers[i];
            //console.log(JSON.stringify(councillor));        
            var item = document.createElement("li");
            item.setAttribute("id", speaker.id);
            var cpic = document.createElement("img");
            cpic.setAttribute("src", speaker["Photo URL"]);
            cpic.setAttribute("class", "list-icon");
            item.appendChild(cpic);
            var line1 = document.createElement("p");
            line1.setAttribute("class", "line1");
            line1.appendChild(document.createTextNode(speaker["First name"] + " " + speaker["Last name"]));
            var line2 = document.createElement("p");
            line2.setAttribute("class", "line2");
                                              
            line2.appendChild(document.createTextNode(speaker.company));
            
            item.appendChild(line1);
            item.appendChild(line2);
            
            var line3 = document.createElement("p");
            line3.setAttribute("class", "line3");
            line3.appendChild(document.createTextNode(speaker.title));            
            
            item.appendChild(line3);
            list.appendChild(item);
            document.body.appendChild(this.createPanel(speaker, text));
        }
        main.appendChild(list);
    },
    listSessions: function() {
        var sessions = document.getElementById("sessions");
        sessions.addEventListener("click", this.showSession, true);
    },
    showSpeaker: function(evt) {
        // console.log("current: " + conference.currentPanel);
        var srcElement = evt.srcElement;
        while(srcElement.tagName != "LI") {
            srcElement = srcElement.parentNode;
        }
        conference.showSpeakerById(srcElement.id);

        document.getElementById("left").removeEventListener('click', conference.showSessions, false);        
        document.getElementById("left").addEventListener('click', conference.showSpeakers, false);
    }, 
    showSession: function(evt) {
        console.log("current: " + conference.currentPanel);
        var panel = document.getElementById("fake-session");
        panel.setAttribute("class", "speaker-template");
        panel.setAttribute("style", "display: block");
        var main = document.getElementById(conference.currentPanel);
        main.setAttribute("style", "display: none");
        conference.currentPanel = "fake-session";
        document.addEventListener("backbutton", conference.showSessions, false);
        
        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");
        
        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        
        window.scrollTo(0,0);
        
        document.getElementById("left").removeEventListener('click', conference.showSessions, false);        
        document.getElementById("left").addEventListener('click', conference.showSpeakers, false);
    }, 
    showSpeakerById: function(id) {
        var panel = document.getElementById("panel"+id);
        panel.setAttribute("class", "speaker-template");
        panel.setAttribute("style", "display: block");
        var main = document.getElementById(conference.currentPanel);
        main.setAttribute("style", "display: none");
        conference.currentPanel = "panel"+id;
        document.addEventListener("backbutton", conference.showSpeakers, false);
        
        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: block");
        document.getElementById("addPerson").setAttribute("onclick", "conference.saveContact('" + id + "')");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showSpeakers: function() {
        //console.log("did we get the back button event");
        //console.log("showSpeakers current: " + conference.currentPanel);
        var panel = document.getElementById(conference.currentPanel);
        panel.setAttribute("style", "display: none");
        var main = document.getElementById("speakers");
        main.setAttribute("style", "display: block");
        conference.currentPanel = "speakers";

        conference.removeBackButtonListeners();

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid black");
        
        window.scrollTo(0,0);
    },
    showSessions: function() {
        //console.log("did we get the back button event");        
        console.log("showSessions current: " + conference.currentPanel);
        var panel = document.getElementById(conference.currentPanel);
        panel.setAttribute("style", "display: none");
        var session = document.getElementById("sessions");
        session.setAttribute("style", "display: block");
        conference.currentPanel = "sessions";
        
        conference.removeBackButtonListeners();

        // setup the add contact button
        document.getElementById("add").setAttribute("style", "display: none");

        // setup tabs        
        document.getElementById("cBtn").setAttribute("style", "border-bottom: 8px solid black");
        document.getElementById("wBtn").setAttribute("style", "border-bottom: 8px solid #2489ce");
        
        window.scrollTo(0,0);
    },
    removeBackButtonListeners: function() {
        document.removeEventListener("backbutton", conference.showSpeakers, false);
        document.removeEventListener("backbutton", conference.showSessions, false);
    },
    createPanel: function(speaker, text) {
        var panel = document.createElement("div");
        panel.setAttribute("style", "display: none");
        panel.setAttribute("id", "panel"+speaker.id);
        
        panel.innerHTML = HungryFox.applyTemplate(speaker, text);
   
        return panel;
    },    
    saveContact: function(id) {
        //console.log("save contact");
        console.log("id = " + id);
        for (var i=0; i<this.speakers.length; i++) {
            var speaker = this.speakers[i];
            if (speaker.id == id) {
                var contact = navigator.contacts.create();
                contact.displayName = speaker["First name"] + " " + speaker["Last name"];
                contact.name = new ContactName();
                contact.name.formatted = contact.displayName;
                contact.name.givenName = speaker["First name"];
                contact.name.familyName = speaker["Last name"];
                contact.urls = [];
                contact.urls.push(new ContactField("work", speaker["Twitter"], false));
                
                contact.save(function() {
                    navigator.notification.alert(contact.displayName, null, AppStrings.contactsaved);
                });
                break;
            }
        }
    }
};

var AppStrings = {};

var HungryFox = {
    applyTemplate: function(data, template) {
        for (var prop in data) {
            if (template.indexOf("{{" + prop + "}}") !== -1) {
                var re = new RegExp("\{\{" + prop + "\}\}", "g");
                template = template.replace(re, data[prop]);
            }
        } 
        for (var prop in AppStrings) {
            if (template.indexOf("{{" + prop + "}}") !== -1) {
                var re = new RegExp("\{\{" + prop + "\}\}", "g");
                template = template.replace(re, AppStrings[prop]);
            }
        }
        return template;  
    }  
};

var XHR = function(url, success, fail) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            if (request.status == 200 || request.status == 0) {
                //console.log("response = " + request.responseText);
                if (typeof success == "function") {
                    success(request.responseText);
                }
            } else {
                if (typeof fail == "function") {
                    fail();
                }
            }
        }
    }
    request.send();
};

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
             return this.indexOf(searchString, position) === position;
        }
    });
}
