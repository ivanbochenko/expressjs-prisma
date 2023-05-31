import nodemailer from 'nodemailer'
import handlebars from 'handlebars'

export const sendEmail = (to: string, subject: string, payload: {name: string, password: string}) => {
  const source = `  
    <p>Hi {{name}},</p>
    <p>You requested to reset your password.</p>
    <p>Your new password is:</p>
    <b>{{password}}</b>
    <p>Thank's for keeping us in touch</p>
  `
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