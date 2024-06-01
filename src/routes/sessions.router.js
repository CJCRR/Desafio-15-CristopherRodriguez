import { Router } from "express";
import passport from "passport";
import UserPasswordModel from "../dao/models/user-password.model.js"
import { generateRandomString, createHash, __dirname } from '../utils.js'
import UserModel from "../dao/models/user.model.js";
import nodemailer from 'nodemailer'
import config from '../config/config.js'
import bcrypt from 'bcryptjs'
import { 
  createUserController, 
  failCreateUserController, 
  loginUserController, 
  errorLoginUserController, 
  failLoginUserController,
  githubLoginUserController,
  githubCallbackLoginUserController,
  readInfoUserController 
} from "../controllers/session.controller.js";

const router = Router();

// crea un usuario
router.post('/register', createUserController);

// devuelve un error al registrar un usuario
router.get('/failRegister', failCreateUserController);

// inicia sesión
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/failLogin'}), loginUserController, errorLoginUserController);

// devuelve un error al iniciar sesión
router.get('/failLogin', failLoginUserController);

//Autenticación. Estrategia con GitHub.
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), githubLoginUserController);

// callback de GitHub para iniciar sesión
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), githubCallbackLoginUserController);

// devuelve los detalles del usuario actual
router.get('/current', readInfoUserController);

// cambio de contraseña
router.post('/forget-password', async (req, res) => {
  const email = req.body.email
  const user = await UserModel.findOne({ email })
  if (!user) {
    return res.status(404).json({ status: 'error', error: 'User not found' });
  }
  const token = generateRandomString(16)
  await UserPasswordModel.create({ email, token })
  const mailerConfig = {
    service: 'gmail',
    auth: { user: config.mailDelEcommerce, pass: config.mailPasswordDelEcommerce }
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  let transporter = nodemailer.createTransport(mailerConfig)
  let message = {
    from: config.mailDelEcommerce,
    to: email,
    subject: 'Reset you password',
    html: `<h1>Reset you password</h1>
    <hr>Debes resetear tu password haciendo click en el siguiente link <a href="http://localhost:8080/api/sessions/verify-token/${token}" target="_blank">http://localhost:8080/api/sessions/verify-token/${token}</a>
    <hr>
    Saludos cordiales,<br>
    <b>CJCRR</b>`
  }
  try {
    await transporter.sendMail(message)
    res.json({ status: 'success', message: `Email enviado con exito a ${email} para restablecer la contraseña` })
  } catch (err) {
    res.status(500).json({ status: 'errorx', error: err.message })
  }
}); // Restablece la password para iniciar sesión mediante un mail enviado al correo del usuario ingresado

// verifica y redirecciona al usuario a cambiar la contraseña
router.get('/verify-token/:token', async (req, res) => {
  const token = req.params.token
  const userPassword = await UserPasswordModel.findOne({ token })
  if (!userPassword) {
    return res.redirect('/forget-password');
  }
  const user = userPassword.email;
  res.render('reset-password', {
    layout: 'main',
    user,
    styles: ['/css/styles.css']
  });
})

// devuelve al usuario la pagina para cambiar la contraseña
router.post('/reset-password/:user', async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.params.user })

    const newPassword = req.body.newPassword;

    const passwordsMatch = await bcrypt.compareSync(newPassword, user.password);
    if (passwordsMatch) {
      return res.json({ status: 'error', message: 'No puedes usar la misma contraseña' });
    }

    await UserModel.findByIdAndUpdate(user._id, { password: createHash(newPassword) })
    res.json({ status: 'success', message: 'Se ha creado una nueva contraseña' })
    await UserPasswordModel.deleteOne({ email: req.params.user })
  } catch (err) {
    res.json({ status: 'error', message: 'No se ha podido crear la nueva contraseña' })
  }
})

export default router;