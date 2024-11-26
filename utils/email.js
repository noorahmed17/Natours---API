const nodeMailer = require("nodemailer");
const pug = require("pug");
const dotenv = require("dotenv");
const path = require("path");
const htmlToText = require("html-to-text");
dotenv.config({ path: path.resolve(__dirname, "../config.env") });

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = "Nour Ahmed <admin@natours.io>";
  }

  createNewTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodeMailer.createTransport({
        service: "sendGrid",
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodeMailer.createTransport({
      host: process.env.EMAIL_TESTING_HOST,
      port: process.env.EMAIL_TESTING_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_TESTING_USER,
        pass: process.env.EMAIL_TESTING_PASSWORD,
      },
      logger: true,
      debug: true,
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.createNewTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Thanks for joining the natours family");
  }

  async resetPassword() {
    await this.send("resetPassword", "Your password is reset");
  }
};
