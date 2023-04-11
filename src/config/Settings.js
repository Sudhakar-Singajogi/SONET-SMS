const APPCONS = require(path.resolve("appconstants"));
module.exports = {
  sendGrid: {
    key: APPCONS.SENDGRIDKEY,
    defaultSettings: {
      to: APPCONS.SENDGRIDTO,
      from: "test@example.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
      templateId: "",
    },
    templates: {
      contactus: APPCONS.SENDGRIDCONTACTUSTEMPLATE,
      vendorRegistration: APPCONS.SENDGRIDVENDORTEMPLATE,
    },
  },
};
