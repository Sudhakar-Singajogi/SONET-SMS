const mail = require("@sendgrid/mail");
const sgMail = require("@sendgrid/mail");
const SETTINGS = require("./Settings");

const { key, templates, defaultSettings } = SETTINGS.sendGrid;
sgMail.setApiKey(key);
const templatesObj = {
  ...templates,
};

class Mail {
  async send(data) {
    const formatMsg = {
      ...defaultSettings,
      ...data,
      templateId: templates[data.templateId],
    };
    console.log(formatMsg);
    try {
      await sgMail.send(formatMsg);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}

module.exports = Mail;
