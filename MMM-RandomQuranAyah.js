Module.register("MMM-RandomQuranAyah",{
  // Default module config.
  defaults: {
    apiVersion: '1.0',
    showArabic: true,
    showTranslation: true,
    updateInterval: 3600 * 1000, // How often do you want to fetch and display new ayah? (milliseconds)
    animationSpeed: 2.5 * 1000, // Speed of the update animation. (Milliseconds)
  },

  dailyQuranVerse: "",

  start: function() {
    Log.info("Starting module: " + this.name);
    var self = this;

    // Fetch Quranic verses when module starts
    self.sendSocketNotification('START_QURAN', self.config);

    // Fetch Quranic verses at regular intervals
    setInterval(function() {
      self.sendSocketNotification('START_QURAN', self.config);
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification == "QURAN_RANDOM_RESULT") {
      var json = JSON.parse(payload.arabic); // Parse Arabic JSON
      var englishJson = JSON.parse(payload.english); // Parse English JSON
      var randomNumber = Math.floor(Math.random() * json.data.length); // Get a random verse
      var arabicVerse = json.data[randomNumber].ayah;
      var englishVerse = englishJson.data[randomNumber].text;
      // Other necessary data retrieval...

      // Show alert with the Quranic verse
      this.sendNotification("SHOW_ALERT", {
        title: "Random Quran Verse",
        message: "Arabic: " + arabicVerse + "\nEnglish: " + englishVerse
      });
    }
  }
});

const request = require('request');

module.exports = NodeHelper.create({
  start: function() {
    console.log('MMM-RandomQuranAyah helper started...');
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'START_QURAN') {
      this.fetchQuranVerses(payload);
    }
  },

  fetchQuranVerses: function(config) {
    const arabicURL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/ara-quranacademy.json';
    const englishURL = 'https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-muhammadasad.json';

    const self = this;
    request(arabicURL, function(error, response, arabicData) {
      if (!error && response.statusCode == 200) {
        request(englishURL, function(error, response, englishData) {
          if (!error && response.statusCode == 200) {
            self.sendSocketNotification('QURAN_RANDOM_RESULT', {
              arabic: arabicData,
              english: englishData
            });
          }
        });
      }
    });
  }
});
