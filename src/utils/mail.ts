import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'

export const sendEmail = (to: string, subject: string, payload: {name: string, password: string}) => {
  const source = fs.readFileSync(path.join(__dirname, './template.handlebars'), "utf8")
  const compiledTemplate = handlebars.compile(source)
  const html = compiledTemplate(payload)

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const config = {
    from: process.env.EMAIL_USERNAME,
    to,
    subject,
    html,
  }

  transporter.sendMail(config, console.log)
  transporter.close()
}