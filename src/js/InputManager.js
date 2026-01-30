// ^Handles storing, retrieving, and clearing user input data
export class InputManager {
  constructor() {
    this.userInput = {
      country: "",
      countryCode: "",
      city: "",
      year: 2026,
      latitude: null,
      longitude: null,
    };
  }

  // Set/update the user input data
  setUserInput(country, countryCode, city, year, latin, long) {
    this.userInput.country = country;
    this.userInput.countryCode = countryCode;
    this.userInput.city = city;
    this.userInput.year = year;
    this.userInput.latitude = latin;
    this.userInput.longitude = long;
  }

  // Get the current user input
  getUserInput() {
    return this.userInput;
  }

  // Clear all user input, resetting values to empty strings
  clearUserInput() {
    this.userInput = {
      country: "",
      countryCode: "",
      city: "",
      year: 2026,
      latitude: null,
      longitude: null,
    };
  }
}
