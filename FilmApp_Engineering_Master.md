# Film Audition & Talent Hiring App

## Master Engineering Document

**Version:** 1.0 | **Prepared by:** ArgosMob Tech & AI Pvt. Ltd. **Stack:** React Native · Express.js · Supabase · PostgreSQL · VPS/NGINX

---

## Table of Contents

1. [Project Overview](#1-project-overview)  
2. [Tech Stack](#2-tech-stack)  
3. [User Roles](#3-user-roles)  
4. [Monorepo Folder Structure](#4-monorepo-folder-structure)  
5. [Backend — Express.js](#5-backend--expressjs)  
   - 5.1 [App Entry & Config](#51-app-entry--config)  
   - 5.2 [Middleware](#52-middleware)  
   - 5.3 [Routes](#53-routes)  
   - 5.4 [Controllers](#54-controllers)  
   - 5.5 [Services](#55-services)  
   - 5.6 [Utils & Helpers](#56-utils--helpers)  
   - 5.7 [Cron Jobs](#57-cron-jobs)  
6. [Database Schema](#6-database-schema)  
7. [Supabase Storage](#7-supabase-storage)  
8. [API Reference](#8-api-reference)  
9. [Mobile App — React Native](#9-mobile-app--react-native)  
   - 9.1 [Folder Structure](#91-folder-structure)  
   - 9.2 [State Management (Redux Toolkit)](#92-state-management-redux-toolkit)  
   - 9.3 [Navigation Structure](#93-navigation-structure)  
   - 9.4 [API Client](#94-api-client)  
   - 9.5 [Screens List](#95-screens-list)  
   - 9.6 [Shared Components](#96-shared-components)  
   - 9.7 [Artist App Screens — Key Code](#97-artist-app-screens--key-code)  
   - 9.8 [Hiring App Screens — Key Code](#98-hiring-app-screens--key-code)  
10. [Admin Panel — React.js](#10-admin-panel--reactjs)  
11. [Third-Party Integrations](#11-third-party-integrations)  
12. [Environment Variables](#12-environment-variables)  
13. [Security Checklist](#13-security-checklist)  
14. [React Native Libraries](#14-react-native-libraries)  
15. [Business Rules](#15-business-rules)  
16. [Deployment](#16-deployment)

---

## 1\. Project Overview

A two-sided mobile platform connecting **artists** (actors, singers, models, dancers, technicians) with **production houses and casting agencies** for audition discovery, talent hiring, and application management — with built-in verification, anti-scam controls, payments, and push notifications.

| Item | Detail |
| :---- | :---- |
| Platforms | Android · iOS · Web Admin Panel |
| Total Screens | 68 |
| Timeline | 4 months |
| Cost | INR 5,00,000 |
| Payment Terms | 40% Advance · 30% Mid · 20% Beta · 10% Completion |

---

## 2\. Tech Stack

| Layer | Technology |
| :---- | :---- |
| Mobile App | React Native (bare workflow) |
| Admin Panel | React.js \+ Vite |
| Backend | Node.js 20 LTS \+ Express.js 4 |
| Database | PostgreSQL 15 via Supabase |
| File Storage | Self-Hosted CDN / Local Disk (Express) |
| Auth | Supabase Auth \+ custom JWT |
| Payments | Cashfree (primary) / Razorpay (fallback) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| OTP / SMS | MSG91 |
| Email | SendGrid |
| Maps | Google Maps SDK \+ Places API |
| Social Login | Supabase Auth (Google, Facebook) |
| Realtime Chat | Socket.io |
| Hosting | VPS (Ubuntu 22.04) \+ NGINX |
| Process Manager | PM2 |
| CI/CD | GitHub Actions |

---

## 3\. User Roles

| Role | Value | Description |
| :---- | :---- | :---- |
| Artist | `artist` | Registers, builds portfolio, applies for auditions |
| Hiring User | `hiring` | Production house / casting agency / director — posts auditions, discovers talent |
| Admin | `admin` | Internal web panel — manages users, verifications, fraud, payments |

---

## 4\. Monorepo Folder Structure

/fameu_monorepo                    ← root monorepo

  /backend                         ← Express.js API server (Domain-Driven)

  /artist_app                      ← React Native CLI (Artist frontend)

  /hiring_app                      ← React Native CLI (Casting frontend)

  /admin_panel                     ← React.js admin panel

  /website                         ← React.js public website / landing page

  /shared                          ← Shared constants, types, validators

  docker-compose.yml

  .gitignore

  README.md

---

## 5\. Backend — Express.js

### Full Folder Structure

/backend

  /src

    /config

      db.js

      firebase.js

      cashfree.js

      env.js

      logger.js

    /middleware

      auth.js

      roleCheck.js

      upload.js

      validate.js

      rateLimiter.js

      errorHandler.js

    /routes

      index.js

      auth.routes.js

      artist.routes.js

      audition.routes.js

      hiring.routes.js

      payment.routes.js

      notification.routes.js

      admin.routes.js

    /controllers

      auth.controller.js

      artist.controller.js

      audition.controller.js

      hiring.controller.js

      payment.controller.js

      notification.controller.js

      admin.controller.js

    /services

      auth.service.js

      artist.service.js

      audition.service.js

      hiring.service.js

      payment.service.js

      notification.service.js

      admin.service.js

      storage.service.js

      otp.service.js

      email.service.js

    /utils

      jwt.js

      response.js

      constants.js

      validators.js

    /jobs

      expireAuditions.job.js

      cleanUnverified.job.js

      analyticsSnapshot.job.js

    app.js

    server.js

  .env

  .env.example

  package.json

  ecosystem.config.js              ← PM2 config

---

### 5.1 App Entry & Config

#### `server.js`

const app \= require('./app')

const { PORT } \= require('./config/env')

app.listen(PORT, () \=\> {

  console.log(\`Server running on port ${PORT}\`)

})

#### `app.js`

const express \= require('express')

const cors \= require('cors')

const helmet \= require('helmet')

const morgan \= require('morgan')

const routes \= require('./routes')

const { errorHandler } \= require('./middleware/errorHandler')

const { attachResponse } \= require('./utils/response')

const app \= express()

app.use(helmet())

app.use(cors({ origin: process.env.ALLOWED\_ORIGINS?.split(',') }))

app.use(express.json({ limit: '10mb' }))

app.use(express.urlencoded({ extended: true }))

app.use(morgan('combined'))

app.use(attachResponse)

app.use('/api/v1', routes)

app.use(errorHandler)

module.exports \= app

#### `config/env.js`

require('dotenv').config()

module.exports \= {

  PORT: process.env.PORT || 5000,

  NODE\_ENV: process.env.NODE\_ENV || 'development',

  JWT\_SECRET: process.env.JWT\_SECRET,

  JWT\_EXPIRES\_IN: process.env.JWT\_EXPIRES\_IN || '7d',

  SUPABASE\_URL: process.env.SUPABASE\_URL,

  SUPABASE\_SERVICE\_KEY: process.env.SUPABASE\_SERVICE\_KEY,

  CASHFREE\_APP\_ID: process.env.CASHFREE\_APP\_ID,

  CASHFREE\_SECRET\_KEY: process.env.CASHFREE\_SECRET\_KEY,

  CASHFREE\_ENV: process.env.CASHFREE\_ENV || 'PROD',

  MSG91\_API\_KEY: process.env.MSG91\_API\_KEY,

  MSG91\_TEMPLATE\_ID: process.env.MSG91\_TEMPLATE\_ID,

  SENDGRID\_API\_KEY: process.env.SENDGRID\_API\_KEY,

  FIREBASE\_PROJECT\_ID: process.env.FIREBASE\_PROJECT\_ID,

  FIREBASE\_PRIVATE\_KEY: process.env.FIREBASE\_PRIVATE\_KEY,

  FIREBASE\_CLIENT\_EMAIL: process.env.FIREBASE\_CLIENT\_EMAIL,

}

#### `config/db.js`

const { createClient } \= require('@supabase/supabase-js')

const { SUPABASE\_URL, SUPABASE\_SERVICE\_KEY } \= require('./env')

const supabase \= createClient(SUPABASE\_URL, SUPABASE\_SERVICE\_KEY)

module.exports \= supabase

#### `config/firebase.js`

const admin \= require('firebase-admin')

const { FIREBASE\_PROJECT\_ID, FIREBASE\_PRIVATE\_KEY, FIREBASE\_CLIENT\_EMAIL } \= require('./env')

if (\!admin.apps.length) {

  admin.initializeApp({

    credential: admin.credential.cert({

      projectId: FIREBASE\_PROJECT\_ID,

      privateKey: FIREBASE\_PRIVATE\_KEY.replace(/\\\\n/g, '\\n'),

      clientEmail: FIREBASE\_CLIENT\_EMAIL,

    }),

  })

}

module.exports \= admin

---

### 5.2 Middleware

#### `middleware/auth.js`

const jwt \= require('jsonwebtoken')

const { JWT\_SECRET } \= require('../config/env')

module.exports \= async (req, res, next) \=\> {

  const token \= req.headers.authorization?.split(' ')\[1\]

  if (\!token) return res.error('Unauthorized', 401\)

  try {

    const decoded \= jwt.verify(token, JWT\_SECRET)

    req.user \= decoded   // { id, role, email }

    next()

  } catch {

    return res.error('Invalid or expired token', 401\)

  }

}

#### `middleware/roleCheck.js`

module.exports \= (...roles) \=\> (req, res, next) \=\> {

  if (\!roles.includes(req.user?.role)) {

    return res.error('Forbidden — insufficient role', 403\)

  }

  next()

}

#### `middleware/upload.js`

const multer \= require('multer')

const storage \= multer.memoryStorage()

const fileFilter \= (allowedTypes) \=\> (req, file, cb) \=\> {

  if (allowedTypes.includes(file.mimetype)) cb(null, true)

  else cb(new Error(\`Invalid file type: ${file.mimetype}\`), false)

}

exports.uploadPhotos \= multer({

  storage,

  limits: { fileSize: 5 \* 1024 \* 1024 },   // 5MB

  fileFilter: fileFilter(\['image/jpeg', 'image/png', 'image/webp'\]),

}).array('photos', 5\)

exports.uploadVideo \= multer({

  storage,

  limits: { fileSize: 100 \* 1024 \* 1024 },  // 100MB

  fileFilter: fileFilter(\['video/mp4', 'video/quicktime'\]),

}).single('video')

exports.uploadResume \= multer({

  storage,

  limits: { fileSize: 5 \* 1024 \* 1024 },

  fileFilter: fileFilter(\['application/pdf'\]),

}).single('resume')

exports.uploadAudio \= multer({

  storage,

  limits: { fileSize: 20 \* 1024 \* 1024 },

  fileFilter: fileFilter(\['audio/mpeg', 'audio/wav'\]),

}).single('audio')

exports.uploadDocs \= multer({

  storage,

  limits: { fileSize: 10 \* 1024 \* 1024 },

  fileFilter: fileFilter(\['application/pdf', 'image/jpeg', 'image/png'\]),

}).fields(\[

  { name: 'aadhaar', maxCount: 1 },

  { name: 'pan', maxCount: 1 },

  { name: 'company\_reg', maxCount: 1 },

  { name: 'gst', maxCount: 1 },

  { name: 'selfie', maxCount: 1 },

\])

#### `middleware/rateLimiter.js`

const rateLimit \= require('express-rate-limit')

exports.otpLimiter \= rateLimit({

  windowMs: 10 \* 60 \* 1000,

  max: 5,

  message: { success: false, message: 'Too many OTP requests, try again in 10 minutes' },

})

exports.apiLimiter \= rateLimit({

  windowMs: 60 \* 1000,

  max: 100,

  message: { success: false, message: 'Rate limit exceeded' },

})

#### `middleware/errorHandler.js`

exports.errorHandler \= (err, req, res, next) \=\> {

  console.error(err)

  const status \= err.statusCode || 500

  const message \= err.message || 'Internal server error'

  res.status(status).json({ success: false, message, data: null })

}

---

### 5.3 Routes

#### `routes/index.js`

const router \= require('express').Router()

router.use('/auth',         require('./auth.routes'))

router.use('/artist',       require('./artist.routes'))

router.use('/audition',     require('./audition.routes'))

router.use('/hiring',       require('./hiring.routes'))

router.use('/payment',      require('./payment.routes'))

router.use('/notification', require('./notification.routes'))

router.use('/admin',        require('./admin.routes'))

module.exports \= router

#### `routes/auth.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/auth.controller')

const { otpLimiter, apiLimiter } \= require('../middleware/rateLimiter')

const auth \= require('../middleware/auth')

router.post('/send-otp',        otpLimiter, ctrl.sendOtp)

router.post('/verify-otp',      otpLimiter, ctrl.verifyOtp)

router.post('/register/artist', apiLimiter, ctrl.registerArtist)

router.post('/register/hiring', apiLimiter, ctrl.registerHiring)

router.post('/social-login',    apiLimiter, ctrl.socialLogin)

router.post('/login',           apiLimiter, ctrl.login)

router.post('/forgot-password', otpLimiter, ctrl.forgotPassword)

router.post('/reset-password',  apiLimiter, ctrl.resetPassword)

router.post('/logout',          auth,       ctrl.logout)

module.exports \= router

#### `routes/artist.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/artist.controller')

const auth \= require('../middleware/auth')

const role \= require('../middleware/roleCheck')

const { uploadPhotos, uploadVideo, uploadResume, uploadAudio } \= require('../middleware/upload')

router.use(auth)

router.get('/dashboard',                   ctrl.getDashboard)

router.get('/profile',       role('artist'), ctrl.getProfile)

router.put('/profile',       role('artist'), ctrl.updateProfile)

router.post('/profile/category-form', role('artist'), ctrl.submitCategoryForm)

router.post('/portfolio/photos',       role('artist'), uploadPhotos,  ctrl.uploadPhotos)

router.delete('/portfolio/photos/:id', role('artist'),               ctrl.deletePhoto)

router.post('/portfolio/videos',       role('artist'), uploadVideo,   ctrl.uploadVideo)

router.delete('/portfolio/videos/:id', role('artist'),               ctrl.deleteVideo)

router.post('/portfolio/resume',       role('artist'), uploadResume,  ctrl.uploadResume)

router.post('/portfolio/audio',        role('artist'), uploadAudio,   ctrl.uploadAudio)

router.post('/verification/request',   role('artist'), ctrl.requestVerification)

router.get('/verification/status',     role('artist'), ctrl.getVerificationStatus)

router.get('/:id',                                    ctrl.getPublicProfile)

module.exports \= router

#### `routes/audition.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/audition.controller')

const auth \= require('../middleware/auth')

const role \= require('../middleware/roleCheck')

router.use(auth)

router.get('/',                  ctrl.listAuditions)

router.get('/trending',          ctrl.getTrending)

router.get('/upcoming',          role('artist'), ctrl.getUpcoming)

router.get('/walkin',            ctrl.getWalkin)

router.get('/applications',      role('artist'), ctrl.getMyApplications)

router.get('/applications/:id',  role('artist'), ctrl.getApplicationDetail)

router.get('/:id',               ctrl.getDetail)

router.post('/:id/apply',        role('artist'), ctrl.apply)

router.post('/:id/bookmark',     role('artist'), ctrl.toggleBookmark)

router.post('/:id/report',       role('artist'), ctrl.reportAudition)

module.exports \= router

#### `routes/hiring.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/hiring.controller')

const auth \= require('../middleware/auth')

const role \= require('../middleware/roleCheck')

const { uploadDocs } \= require('../middleware/upload')

router.use(auth, role('hiring'))

router.get('/profile',                                          ctrl.getProfile)

router.put('/profile',                                          ctrl.updateProfile)

router.post('/verification/documents',        uploadDocs,       ctrl.uploadDocuments)

router.get('/verification/status',                              ctrl.getVerificationStatus)

router.post('/audition',                                        ctrl.postAudition)

router.get('/audition',                                         ctrl.getMyAuditions)

router.put('/audition/:id',                                     ctrl.editAudition)

router.delete('/audition/:id',                                  ctrl.deleteAudition)

router.get('/audition/:id/applications',                        ctrl.getApplicants)

router.get('/audition/:id/applications/:appId',                 ctrl.getApplicantDetail)

router.put('/audition/:id/applications/:appId/shortlist',       ctrl.shortlist)

router.put('/audition/:id/applications/:appId/reject',          ctrl.reject)

router.post('/audition/:id/schedule',                           ctrl.scheduleInterview)

router.get('/artists/search',                                   ctrl.searchArtists)

router.post('/artists/:id/contact',                             ctrl.sendContactRequest)

module.exports \= router

#### `routes/payment.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/payment.controller')

const auth \= require('../middleware/auth')

const role \= require('../middleware/roleCheck')

router.post('/webhook',            ctrl.webhook)   // public — Cashfree callback

router.use(auth)

router.post('/initiate',           role('hiring'), ctrl.initiate)

router.get('/transactions',        role('hiring'), ctrl.getTransactions)

module.exports \= router

#### `routes/notification.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/notification.controller')

const auth \= require('../middleware/auth')

router.use(auth)

router.get('/',              ctrl.getAll)

router.put('/:id/read',      ctrl.markRead)

router.put('/read-all',      ctrl.markAllRead)

router.post('/fcm-token',    ctrl.registerFcmToken)

module.exports \= router

#### `routes/admin.routes.js`

const router \= require('express').Router()

const ctrl \= require('../controllers/admin.controller')

const auth \= require('../middleware/auth')

const role \= require('../middleware/roleCheck')

router.use(auth, role('admin'))

router.get('/dashboard',                      ctrl.getDashboard)

router.get('/users',                          ctrl.getUsers)

router.put('/users/:id/activate',             ctrl.activateUser)

router.put('/users/:id/deactivate',           ctrl.deactivateUser)

router.get('/artists',                        ctrl.getArtists)

router.get('/verification/queue',             ctrl.getVerificationQueue)

router.put('/verification/:id/approve',       ctrl.approveCompany)

router.put('/verification/:id/reject',        ctrl.rejectCompany)

router.get('/verification/approved',          ctrl.getVerifiedCompanies)

router.get('/auditions',                      ctrl.getAllAuditions)

router.put('/auditions/:id/flag',             ctrl.flagAudition)

router.delete('/auditions/:id',               ctrl.removeAudition)

router.get('/fraud-reports',                  ctrl.getFraudReports)

router.put('/fraud-reports/:id/action',       ctrl.actionFraudReport)

router.post('/blacklist',                     ctrl.blacklistUser)

router.delete('/blacklist/:id',               ctrl.removeBlacklist)

router.get('/payments',                       ctrl.getPayments)

router.get('/analytics',                      ctrl.getAnalytics)

router.put('/cms',                            ctrl.updateCms)

module.exports \= router

---

### 5.4 Controllers

#### `utils/response.js`

exports.attachResponse \= (req, res, next) \=\> {

  res.success \= (data, message \= 'Success', code \= 200\) \=\>

    res.status(code).json({ success: true, message, data })

  res.error \= (message \= 'Error', code \= 400\) \=\>

    res.status(code).json({ success: false, message, data: null })

  next()

}

#### `controllers/auth.controller.js`

const AuthService \= require('../services/auth.service')

exports.sendOtp \= async (req, res) \=\> {

  try {

    const { mobile, email } \= req.body

    await AuthService.sendOtp({ mobile, email })

    return res.success(null, 'OTP sent')

  } catch (err) { return res.error(err.message) }

}

exports.verifyOtp \= async (req, res) \=\> {

  try {

    const result \= await AuthService.verifyOtp(req.body)

    return res.success(result, 'OTP verified')

  } catch (err) { return res.error(err.message) }

}

exports.registerArtist \= async (req, res) \=\> {

  try {

    const result \= await AuthService.registerArtist(req.body)

    return res.success(result, 'Artist registered', 201\)

  } catch (err) { return res.error(err.message) }

}

exports.registerHiring \= async (req, res) \=\> {

  try {

    const result \= await AuthService.registerHiring(req.body)

    return res.success(result, 'Hiring user registered', 201\)

  } catch (err) { return res.error(err.message) }

}

exports.socialLogin \= async (req, res) \=\> {

  try {

    const result \= await AuthService.socialLogin(req.body)

    return res.success(result, 'Login successful')

  } catch (err) { return res.error(err.message) }

}

exports.login \= async (req, res) \=\> {

  try {

    const result \= await AuthService.login(req.body)

    return res.success(result, 'Login successful')

  } catch (err) { return res.error(err.message, 401\) }

}

exports.forgotPassword \= async (req, res) \=\> {

  try {

    await AuthService.forgotPassword(req.body)

    return res.success(null, 'Reset OTP sent')

  } catch (err) { return res.error(err.message) }

}

exports.resetPassword \= async (req, res) \=\> {

  try {

    await AuthService.resetPassword(req.body)

    return res.success(null, 'Password reset successful')

  } catch (err) { return res.error(err.message) }

}

exports.logout \= async (req, res) \=\> {

  return res.success(null, 'Logged out')

}

#### `controllers/artist.controller.js`

const ArtistService \= require('../services/artist.service')

exports.getProfile \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.getProfile(req.user.id)

    return res.success(data)

  } catch (err) { return res.error(err.message) }

}

exports.updateProfile \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.updateProfile(req.user.id, req.body)

    return res.success(data, 'Profile updated')

  } catch (err) { return res.error(err.message) }

}

exports.submitCategoryForm \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.submitCategoryForm(req.user.id, req.body)

    return res.success(data, 'Category form saved')

  } catch (err) { return res.error(err.message) }

}

exports.uploadPhotos \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.uploadPhotos(req.user.id, req.files)

    return res.success(data, 'Photos uploaded')

  } catch (err) { return res.error(err.message) }

}

exports.deletePhoto \= async (req, res) \=\> {

  try {

    await ArtistService.deletePhoto(req.user.id, req.params.id)

    return res.success(null, 'Photo deleted')

  } catch (err) { return res.error(err.message) }

}

exports.uploadVideo \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.uploadVideo(req.user.id, req.file)

    return res.success(data, 'Video uploaded')

  } catch (err) { return res.error(err.message) }

}

exports.deleteVideo \= async (req, res) \=\> {

  try {

    await ArtistService.deleteVideo(req.user.id, req.params.id)

    return res.success(null, 'Video deleted')

  } catch (err) { return res.error(err.message) }

}

exports.uploadResume \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.uploadResume(req.user.id, req.file)

    return res.success(data, 'Resume uploaded')

  } catch (err) { return res.error(err.message) }

}

exports.uploadAudio \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.uploadAudio(req.user.id, req.file)

    return res.success(data, 'Audio uploaded')

  } catch (err) { return res.error(err.message) }

}

exports.getDashboard \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.getDashboard(req.user.id)

    return res.success(data)

  } catch (err) { return res.error(err.message) }

}

exports.requestVerification \= async (req, res) \=\> {

  try {

    await ArtistService.requestVerification(req.user.id)

    return res.success(null, 'Verification request submitted')

  } catch (err) { return res.error(err.message) }

}

exports.getVerificationStatus \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.getVerificationStatus(req.user.id)

    return res.success(data)

  } catch (err) { return res.error(err.message) }

}

exports.getPublicProfile \= async (req, res) \=\> {

  try {

    const data \= await ArtistService.getPublicProfile(req.params.id)

    return res.success(data)

  } catch (err) { return res.error(err.message) }

}

---

### 5.5 Services

#### `services/auth.service.js`

const supabase \= require('../config/db')

const bcrypt \= require('bcrypt')

const jwt \= require('../utils/jwt')

const OtpService \= require('./otp.service')

const EmailService \= require('./email.service')

const SALT\_ROUNDS \= 12

class AuthService {

  async sendOtp({ mobile, email }) {

    const otp \= Math.floor(100000 \+ Math.random() \* 900000).toString()

    const expiresAt \= new Date(Date.now() \+ 10 \* 60 \* 1000\)

    await supabase.from('otp\_store').upsert({

      identifier: mobile || email,

      otp,

      expires\_at: expiresAt,

    })

    if (mobile) await OtpService.sendSms(mobile, otp)

    if (email) await EmailService.sendOtp(email, otp)

  }

  async verifyOtp({ identifier, otp }) {

    const { data, error } \= await supabase

      .from('otp\_store')

      .select('\*')

      .eq('identifier', identifier)

      .eq('otp', otp)

      .gt('expires\_at', new Date().toISOString())

      .single()

    if (error || \!data) throw new Error('Invalid or expired OTP')

    await supabase.from('otp\_store').delete().eq('identifier', identifier)

    return { verified: true }

  }

  async registerArtist({ mobile, email, password, name }) {

    const hash \= await bcrypt.hash(password, SALT\_ROUNDS)

    const { data: user, error } \= await supabase

      .from('users')

      .insert({ mobile, email, password\_hash: hash, role: 'artist' })

      .select()

      .single()

    if (error) throw new Error(error.message)

    await supabase.from('artist\_profiles').insert({

      user\_id: user.id,

      full\_name: name,

    })

    const token \= jwt.sign({ id: user.id, role: 'artist', email })

    return { token, user: { id: user.id, role: 'artist', name } }

  }

  async registerHiring({ mobile, email, password, company\_name, company\_type }) {

    const hash \= await bcrypt.hash(password, SALT\_ROUNDS)

    const { data: user, error } \= await supabase

      .from('users')

      .insert({ mobile, email, password\_hash: hash, role: 'hiring' })

      .select()

      .single()

    if (error) throw new Error(error.message)

    await supabase.from('hiring\_profiles').insert({

      user\_id: user.id,

      company\_name,

      company\_type,

    })

    const token \= jwt.sign({ id: user.id, role: 'hiring', email })

    return { token, user: { id: user.id, role: 'hiring', company\_name } }

  }

  async login({ identifier, password }) {

    const { data: user } \= await supabase

      .from('users')

      .select('\*')

      .or(\`mobile.eq.${identifier},email.eq.${identifier}\`)

      .single()

    if (\!user) throw new Error('User not found')

    if (user.is\_blacklisted) throw new Error('Account is suspended')

    if (\!user.is\_active) throw new Error('Account is inactive')

    const match \= await bcrypt.compare(password, user.password\_hash)

    if (\!match) throw new Error('Invalid credentials')

    const token \= jwt.sign({ id: user.id, role: user.role, email: user.email })

    return { token, user: { id: user.id, role: user.role } }

  }

  async socialLogin({ firebase\_token, role }) {

    const admin \= require('../config/firebase')

    const decoded \= await admin.auth().verifyIdToken(firebase\_token)

    const { email, name, uid } \= decoded

    let { data: user } \= await supabase

      .from('users')

      .select('\*')

      .eq('email', email)

      .single()

    if (\!user) {

      const { data: newUser } \= await supabase

        .from('users')

        .insert({ email, role, firebase\_uid: uid })

        .select()

        .single()

      user \= newUser

      if (role \=== 'artist') {

        await supabase.from('artist\_profiles').insert({ user\_id: user.id, full\_name: name })

      }

    }

    const token \= jwt.sign({ id: user.id, role: user.role, email })

    return { token, user: { id: user.id, role: user.role } }

  }

  async forgotPassword({ identifier }) {

    const otp \= Math.floor(100000 \+ Math.random() \* 900000).toString()

    const expiresAt \= new Date(Date.now() \+ 10 \* 60 \* 1000\)

    await supabase.from('otp\_store').upsert({ identifier, otp, expires\_at: expiresAt })

    await OtpService.sendSms(identifier, otp)

  }

  async resetPassword({ identifier, otp, new\_password }) {

    await this.verifyOtp({ identifier, otp })

    const hash \= await bcrypt.hash(new\_password, SALT\_ROUNDS)

    await supabase

      .from('users')

      .update({ password\_hash: hash })

      .or(\`mobile.eq.${identifier},email.eq.${identifier}\`)

  }

}

module.exports \= new AuthService()

#### `services/artist.service.js`

const supabase \= require('../config/db')

const StorageService \= require('./storage.service')

class ArtistService {

  async getProfile(userId) {

    const { data, error } \= await supabase

      .from('artist\_profiles')

      .select('\*, actor\_details(\*), singer\_details(\*), model\_details(\*)')

      .eq('user\_id', userId)

      .single()

    if (error) throw new Error(error.message)

    return data

  }

  async updateProfile(userId, body) {

    const { data, error } \= await supabase

      .from('artist\_profiles')

      .update({ ...body, updated\_at: new Date() })

      .eq('user\_id', userId)

      .select()

      .single()

    if (error) throw new Error(error.message)

    await this.\_updateCompletionPct(data.id)

    return data

  }

  async submitCategoryForm(userId, body) {

    const { category, ...details } \= body

    const profile \= await this.getProfile(userId)

    const tableMap \= {

      actor: 'actor\_details',

      singer: 'singer\_details',

      model: 'model\_details',

      dancer: 'dancer\_details',

      technician: 'technician\_details',

    }

    const table \= tableMap\[category\]

    if (\!table) throw new Error('Invalid category')

    await supabase.from(table).upsert({ artist\_id: profile.id, ...details })

    await supabase.from('artist\_profiles').update({ category }).eq('id', profile.id)

    return { category, details }

  }

  async uploadPhotos(userId, files) {

    const profile \= await this.getProfile(userId)

    const urls \= await Promise.all(

      files.map(f \=\> StorageService.uploadFile(

        'artist-media',

        \`artists/${userId}/photos/${Date.now()}-${f.originalname}\`,

        f.buffer,

        f.mimetype

      ))

    )

    const existing \= profile.photo\_urls || \[\]

    const updated \= \[...existing, ...urls\]

    await supabase.from('artist\_profiles').update({ photo\_urls: updated }).eq('id', profile.id)

    return { photo\_urls: updated }

  }

  async deletePhoto(userId, photoId) {

    const profile \= await this.getProfile(userId)

    const updated \= (profile.photo\_urls || \[\]).filter(url \=\> \!url.includes(photoId))

    await supabase.from('artist\_profiles').update({ photo\_urls: updated }).eq('id', profile.id)

    await StorageService.deleteFile('artist-media', \`artists/${userId}/photos/${photoId}\`)

  }

  async uploadVideo(userId, file) {

    const url \= await StorageService.uploadFile(

      'artist-media',

      \`artists/${userId}/videos/${Date.now()}-${file.originalname}\`,

      file.buffer,

      file.mimetype

    )

    await supabase.from('artist\_profiles').update({ video\_url: url }).eq('user\_id', userId)

    return { video\_url: url }

  }

  async deleteVideo(userId) {

    await supabase.from('artist\_profiles').update({ video\_url: null }).eq('user\_id', userId)

  }

  async uploadResume(userId, file) {

    const url \= await StorageService.uploadFile(

      'artist-media',

      \`artists/${userId}/resume/${Date.now()}.pdf\`,

      file.buffer,

      file.mimetype

    )

    await supabase.from('artist\_profiles').update({ resume\_url: url }).eq('user\_id', userId)

    return { resume\_url: url }

  }

  async uploadAudio(userId, file) {

    const url \= await StorageService.uploadFile(

      'artist-media',

      \`artists/${userId}/audio/${Date.now()}-${file.originalname}\`,

      file.buffer,

      file.mimetype

    )

    await supabase.from('artist\_profiles').update({ audio\_url: url }).eq('user\_id', userId)

    return { audio\_url: url }

  }

  async getDashboard(userId) {

    const profile \= await this.getProfile(userId)

    const { data: nearby } \= await supabase

      .from('auditions')

      .select('\*')

      .eq('status', 'active')

      .eq('category', profile.category)

      .limit(10)

    const { data: trending } \= await supabase

      .from('auditions')

      .select('\*')

      .eq('status', 'active')

      .order('view\_count', { ascending: false })

      .limit(5)

    return { profile, nearby\_auditions: nearby, trending }

  }

  async requestVerification(userId) {

    await supabase

      .from('artist\_profiles')

      .update({ verification\_status: 'requested' })

      .eq('user\_id', userId)

  }

  async getVerificationStatus(userId) {

    const { data } \= await supabase

      .from('artist\_profiles')

      .select('verification\_status, is\_verified')

      .eq('user\_id', userId)

      .single()

    return data

  }

  async getPublicProfile(artistId) {

    const { data } \= await supabase

      .from('artist\_profiles')

      .select('\*')

      .eq('id', artistId)

      .single()

    return data

  }

  async \_updateCompletionPct(profileId) {

    const { data } \= await supabase.from('artist\_profiles').select('\*').eq('id', profileId).single()

    const fields \= \['full\_name','category','age','gender','city','bio','photo\_urls','video\_url','resume\_url'\]

    const filled \= fields.filter(f \=\> data\[f\] && (Array.isArray(data\[f\]) ? data\[f\].length \> 0 : true)).length

    const pct \= Math.round((filled / fields.length) \* 100\)

    await supabase.from('artist\_profiles').update({ profile\_complete\_pct: pct }).eq('id', profileId)

  }

}

module.exports \= new ArtistService()

#### `services/storage.service.js`

const supabase \= require('../config/db')

class StorageService {

  async uploadFile(bucket, path, buffer, contentType) {

    const { error } \= await supabase.storage

      .from(bucket)

      .upload(path, buffer, { contentType, upsert: true })

    if (error) throw new Error(error.message)

    const { data } \= supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl

  }

  async deleteFile(bucket, path) {

    await supabase.storage.from(bucket).remove(\[path\])

  }

  async getSignedUrl(bucket, path, expiresIn \= 3600\) {

    const { data, error } \= await supabase.storage

      .from(bucket)

      .createSignedUrl(path, expiresIn)

    if (error) throw new Error(error.message)

    return data.signedUrl

  }

}

module.exports \= new StorageService()

#### `services/notification.service.js`

const supabase \= require('../config/db')

const admin \= require('../config/firebase')

class NotificationService {

  async sendPush(userId, title, body, data \= {}) {

    const { data: user } \= await supabase

      .from('users')

      .select('fcm\_token')

      .eq('id', userId)

      .single()

    if (\!user?.fcm\_token) return

    await admin.messaging().send({

      token: user.fcm\_token,

      notification: { title, body },

      data,

    })

  }

  async createNotification(userId, type, title, body, data \= {}) {

    await supabase.from('notifications').insert({

      user\_id: userId,

      type,

      title,

      body,

      data,

    })

    await this.sendPush(userId, title, body, data)

  }

  async getAll(userId) {

    const { data } \= await supabase

      .from('notifications')

      .select('\*')

      .eq('user\_id', userId)

      .order('created\_at', { ascending: false })

    return data

  }

  async markRead(notificationId) {

    await supabase.from('notifications').update({ is\_read: true }).eq('id', notificationId)

  }

  async markAllRead(userId) {

    await supabase.from('notifications').update({ is\_read: true }).eq('user\_id', userId)

  }

}

module.exports \= new NotificationService()

#### `services/payment.service.js`

const supabase \= require('../config/db')

const axios \= require('axios')

const crypto \= require('crypto')

const { CASHFREE\_APP\_ID, CASHFREE\_SECRET\_KEY, CASHFREE\_ENV } \= require('../config/env')

const BASE\_URL \= CASHFREE\_ENV \=== 'PROD'

  ? 'https://api.cashfree.com/pg'

  : 'https://sandbox.cashfree.com/pg'

class PaymentService {

  async initiate(companyId, type) {

    const orderId \= \`order\_${Date.now()}\`

    const payload \= {

      order\_id: orderId,

      order\_amount: 10,

      order\_currency: 'INR',

      customer\_details: { customer\_id: companyId, customer\_name: 'Hiring User', customer\_email: 'noreply@filmapp.in', customer\_phone: '9999999999' },

      order\_meta: { return\_url: \`https://filmapp.in/payment/return?order\_id=${orderId}\` },

    }

    const res \= await axios.post(\`${BASE\_URL}/orders\`, payload, {

      headers: {

        'x-api-version': '2023-08-01',

        'x-client-id': CASHFREE\_APP\_ID,

        'x-client-secret': CASHFREE\_SECRET\_KEY,

      },

    })

    await supabase.from('payments').insert({

      hiring\_id: companyId,

      order\_id: orderId,

      amount: 10,

      type,

      status: 'pending',

    })

    return res.data

  }

  async verifyWebhook(payload, signature) {

    const rawBody \= JSON.stringify(payload)

    const expected \= crypto

      .createHmac('sha256', CASHFREE\_SECRET\_KEY)

      .update(rawBody)

      .digest('base64')

    if (expected \!== signature) throw new Error('Invalid webhook signature')

    const { order\_id, order\_status } \= payload.data.order

    if (order\_status \=== 'PAID') {

      await supabase.from('payments').update({ status: 'paid' }).eq('order\_id', order\_id)

      // credit the company with \+1 post credit

      const { data: payment } \= await supabase.from('payments').select('hiring\_id').eq('order\_id', order\_id).single()

      await supabase.rpc('increment\_credits', { company\_id: payment.hiring\_id })

    }

  }

  async getTransactions(companyId) {

    const { data } \= await supabase

      .from('payments')

      .select('\*')

      .eq('hiring\_id', companyId)

      .order('created\_at', { ascending: false })

    return data

  }

}

module.exports \= new PaymentService()

#### `services/otp.service.js`

const axios \= require('axios')

const { MSG91\_API\_KEY, MSG91\_TEMPLATE\_ID, MSG91\_SENDER\_ID } \= require('../config/env')

class OtpService {

  async sendSms(mobile, otp) {

    await axios.post('https://api.msg91.com/api/v5/otp', {

      template\_id: MSG91\_TEMPLATE\_ID,

      mobile,

      otp,

    }, {

      headers: { authkey: MSG91\_API\_KEY },

    })

  }

}

module.exports \= new OtpService()

#### `services/email.service.js`

const sgMail \= require('@sendgrid/mail')

const { SENDGRID\_API\_KEY } \= require('../config/env')

sgMail.setApiKey(SENDGRID\_API\_KEY)

class EmailService {

  async sendOtp(email, otp) {

    await sgMail.send({

      to: email,

      from: 'noreply@filmapp.in',

      subject: 'Your OTP for Film App',

      text: \`Your OTP is ${otp}. Valid for 10 minutes.\`,

    })

  }

  async sendWelcome(email, name) {

    await sgMail.send({

      to: email,

      from: 'noreply@filmapp.in',

      subject: 'Welcome to Film App',

      text: \`Hi ${name}, welcome to Film App\! Start building your portfolio today.\`,

    })

  }

  async sendApplicationStatus(email, auditionTitle, status) {

    await sgMail.send({

      to: email,

      from: 'noreply@filmapp.in',

      subject: \`Application Update — ${auditionTitle}\`,

      text: \`Your application for "${auditionTitle}" has been ${status}.\`,

    })

  }

}

module.exports \= new EmailService()

---

### 5.6 Utils & Helpers

#### `utils/jwt.js`

const jwt \= require('jsonwebtoken')

const { JWT\_SECRET, JWT\_EXPIRES\_IN } \= require('../config/env')

exports.sign \= (payload) \=\> jwt.sign(payload, JWT\_SECRET, { expiresIn: JWT\_EXPIRES\_IN })

exports.verify \= (token) \=\> jwt.verify(token, JWT\_SECRET)

#### `utils/constants.js`

exports.ARTIST\_CATEGORIES \= \[

  'actor', 'singer', 'model', 'dancer', 'voice\_artist',

  'musician', 'influencer', 'anchor', 'writer', 'director',

  'editor', 'cinematographer', 'makeup\_artist', 'stylist',

  'technician', 'background\_artist',

\]

exports.HIRING\_TYPES \= \[

  'production\_house', 'casting\_agency', 'individual\_director',

  'talent\_manager', 'event\_organizer', 'ad\_agency', 'ott\_team',

\]

exports.APPLICATION\_STATUS \= \['pending', 'shortlisted', 'rejected', 'interview\_scheduled'\]

exports.AUDITION\_STATUS \= \['active', 'closed', 'draft', 'expired'\]

exports.VERIFICATION\_STATUS \= \['unverified', 'requested', 'pending', 'approved', 'rejected'\]

---

### 5.7 Cron Jobs

#### `jobs/expireAuditions.job.js`

const cron \= require('node-cron')

const supabase \= require('../config/db')

cron.schedule('0 0 \* \* \*', async () \=\> {

  const today \= new Date().toISOString().split('T')\[0\]

  await supabase

    .from('auditions')

    .update({ status: 'expired' })

    .lt('audition\_date', today)

    .eq('status', 'active')

  console.log('\[CRON\] Expired auditions updated')

})

#### `jobs/cleanUnverified.job.js`

const cron \= require('node-cron')

const supabase \= require('../config/db')

cron.schedule('0 2 \* \* 0', async () \=\> {

  const cutoff \= new Date(Date.now() \- 30 \* 24 \* 60 \* 60 \* 1000).toISOString()

  await supabase

    .from('users')

    .delete()

    .eq('is\_active', false)

    .lt('created\_at', cutoff)

  console.log('\[CRON\] Cleaned unverified users')

})

#### `ecosystem.config.js` (PM2)

module.exports \= {

  apps: \[{

    name: 'film-app-api',

    script: 'src/server.js',

    instances: 'max',

    exec\_mode: 'cluster',

    env\_production: {

      NODE\_ENV: 'production',

      PORT: 5000,

    },

  }\],

}

---

## 6\. Database Schema

### `users`

CREATE TABLE users (

  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  mobile          TEXT UNIQUE,

  email           TEXT UNIQUE,

  role            TEXT NOT NULL CHECK (role IN ('artist','hiring','admin')),

  is\_active       BOOLEAN DEFAULT TRUE,

  is\_blacklisted  BOOLEAN DEFAULT FALSE,

  fcm\_token       TEXT,

  created\_at      TIMESTAMPTZ DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ DEFAULT NOW()

);

### `otp_store`

CREATE TABLE otp\_store (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  identifier  TEXT NOT NULL,

  otp         TEXT NOT NULL,

  expires\_at  TIMESTAMPTZ NOT NULL,

  created\_at  TIMESTAMPTZ DEFAULT NOW()

);

CREATE UNIQUE INDEX ON otp\_store(identifier);

### `artist_profiles`

CREATE TABLE artist\_profiles (

  id                    UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id               UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  full\_name             TEXT,

  category              TEXT,

  age                   INT,

  gender                TEXT,

  height                TEXT,

  weight                TEXT,

  city                  TEXT,

  bio                   TEXT,

  experience            TEXT,

  languages             TEXT\[\],

  skills                TEXT\[\],

  photo\_urls            TEXT\[\],

  video\_url             TEXT,

  resume\_url            TEXT,

  audio\_url             TEXT,

  social\_links          JSONB,

  is\_verified           BOOLEAN DEFAULT FALSE,

  verification\_status   TEXT DEFAULT 'unverified',

  profile\_complete\_pct  INT DEFAULT 0,

  travel\_available      BOOLEAN DEFAULT FALSE,

  created\_at            TIMESTAMPTZ DEFAULT NOW(),

  updated\_at            TIMESTAMPTZ DEFAULT NOW()

);

### `actor_details`

CREATE TABLE actor\_details (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id   UUID UNIQUE REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  body\_type   TEXT,

  skin\_tone   TEXT,

  hair\_color  TEXT,

  eye\_color   TEXT,

  acting\_exp  TEXT,

  monologue\_url TEXT

);

### `singer_details`

CREATE TABLE singer\_details (

  id            UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id     UUID UNIQUE REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  singing\_genre TEXT\[\],

  vocal\_range   TEXT,

  instruments   TEXT\[\],

  singing\_exp   TEXT

);

### `model_details`

CREATE TABLE model\_details (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id       UUID UNIQUE REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  measurements    TEXT,

  shoe\_size       TEXT,

  ramp\_exp        TEXT,

  brand\_history   TEXT

);

### `dancer_details`

CREATE TABLE dancer\_details (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id       UUID UNIQUE REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  dance\_styles    TEXT\[\],

  training        TEXT,

  competition\_history TEXT,

  certifications  TEXT\[\]

);

### `technician_details`

CREATE TABLE technician\_details (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id       UUID UNIQUE REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  sub\_category    TEXT,

  equipment       TEXT,

  software\_skills TEXT\[\],

  work\_exp        TEXT

);

### `hiring_profiles`

CREATE TABLE hiring\_profiles (

  id                  UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id             UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  company\_name        TEXT NOT NULL,

  company\_type        TEXT NOT NULL,

  logo\_url            TEXT,

  description         TEXT,

  social\_links        JSONB,

  is\_verified         BOOLEAN DEFAULT FALSE,

  verification\_status TEXT DEFAULT 'pending',

  credits             INT DEFAULT 0,

  created\_at          TIMESTAMPTZ DEFAULT NOW(),

  updated\_at          TIMESTAMPTZ DEFAULT NOW()

);

### `verification_documents`

CREATE TABLE verification\_documents (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  hiring\_id       UUID REFERENCES hiring\_profiles(id) ON DELETE CASCADE,

  aadhaar\_url     TEXT,

  pan\_url         TEXT,

  company\_reg\_url TEXT,

  gst\_url         TEXT,

  selfie\_url      TEXT,

  status          TEXT DEFAULT 'pending',

  reviewed\_by     UUID REFERENCES users(id),

  review\_note     TEXT,

  created\_at      TIMESTAMPTZ DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ DEFAULT NOW()

);

### `auditions`

CREATE TABLE auditions (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  hiring\_id       UUID REFERENCES hiring\_profiles(id) ON DELETE CASCADE,

  title           TEXT NOT NULL,

  role\_description TEXT,

  character\_req   TEXT,

  category        TEXT,

  language        TEXT\[\],

  age\_min         INT,

  age\_max         INT,

  gender          TEXT,

  audition\_type   TEXT CHECK (audition\_type IN ('walkin','scheduled')),

  venue\_address   TEXT,

  lat             DOUBLE PRECISION,

  lng             DOUBLE PRECISION,

  audition\_date   DATE,

  audition\_time   TIME,

  compensation    TEXT,

  required\_docs   TEXT,

  instructions    TEXT,

  status          TEXT DEFAULT 'active',

  view\_count      INT DEFAULT 0,

  created\_at      TIMESTAMPTZ DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX ON auditions(status, category, audition\_date);

CREATE INDEX ON auditions(lat, lng);

### `applications`

CREATE TABLE applications (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  audition\_id     UUID REFERENCES auditions(id) ON DELETE CASCADE,

  artist\_id       UUID REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  cover\_note      TEXT,

  selected\_video  TEXT,

  status          TEXT DEFAULT 'pending'

                  CHECK (status IN ('pending','shortlisted','rejected','interview\_scheduled')),

  interview\_date  TIMESTAMPTZ,

  interview\_venue TEXT,

  created\_at      TIMESTAMPTZ DEFAULT NOW(),

  updated\_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(audition\_id, artist\_id)

);

### `bookmarks`

CREATE TABLE bookmarks (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  artist\_id   UUID REFERENCES artist\_profiles(id) ON DELETE CASCADE,

  audition\_id UUID REFERENCES auditions(id) ON DELETE CASCADE,

  created\_at  TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(artist\_id, audition\_id)

);

### `fraud_reports`

CREATE TABLE fraud\_reports (

  id           UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  reported\_by  UUID REFERENCES users(id),

  audition\_id  UUID REFERENCES auditions(id),

  reason       TEXT NOT NULL,

  status       TEXT DEFAULT 'open',

  action\_taken TEXT,

  created\_at   TIMESTAMPTZ DEFAULT NOW()

);

### `payments`

CREATE TABLE payments (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  hiring\_id   UUID REFERENCES hiring\_profiles(id),

  order\_id    TEXT UNIQUE NOT NULL,

  amount      NUMERIC DEFAULT 10,

  currency    TEXT DEFAULT 'INR',

  type        TEXT,

  status      TEXT DEFAULT 'pending',

  gateway\_ref TEXT,

  created\_at  TIMESTAMPTZ DEFAULT NOW()

);

### `notifications`

CREATE TABLE notifications (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id     UUID REFERENCES users(id) ON DELETE CASCADE,

  type        TEXT NOT NULL,

  title       TEXT NOT NULL,

  body        TEXT,

  data        JSONB,

  is\_read     BOOLEAN DEFAULT FALSE,

  created\_at  TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX ON notifications(user\_id, is\_read);

### `cms_content`

CREATE TABLE cms\_content (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  key         TEXT UNIQUE NOT NULL,

  value       JSONB,

  updated\_at  TIMESTAMPTZ DEFAULT NOW()

);

INSERT INTO cms\_content (key, value) VALUES

  ('banner', '\[\]'),

  ('faq', '\[\]'),

  ('terms', '""'),

  ('privacy', '""');

### `blacklist`

CREATE TABLE blacklist (

  id          UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  user\_id     UUID REFERENCES users(id),

  reason      TEXT,

  added\_by    UUID REFERENCES users(id),

  created\_at  TIMESTAMPTZ DEFAULT NOW()

);

### `analytics_snapshots`

CREATE TABLE analytics\_snapshots (

  id              UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  snapshot\_date   DATE UNIQUE,

  total\_artists   INT,

  total\_hiring    INT,

  active\_auditions INT,

  total\_apps      INT,

  revenue         NUMERIC,

  created\_at      TIMESTAMPTZ DEFAULT NOW()

);

### Supabase RPC (stored procedure)

CREATE OR REPLACE FUNCTION increment\_credits(company\_id UUID)

RETURNS VOID AS $$

  UPDATE hiring\_profiles SET credits \= credits \+ 1 WHERE id \= company\_id;

$$ LANGUAGE SQL;

### `followers`

CREATE TABLE followers (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  follower_id     UUID REFERENCES users(id) ON DELETE CASCADE,

  following_id    UUID REFERENCES users(id) ON DELETE CASCADE,

  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(follower_id, following_id)

);

CREATE INDEX ON followers(following_id);

CREATE INDEX ON followers(follower_id);

### `messages`

CREATE TABLE messages (

  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  sender_id       UUID REFERENCES users(id) ON DELETE CASCADE,

  receiver_id     UUID REFERENCES users(id) ON DELETE CASCADE,

  content         TEXT NOT NULL,

  is_read         BOOLEAN DEFAULT FALSE,

  created_at      TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX ON messages(sender_id, receiver_id);

CREATE INDEX ON messages(receiver_id, is_read);

---

## 7\. File Storage & CDN Setup (Self-Hosted)

All media is uploaded to the Express.js server and served via a CDN setup (e.g., NGINX serving static folders or Cloudflare).

| Directory | Path Pattern | Access Policy |
| :---- | :---- | :---- |
| `/uploads/artists` | `/artists/{userId}/photos/` | Public read via CDN |
| `/uploads/artists` | `/artists/{userId}/videos/` | Public read via CDN |
| `/uploads/artists` | `/artists/{userId}/resume/` | Authenticated (Express route) |
| `/uploads/artists` | `/artists/{userId}/audio/` | Public read via CDN |
| `/uploads/hiring` | `/hiring/{companyId}/verification/` | Admin only (Express route) |
| `/uploads/assets` | `/banners/`, `/misc/` | Public read via CDN |

---

## 8\. API Reference

**Base URL:** `https://api.yourdomain.com/api/v1`

**Auth header:** `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Body | Auth |
| :---- | :---- | :---- | :---- |
| POST | `/auth/send-otp` | `{ mobile?, email? }` | Public |
| POST | `/auth/verify-otp` | `{ identifier, otp }` | Public |
| POST | `/auth/register/artist` | `{ mobile, email, password, name }` | Public |
| POST | `/auth/register/hiring` | `{ mobile, email, password, company_name, company_type }` | Public |
| POST | `/auth/social-login` | `{ supabase_token, role }` | Public |
| POST | `/auth/login` | `{ identifier, password }` | Public |
| POST | `/auth/forgot-password` | `{ identifier }` | Public |
| POST | `/auth/reset-password` | `{ identifier, otp, new_password }` | Public |
| POST | `/auth/logout` | — | JWT |

### Artist

| Method | Endpoint | Notes | Auth |
| :---- | :---- | :---- | :---- |
| GET | `/artist/profile` | Own profile | Artist |
| PUT | `/artist/profile` | Update fields | Artist |
| POST | `/artist/profile/category-form` | Submit form by category | Artist |
| POST | `/artist/portfolio/photos` | `multipart/form-data` photos\[\] | Artist |
| DELETE | `/artist/portfolio/photos/:id` | Remove photo | Artist |
| POST | `/artist/portfolio/videos` | `multipart/form-data` video | Artist |
| DELETE | `/artist/portfolio/videos/:id` | Remove video | Artist |
| POST | `/artist/portfolio/resume` | PDF only | Artist |
| POST | `/artist/portfolio/audio` | MP3/WAV | Artist |
| GET | `/artist/dashboard` | Feed \+ stats | Artist |
| POST | `/artist/verification/request` | Request ID verify | Artist |
| GET | `/artist/verification/status` | Status check | Artist |
| POST | `/artist/checkin` | Check in to live audition | Artist |
| GET | `/artist/:id` | Public profile view | JWT |

### Audition

| Method | Endpoint | Query Params | Auth |
| :---- | :---- | :---- | :---- |
| GET | `/audition` | `city, category, language, type, page, limit` | JWT |
| GET | `/audition/trending` | — | JWT |
| GET | `/audition/upcoming` | — | Artist |
| GET | `/audition/walkin` | `city` | JWT |
| GET | `/audition/:id` | — | JWT |
| POST | `/audition/:id/apply` | `{ cover_note, selected_video }` | Artist |
| GET | `/audition/applications` | — | Artist |
| GET | `/audition/applications/:id` | — | Artist |
| POST | `/audition/:id/bookmark` | Toggle | Artist |
| POST | `/audition/:id/report` | `{ reason }` | Artist |

### Hiring

| Method | Endpoint | Notes | Auth |
| :---- | :---- | :---- | :---- |
| GET | `/hiring/profile` | Own company | Hiring |
| PUT | `/hiring/profile` | Update | Hiring |
| POST | `/hiring/verification/documents` | `multipart/form-data` docs | Hiring |
| GET | `/hiring/verification/status` | Check status | Hiring |
| POST | `/hiring/audition` | Post (costs 1 credit) | Hiring |
| GET | `/hiring/audition` | My auditions | Hiring |
| PUT | `/hiring/audition/:id` | Edit | Hiring |
| DELETE | `/hiring/audition/:id` | Remove | Hiring |
| GET | `/hiring/audition/:id/applications` | Applicant list | Hiring |
| GET | `/hiring/audition/:id/applications/:appId` | Full applicant | Hiring |
| PUT | `/hiring/audition/:id/applications/:appId/shortlist` | Shortlist | Hiring |
| PUT | `/hiring/audition/:id/applications/:appId/reject` | Reject | Hiring |
| POST | `/hiring/audition/:id/schedule` | `{ date, time, venue }` | Hiring |
| GET | `/hiring/artists/search` | Query params | Hiring |
| POST | `/hiring/artists/:id/contact` | `{ message }` | Hiring |

### Payment

| Method | Endpoint | Notes | Auth |
| :---- | :---- | :---- | :---- |
| POST | `/payment/initiate` | `{ type }` | Hiring |
| POST | `/payment/webhook` | Cashfree webhook | Public |
| GET | `/payment/transactions` | History | Hiring |

### Notification

| Method | Endpoint | Auth |
| :---- | :---- | :---- |
| GET | `/notification` | JWT |
| PUT | `/notification/:id/read` | JWT |
| PUT | `/notification/read-all` | JWT |
| POST | `/notification/fcm-token` | `{ token }` — JWT |

### Admin

| Method | Endpoint | Auth |
| :---- | :---- | :---- |
| GET | `/admin/dashboard` | Admin |
| GET | `/admin/users` | Admin |
| PUT | `/admin/users/:id/activate` | Admin |
| PUT | `/admin/users/:id/deactivate` | Admin |
| GET | `/admin/artists` | Admin |
| GET | `/admin/verification/queue` | Admin |
| PUT | `/admin/verification/:id/approve` | Admin |
| PUT | `/admin/verification/:id/reject` | Admin |
| GET | `/admin/verification/approved` | Admin |
| GET | `/admin/auditions` | Admin |
| PUT | `/admin/auditions/:id/flag` | Admin |
| DELETE | `/admin/auditions/:id` | Admin |
| GET | `/admin/fraud-reports` | Admin |
| PUT | `/admin/fraud-reports/:id/action` | Admin |
| POST | `/admin/blacklist` | Admin |
| DELETE | `/admin/blacklist/:id` | Admin |
| GET | `/admin/payments` | Admin |
| GET | `/admin/analytics` | Admin |
| PUT | `/admin/cms` | Admin |

---

## 9\. Mobile App — React Native

### 9.1 Folder Structure

/mobile

  /src

    /api

      client.js

      auth.api.js

      artist.api.js

      audition.api.js

      hiring.api.js

      payment.api.js

      notification.api.js

    /store

      index.js

      /slices

        auth.slice.js

        artist.slice.js

        audition.slice.js

        hiring.slice.js

        notification.slice.js

        ui.slice.js

    /screens

      /onboarding

        SplashScreen.jsx

        OnboardingScreen.jsx

        RoleSelectionScreen.jsx

      /auth

        RegisterScreen.jsx

        OtpScreen.jsx

        SocialLoginScreen.jsx

        LoginScreen.jsx

        ForgotPasswordScreen.jsx

        ResetPasswordScreen.jsx

      /artist

        ArtistCategoryScreen.jsx

        ArtistFormScreen.jsx

        ArtistDashboardScreen.jsx

        ArtistProfileScreen.jsx

        EditProfileScreen.jsx

        PhotoGalleryScreen.jsx

        VideoPortfolioScreen.jsx

        ResumeScreen.jsx

        VerificationScreen.jsx

        AuditionDiscoveryScreen.jsx

        AuditionSearchScreen.jsx

        TrendingAuditionsScreen.jsx

        UpcomingCalendarScreen.jsx

        WalkInListingsScreen.jsx

        AuditionDetailScreen.jsx

        ApplyAuditionScreen.jsx

        MyApplicationsScreen.jsx

        ApplicationDetailScreen.jsx

        NotificationsScreen.jsx

        ArtistSettingsScreen.jsx

        DeleteAccountScreen.jsx

      /hiring

        CompanyRegisterScreen.jsx

        CompanyVerificationScreen.jsx

        VerificationPendingScreen.jsx

        CompanyProfileScreen.jsx

        EditCompanyProfileScreen.jsx

        HiringDashboardScreen.jsx

        PostAuditionScreen.jsx

        ManageAuditionsScreen.jsx

        EditAuditionScreen.jsx

        AuditionApplicationsScreen.jsx

        ApplicantDetailScreen.jsx

        ShortlistedScreen.jsx

        ScheduleInterviewScreen.jsx

        ArtistSearchScreen.jsx

        ArtistProfileViewScreen.jsx

        SendContactRequestScreen.jsx

        PaymentScreen.jsx

        TransactionHistoryScreen.jsx

        HiringSettingsScreen.jsx

        ReportAuditionScreen.jsx

      /shared

        NotificationsScreen.jsx

    /components

      /common

        Button.jsx

        Input.jsx

        Card.jsx

        Modal.jsx

        Loader.jsx

        Badge.jsx

        Avatar.jsx

        EmptyState.jsx

        Header.jsx

        BottomSheet.jsx

      /artist

        ProfileCard.jsx

        PortfolioGrid.jsx

        VideoPlayer.jsx

        AuditionCard.jsx

        ApplicationStatusBadge.jsx

      /hiring

        ApplicantCard.jsx

        CompanyCard.jsx

        AuditionListItem.jsx

    /navigation

      RootNavigator.jsx

      AuthNavigator.jsx

      ArtistNavigator.jsx

      HiringNavigator.jsx

    /hooks

      useAuth.js

      useUpload.js

      useNotification.js

      useLocation.js

    /utils

      storage.js

      permissions.js

      formatters.js

      constants.js

    /theme

      colors.js

      typography.js

      spacing.js

  App.jsx

  package.json

---

### 9.2 State Management (Redux Toolkit)

#### `store/index.js`

import { configureStore } from '@reduxjs/toolkit'

import authReducer from './slices/auth.slice'

import artistReducer from './slices/artist.slice'

import auditionReducer from './slices/audition.slice'

import hiringReducer from './slices/hiring.slice'

import notificationReducer from './slices/notification.slice'

import uiReducer from './slices/ui.slice'

export const store \= configureStore({

  reducer: {

    auth: authReducer,

    artist: artistReducer,

    audition: auditionReducer,

    hiring: hiringReducer,

    notification: notificationReducer,

    ui: uiReducer,

  },

})

#### `store/slices/auth.slice.js`

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import AuthApi from '../../api/auth.api'

import { saveToken, removeToken } from '../../utils/storage'

export const loginThunk \= createAsyncThunk('auth/login', async (payload, { rejectWithValue }) \=\> {

  try {

    const res \= await AuthApi.login(payload)

    await saveToken(res.data.token)

    return res.data

  } catch (err) {

    return rejectWithValue(err.response?.data?.message || 'Login failed')

  }

})

export const registerArtistThunk \= createAsyncThunk('auth/registerArtist', async (payload, { rejectWithValue }) \=\> {

  try {

    const res \= await AuthApi.registerArtist(payload)

    await saveToken(res.data.token)

    return res.data

  } catch (err) {

    return rejectWithValue(err.response?.data?.message || 'Registration failed')

  }

})

const authSlice \= createSlice({

  name: 'auth',

  initialState: {

    user: null,

    token: null,

    role: null,

    isAuthenticated: false,

    loading: false,

    error: null,

  },

  reducers: {

    setUser: (state, action) \=\> { state.user \= action.payload },

    logout: (state) \=\> {

      state.user \= null

      state.token \= null

      state.role \= null

      state.isAuthenticated \= false

      removeToken()

    },

    clearError: (state) \=\> { state.error \= null },

  },

  extraReducers: (builder) \=\> {

    builder

      .addCase(loginThunk.pending, (state) \=\> { state.loading \= true; state.error \= null })

      .addCase(loginThunk.fulfilled, (state, action) \=\> {

        state.loading \= false

        state.token \= action.payload.token

        state.user \= action.payload.user

        state.role \= action.payload.user.role

        state.isAuthenticated \= true

      })

      .addCase(loginThunk.rejected, (state, action) \=\> {

        state.loading \= false

        state.error \= action.payload

      })

  },

})

export const { setUser, logout, clearError } \= authSlice.actions

export default authSlice.reducer

#### `store/slices/artist.slice.js`

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import ArtistApi from '../../api/artist.api'

export const fetchProfileThunk \= createAsyncThunk('artist/fetchProfile', async (\_, { rejectWithValue }) \=\> {

  try {

    const res \= await ArtistApi.getProfile()

    return res.data

  } catch (err) {

    return rejectWithValue(err.response?.data?.message)

  }

})

export const fetchDashboardThunk \= createAsyncThunk('artist/fetchDashboard', async (\_, { rejectWithValue }) \=\> {

  try {

    const res \= await ArtistApi.getDashboard()

    return res.data

  } catch (err) {

    return rejectWithValue(err.response?.data?.message)

  }

})

const artistSlice \= createSlice({

  name: 'artist',

  initialState: {

    profile: null,

    dashboard: null,

    applications: \[\],

    verificationStatus: null,

    loading: false,

    error: null,

  },

  reducers: {

    setProfile: (state, action) \=\> { state.profile \= action.payload },

    clearArtist: (state) \=\> { state.profile \= null; state.dashboard \= null },

  },

  extraReducers: (builder) \=\> {

    builder

      .addCase(fetchProfileThunk.fulfilled, (state, action) \=\> { state.profile \= action.payload })

      .addCase(fetchDashboardThunk.fulfilled, (state, action) \=\> { state.dashboard \= action.payload })

  },

})

export const { setProfile, clearArtist } \= artistSlice.actions

export default artistSlice.reducer

#### `store/slices/audition.slice.js`

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import AuditionApi from '../../api/audition.api'

export const fetchAuditionsThunk \= createAsyncThunk('audition/fetch', async (filters, { rejectWithValue }) \=\> {

  try {

    const res \= await AuditionApi.list(filters)

    return res.data

  } catch (err) {

    return rejectWithValue(err.response?.data?.message)

  }

})

const auditionSlice \= createSlice({

  name: 'audition',

  initialState: {

    list: \[\],

    detail: null,

    trending: \[\],

    upcoming: \[\],

    bookmarks: \[\],

    filters: {},

    loading: false,

    error: null,

  },

  reducers: {

    setFilters: (state, action) \=\> { state.filters \= action.payload },

    setDetail: (state, action) \=\> { state.detail \= action.payload },

    toggleBookmark: (state, action) \=\> {

      const id \= action.payload

      const exists \= state.bookmarks.includes(id)

      state.bookmarks \= exists

        ? state.bookmarks.filter(b \=\> b \!== id)

        : \[...state.bookmarks, id\]

    },

  },

  extraReducers: (builder) \=\> {

    builder

      .addCase(fetchAuditionsThunk.pending, (state) \=\> { state.loading \= true })

      .addCase(fetchAuditionsThunk.fulfilled, (state, action) \=\> {

        state.loading \= false

        state.list \= action.payload

      })

  },

})

export const { setFilters, setDetail, toggleBookmark } \= auditionSlice.actions

export default auditionSlice.reducer

---

### 9.3 Navigation Structure

#### `navigation/RootNavigator.jsx`

import React from 'react'

import { NavigationContainer } from '@react-navigation/native'

import { useSelector } from 'react-redux'

import AuthNavigator from './AuthNavigator'

import ArtistNavigator from './ArtistNavigator'

import HiringNavigator from './HiringNavigator'

export default function RootNavigator() {

  const { isAuthenticated, role } \= useSelector(s \=\> s.auth)

  return (

    \<NavigationContainer\>

      {\!isAuthenticated && \<AuthNavigator /\>}

      {isAuthenticated && role \=== 'artist' && \<ArtistNavigator /\>}

      {isAuthenticated && role \=== 'hiring' && \<HiringNavigator /\>}

    \</NavigationContainer\>

  )

}

#### `navigation/AuthNavigator.jsx`

import { createStackNavigator } from '@react-navigation/stack'

import SplashScreen from '../screens/onboarding/SplashScreen'

import OnboardingScreen from '../screens/onboarding/OnboardingScreen'

import RoleSelectionScreen from '../screens/onboarding/RoleSelectionScreen'

import RegisterScreen from '../screens/auth/RegisterScreen'

import OtpScreen from '../screens/auth/OtpScreen'

import LoginScreen from '../screens/auth/LoginScreen'

import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'

import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen'

const Stack \= createStackNavigator()

export default function AuthNavigator() {

  return (

    \<Stack.Navigator screenOptions={{ headerShown: false }}\>

      \<Stack.Screen name="Splash" component={SplashScreen} /\>

      \<Stack.Screen name="Onboarding" component={OnboardingScreen} /\>

      \<Stack.Screen name="RoleSelection" component={RoleSelectionScreen} /\>

      \<Stack.Screen name="Register" component={RegisterScreen} /\>

      \<Stack.Screen name="Otp" component={OtpScreen} /\>

      \<Stack.Screen name="Login" component={LoginScreen} /\>

      \<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /\>

      \<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /\>

    \</Stack.Navigator\>

  )

}

#### `navigation/ArtistNavigator.jsx`

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { createStackNavigator } from '@react-navigation/stack'

import ArtistDashboardScreen from '../screens/artist/ArtistDashboardScreen'

import AuditionDiscoveryScreen from '../screens/artist/AuditionDiscoveryScreen'

import AuditionDetailScreen from '../screens/artist/AuditionDetailScreen'

import MyApplicationsScreen from '../screens/artist/MyApplicationsScreen'

import ArtistProfileScreen from '../screens/artist/ArtistProfileScreen'

import NotificationsScreen from '../screens/shared/NotificationsScreen'

const Tab \= createBottomTabNavigator()

const Stack \= createStackNavigator()

function AuditionStack() {

  return (

    \<Stack.Navigator\>

      \<Stack.Screen name="AuditionList" component={AuditionDiscoveryScreen} /\>

      \<Stack.Screen name="AuditionDetail" component={AuditionDetailScreen} /\>

    \</Stack.Navigator\>

  )

}

export default function ArtistNavigator() {

  return (

    \<Tab.Navigator\>

      \<Tab.Screen name="Home" component={ArtistDashboardScreen} /\>

      \<Tab.Screen name="Auditions" component={AuditionStack} /\>

      \<Tab.Screen name="Applications" component={MyApplicationsScreen} /\>

      \<Tab.Screen name="Profile" component={ArtistProfileScreen} /\>

      \<Tab.Screen name="Notifications" component={NotificationsScreen} /\>

    \</Tab.Navigator\>

  )

}

---

### 9.4 API Client

#### `api/client.js`

import axios from 'axios'

import { getToken, removeToken } from '../utils/storage'

const client \= axios.create({

  baseURL: 'https://api.yourdomain.com/api/v1',

  timeout: 30000,

})

client.interceptors.request.use(async (config) \=\> {

  const token \= await getToken()

  if (token) config.headers.Authorization \= \`Bearer ${token}\`

  return config

})

client.interceptors.response.use(

  res \=\> res.data,

  async err \=\> {

    if (err.response?.status \=== 401\) {

      await removeToken()

      // dispatch logout — handled by store listener

    }

    return Promise.reject(err)

  }

)

export default client

#### `api/artist.api.js`

import client from './client'

export default {

  getProfile: () \=\> client.get('/artist/profile'),

  updateProfile: (data) \=\> client.put('/artist/profile', data),

  submitCategoryForm: (data) \=\> client.post('/artist/profile/category-form', data),

  uploadPhotos: (formData) \=\> client.post('/artist/portfolio/photos', formData, {

    headers: { 'Content-Type': 'multipart/form-data' },

  }),

  deletePhoto: (id) \=\> client.delete(\`/artist/portfolio/photos/${id}\`),

  uploadVideo: (formData) \=\> client.post('/artist/portfolio/videos', formData, {

    headers: { 'Content-Type': 'multipart/form-data' },

  }),

  uploadResume: (formData) \=\> client.post('/artist/portfolio/resume', formData, {

    headers: { 'Content-Type': 'multipart/form-data' },

  }),

  getDashboard: () \=\> client.get('/artist/dashboard'),

  requestVerification: () \=\> client.post('/artist/verification/request'),

  getVerificationStatus: () \=\> client.get('/artist/verification/status'),

  getPublicProfile: (id) \=\> client.get(\`/artist/${id}\`),

}

#### `api/audition.api.js`

import client from './client'

export default {

  list: (params) \=\> client.get('/audition', { params }),

  trending: () \=\> client.get('/audition/trending'),

  upcoming: () \=\> client.get('/audition/upcoming'),

  walkin: (city) \=\> client.get('/audition/walkin', { params: { city } }),

  detail: (id) \=\> client.get(\`/audition/${id}\`),

  apply: (id, data) \=\> client.post(\`/audition/${id}/apply\`, data),

  myApplications: () \=\> client.get('/audition/applications'),

  applicationDetail: (id) \=\> client.get(\`/audition/applications/${id}\`),

  bookmark: (id) \=\> client.post(\`/audition/${id}/bookmark\`),

  report: (id, reason) \=\> client.post(\`/audition/${id}/report\`, { reason }),

}

---

### 9.5 Screens List

| \# | Screen | Role |
| :---- | :---- | :---- |
| 1 | SplashScreen | Common |
| 2 | OnboardingScreen | Common |
| 3 | RoleSelectionScreen | Common |
| 4 | RegisterScreen | Common |
| 5 | OtpScreen | Common |
| 6 | SocialLoginScreen | Common |
| 7 | LoginScreen | Common |
| 8 | ForgotPasswordScreen | Common |
| 9 | ResetPasswordScreen | Common |
| 10 | ArtistCategoryScreen | Artist |
| 11 | ArtistFormScreen | Artist |
| 12 | ArtistDashboardScreen | Artist |
| 13 | ArtistProfileScreen | Artist |
| 14 | EditProfileScreen | Artist |
| 15 | PhotoGalleryScreen | Artist |
| 16 | VideoPortfolioScreen | Artist |
| 17 | ResumeScreen | Artist |
| 18 | VerificationScreen | Artist |
| 19 | AuditionDiscoveryScreen | Artist |
| 20 | AuditionSearchScreen | Artist |
| 21 | TrendingAuditionsScreen | Artist |
| 22 | UpcomingCalendarScreen | Artist |
| 23 | WalkInListingsScreen | Artist |
| 24 | AuditionDetailScreen | Artist |
| 25 | ApplyAuditionScreen | Artist |
| 26 | MyApplicationsScreen | Artist |
| 27 | ApplicationDetailScreen | Artist |
| 28 | NotificationsScreen | Shared |
| 29 | ArtistSettingsScreen | Artist |
| 30 | DeleteAccountScreen | Artist |
| 31 | CompanyRegisterScreen | Hiring |
| 32 | CompanyVerificationScreen | Hiring |
| 33 | VerificationPendingScreen | Hiring |
| 34 | CompanyProfileScreen | Hiring |
| 35 | EditCompanyProfileScreen | Hiring |
| 36 | HiringDashboardScreen | Hiring |
| 37 | PostAuditionScreen | Hiring |
| 38 | ManageAuditionsScreen | Hiring |
| 39 | EditAuditionScreen | Hiring |
| 40 | AuditionApplicationsScreen | Hiring |
| 41 | ApplicantDetailScreen | Hiring |
| 42 | ShortlistedScreen | Hiring |
| 43 | ScheduleInterviewScreen | Hiring |
| 44 | ArtistSearchScreen | Hiring |
| 45 | ArtistProfileViewScreen | Hiring |
| 46 | SendContactRequestScreen | Hiring |
| 47 | PaymentScreen | Hiring |
| 48 | TransactionHistoryScreen | Hiring |
| 49 | HiringSettingsScreen | Hiring |
| 50 | ReportAuditionScreen | Hiring |

---

### 9.6 Shared Components

#### `components/common/Button.jsx`

import React from 'react'

import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'

import colors from '../../theme/colors'

export default function Button({ title, onPress, loading, variant \= 'primary', disabled }) {

  return (

    \<TouchableOpacity

      style={\[styles.base, styles\[variant\], disabled && styles.disabled\]}

      onPress={onPress}

      disabled={disabled || loading}

    \>

      {loading

        ? \<ActivityIndicator color="\#fff" /\>

        : \<Text style={\[styles.text, variant \=== 'outline' && styles.outlineText\]}\>{title}\</Text\>

      }

    \</TouchableOpacity\>

  )

}

const styles \= StyleSheet.create({

  base: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  primary: { backgroundColor: colors.primary },

  outline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },

  danger: { backgroundColor: colors.danger },

  disabled: { opacity: 0.5 },

  text: { color: '\#fff', fontSize: 16, fontWeight: '600' },

  outlineText: { color: colors.primary },

})

#### `components/common/Input.jsx`

import React, { useState } from 'react'

import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native'

import colors from '../../theme/colors'

export default function Input({ label, error, secureTextEntry, ...props }) {

  const \[show, setShow\] \= useState(false)

  return (

    \<View style={styles.wrapper}\>

      {label && \<Text style={styles.label}\>{label}\</Text\>}

      \<View style={\[styles.inputWrap, error && styles.errorBorder\]}\>

        \<TextInput

          style={styles.input}

          placeholderTextColor={colors.placeholder}

          secureTextEntry={secureTextEntry && \!show}

          {...props}

        /\>

        {secureTextEntry && (

          \<TouchableOpacity onPress={() \=\> setShow(\!show)}\>

            \<Text style={styles.toggle}\>{show ? 'Hide' : 'Show'}\</Text\>

          \</TouchableOpacity\>

        )}

      \</View\>

      {error && \<Text style={styles.error}\>{error}\</Text\>}

    \</View\>

  )

}

const styles \= StyleSheet.create({

  wrapper: { marginBottom: 16 },

  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '500' },

  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, height: 50 },

  errorBorder: { borderColor: colors.danger },

  input: { flex: 1, fontSize: 15, color: colors.text },

  toggle: { color: colors.primary, fontSize: 13 },

  error: { color: colors.danger, fontSize: 12, marginTop: 4 },

})

#### `theme/colors.js`

export default {

  primary: '\#7C3AED',

  primaryLight: '\#EDE9FE',

  secondary: '\#0F766E',

  danger: '\#DC2626',

  success: '\#16A34A',

  warning: '\#D97706',

  text: '\#1C1917',

  textSecondary: '\#78716C',

  border: '\#E7E5E4',

  background: '\#FAFAF9',

  card: '\#FFFFFF',

  placeholder: '\#A8A29E',

}

---

### 9.7 Artist App Screens — Key Code

#### `screens/artist/ArtistDashboardScreen.jsx`

import React, { useEffect } from 'react'

import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native'

import { useDispatch, useSelector } from 'react-redux'

import { fetchDashboardThunk } from '../../store/slices/artist.slice'

import AuditionCard from '../../components/artist/AuditionCard'

import Loader from '../../components/common/Loader'

export default function ArtistDashboardScreen({ navigation }) {

  const dispatch \= useDispatch()

  const { dashboard, loading } \= useSelector(s \=\> s.artist)

  useEffect(() \=\> { dispatch(fetchDashboardThunk()) }, \[\])

  if (loading) return \<Loader /\>

  return (

    \<ScrollView style={styles.container}\>

      \<Text style={styles.greeting}\>Hello, {dashboard?.profile?.full\_name} 👋\</Text\>

      \<Text style={styles.section}\>Nearby Auditions\</Text\>

      \<FlatList

        data={dashboard?.nearby\_auditions}

        horizontal

        keyExtractor={i \=\> i.id}

        renderItem={({ item }) \=\> (

          \<AuditionCard audition={item} onPress={() \=\> navigation.navigate('AuditionDetail', { id: item.id })} /\>

        )}

      /\>

      \<Text style={styles.section}\>Trending\</Text\>

      \<FlatList

        data={dashboard?.trending}

        keyExtractor={i \=\> i.id}

        renderItem={({ item }) \=\> (

          \<AuditionCard audition={item} onPress={() \=\> navigation.navigate('AuditionDetail', { id: item.id })} /\>

        )}

      /\>

    \</ScrollView\>

  )

}

const styles \= StyleSheet.create({

  container: { flex: 1, backgroundColor: '\#FAFAF9', padding: 16 },

  greeting: { fontSize: 22, fontWeight: '700', color: '\#1C1917', marginBottom: 4 },

  section: { fontSize: 16, fontWeight: '600', color: '\#1C1917', marginTop: 20, marginBottom: 12 },

})

#### `screens/artist/AuditionDetailScreen.jsx`

import React, { useEffect, useState } from 'react'

import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native'

import AuditionApi from '../../api/audition.api'

import Button from '../../components/common/Button'

export default function AuditionDetailScreen({ route, navigation }) {

  const { id } \= route.params

  const \[audition, setAudition\] \= useState(null)

  const \[loading, setLoading\] \= useState(false)

  useEffect(() \=\> {

    AuditionApi.detail(id).then(res \=\> setAudition(res.data))

  }, \[id\])

  const handleApply \= () \=\> navigation.navigate('ApplyAudition', { audition })

  const openMaps \= () \=\> {

    const url \= \`https://maps.google.com/?q=${audition.lat},${audition.lng}\`

    Linking.openURL(url)

  }

  if (\!audition) return null

  return (

    \<ScrollView style={styles.container}\>

      \<Text style={styles.title}\>{audition.title}\</Text\>

      \<Text style={styles.meta}\>{audition.category} · {audition.audition\_type}\</Text\>

      \<Text style={styles.label}\>Role Description\</Text\>

      \<Text style={styles.value}\>{audition.role\_description}\</Text\>

      \<Text style={styles.label}\>Venue\</Text\>

      \<Text style={styles.value}\>{audition.venue\_address}\</Text\>

      \<TouchableOpacity onPress={openMaps}\>

        \<Text style={styles.link}\>Open in Maps\</Text\>

      \</TouchableOpacity\>

      \<Text style={styles.label}\>Date & Time\</Text\>

      \<Text style={styles.value}\>{audition.audition\_date} at {audition.audition\_time}\</Text\>

      \<Text style={styles.label}\>Compensation\</Text\>

      \<Text style={styles.value}\>{audition.compensation || 'Not specified'}\</Text\>

      \<Button title="Apply Now" onPress={handleApply} /\>

    \</ScrollView\>

  )

}

const styles \= StyleSheet.create({

  container: { flex: 1, padding: 16, backgroundColor: '\#FAFAF9' },

  title: { fontSize: 22, fontWeight: '700', color: '\#1C1917', marginBottom: 4 },

  meta: { fontSize: 13, color: '\#78716C', marginBottom: 16 },

  label: { fontSize: 13, color: '\#78716C', marginTop: 12, fontWeight: '600' },

  value: { fontSize: 15, color: '\#1C1917', marginTop: 2 },

  link: { color: '\#7C3AED', fontSize: 14, marginTop: 4 },

})

---

### 9.8 Hiring App Screens — Key Code

#### `screens/hiring/HiringDashboardScreen.jsx`

import React, { useEffect } from 'react'

import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'

import { useDispatch, useSelector } from 'react-redux'

import Button from '../../components/common/Button'

export default function HiringDashboardScreen({ navigation }) {

  const { company } \= useSelector(s \=\> s.hiring)

  return (

    \<View style={styles.container}\>

      \<Text style={styles.title}\>{company?.company\_name}\</Text\>

      {\!company?.is\_verified && (

        \<View style={styles.banner}\>

          \<Text style={styles.bannerText}\>Verification pending — you cannot post auditions yet.\</Text\>

        \</View\>

      )}

      \<View style={styles.stats}\>

        \<StatBox label="Active Auditions" value={company?.active\_count || 0} /\>

        \<StatBox label="Applications" value={company?.app\_count || 0} /\>

        \<StatBox label="Credits" value={company?.credits || 0} /\>

      \</View\>

      \<Button

        title="Post New Audition"

        onPress={() \=\> {

          if (\!company?.is\_verified) {

            alert('Complete verification first')

            return

          }

          if (company?.credits \< 1\) {

            navigation.navigate('Payment')

            return

          }

          navigation.navigate('PostAudition')

        }}

      /\>

    \</View\>

  )

}

function StatBox({ label, value }) {

  return (

    \<View style={styles.statBox}\>

      \<Text style={styles.statValue}\>{value}\</Text\>

      \<Text style={styles.statLabel}\>{label}\</Text\>

    \</View\>

  )

}

const styles \= StyleSheet.create({

  container: { flex: 1, padding: 16, backgroundColor: '\#FAFAF9' },

  title: { fontSize: 22, fontWeight: '700', color: '\#1C1917', marginBottom: 16 },

  banner: { backgroundColor: '\#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 16 },

  bannerText: { color: '\#92400E', fontSize: 13 },

  stats: { flexDirection: 'row', gap: 12, marginBottom: 24 },

  statBox: { flex: 1, backgroundColor: '\#fff', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 1 },

  statValue: { fontSize: 28, fontWeight: '700', color: '\#7C3AED' },

  statLabel: { fontSize: 12, color: '\#78716C', marginTop: 4 },

})

#### `screens/hiring/PostAuditionScreen.jsx`

import React, { useState } from 'react'

import { ScrollView, Text, StyleSheet, Alert } from 'react-native'

import { useForm, Controller } from 'react-hook-form'

import Input from '../../components/common/Input'

import Button from '../../components/common/Button'

import HiringApi from '../../api/hiring.api'

export default function PostAuditionScreen({ navigation }) {

  const { control, handleSubmit, formState: { errors } } \= useForm()

  const \[loading, setLoading\] \= useState(false)

  const onSubmit \= async (data) \=\> {

    setLoading(true)

    try {

      await HiringApi.postAudition(data)

      Alert.alert('Success', 'Audition posted successfully')

      navigation.goBack()

    } catch (err) {

      Alert.alert('Error', err.response?.data?.message || 'Failed to post')

    } finally {

      setLoading(false)

    }

  }

  return (

    \<ScrollView style={styles.container}\>

      \<Text style={styles.heading}\>Post New Audition\</Text\>

      \<Controller

        control={control}

        name="title"

        rules={{ required: 'Title is required' }}

        render={({ field: { onChange, value } }) \=\> (

          \<Input label="Project Title" value={value} onChangeText={onChange} error={errors.title?.message} /\>

        )}

      /\>

      \<Controller

        control={control}

        name="role\_description"

        render={({ field: { onChange, value } }) \=\> (

          \<Input label="Role Description" value={value} onChangeText={onChange} multiline numberOfLines={4} /\>

        )}

      /\>

      \<Controller

        control={control}

        name="venue\_address"

        render={({ field: { onChange, value } }) \=\> (

          \<Input label="Venue Address" value={value} onChangeText={onChange} /\>

        )}

      /\>

      \<Controller

        control={control}

        name="audition\_date"

        render={({ field: { onChange, value } }) \=\> (

          \<Input label="Audition Date (YYYY-MM-DD)" value={value} onChangeText={onChange} /\>

        )}

      /\>

      \<Controller

        control={control}

        name="compensation"

        render={({ field: { onChange, value } }) \=\> (

          \<Input label="Compensation" value={value} onChangeText={onChange} /\>

        )}

      /\>

      \<Button title="Post Audition" onPress={handleSubmit(onSubmit)} loading={loading} /\>

    \</ScrollView\>

  )

}

const styles \= StyleSheet.create({

  container: { flex: 1, padding: 16, backgroundColor: '\#FAFAF9' },

  heading: { fontSize: 22, fontWeight: '700', color: '\#1C1917', marginBottom: 20 },

})

---

## 10\. Admin Panel — React.js

### Folder Structure

/admin

  /src

    /pages

      Dashboard.jsx

      Users.jsx

      Artists.jsx

      VerificationQueue.jsx

      Auditions.jsx

      FraudReports.jsx

      Payments.jsx

      Analytics.jsx

      CMS.jsx

    /components

      Sidebar.jsx

      DataTable.jsx

      StatCard.jsx

      VerificationModal.jsx

    /api

      admin.api.js

    /store

      admin.slice.js

  package.json

### `pages/Dashboard.jsx` (key structure)

import React, { useEffect, useState } from 'react'

import AdminApi from '../api/admin.api'

import StatCard from '../components/StatCard'

export default function Dashboard() {

  const \[stats, setStats\] \= useState(null)

  useEffect(() \=\> {

    AdminApi.getDashboard().then(res \=\> setStats(res.data))

  }, \[\])

  return (

    \<div className="p-6"\>

      \<h1 className="text-2xl font-semibold mb-6"\>Dashboard\</h1\>

      \<div className="grid grid-cols-4 gap-4"\>

        \<StatCard label="Total Artists" value={stats?.total\_artists} /\>

        \<StatCard label="Active Auditions" value={stats?.active\_auditions} /\>

        \<StatCard label="Pending Verifications" value={stats?.pending\_verifications} /\>

        \<StatCard label="Revenue" value={\`₹${stats?.revenue}\`} /\>

      \</div\>

    \</div\>

  )

}

### `pages/VerificationQueue.jsx` (key structure)

import React, { useEffect, useState } from 'react'

import AdminApi from '../api/admin.api'

export default function VerificationQueue() {

  const \[queue, setQueue\] \= useState(\[\])

  useEffect(() \=\> { AdminApi.getVerificationQueue().then(r \=\> setQueue(r.data)) }, \[\])

  const approve \= async (id) \=\> {

    await AdminApi.approveCompany(id)

    setQueue(q \=\> q.filter(c \=\> c.id \!== id))

  }

  const reject \= async (id, note) \=\> {

    await AdminApi.rejectCompany(id, { note })

    setQueue(q \=\> q.filter(c \=\> c.id \!== id))

  }

  return (

    \<div className="p-6"\>

      \<h1 className="text-2xl font-semibold mb-6"\>Verification Queue\</h1\>

      {queue.map(company \=\> (

        \<div key={company.id} className="border rounded-xl p-4 mb-4 flex justify-between items-center"\>

          \<div\>

            \<p className="font-semibold"\>{company.company\_name}\</p\>

            \<p className="text-sm text-gray-500"\>{company.company\_type}\</p\>

          \</div\>

          \<div className="flex gap-2"\>

            \<button onClick={() \=\> approve(company.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg"\>Approve\</button\>

            \<button onClick={() \=\> reject(company.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg"\>Reject\</button\>

          \</div\>

        \</div\>

      ))}

    \</div\>

  )

}

---

## 11\. Third-Party Integrations

| Service | Purpose | Package |
| :---- | :---- | :---- |
| Supabase | DB \+ Storage \+ Auth | `@supabase/supabase-js` |
| Firebase Admin | FCM push \+ Social login verify | `firebase-admin` |
| Cashfree | Payments | `axios` (REST API) |
| MSG91 | SMS OTP | `axios` (REST API) |
| SendGrid | Transactional email | `@sendgrid/mail` |
| Google Maps | Maps \+ Places (mobile) | `react-native-maps` |
| node-cron | Scheduled jobs | `node-cron` |
| bcrypt | Password hashing | `bcrypt` |
| multer | File upload handling | `multer` |
| helmet | HTTP security headers | `helmet` |
| morgan | Request logging | `morgan` |
| winston | Application logging | `winston` |
| PM2 | Process management | `pm2` |

---

## 12\. Environment Variables

\# Server

PORT=5000

NODE\_ENV=production

ALLOWED\_ORIGINS=https://admin.yourdomain.com,https://filmapp.in

\# JWT

JWT\_SECRET=your\_super\_secret\_key\_min\_32\_chars

JWT\_EXPIRES\_IN=7d

\# Supabase

SUPABASE\_URL=https://xxxxxxxxxxx.supabase.co

SUPABASE\_SERVICE\_KEY=eyJhbGci...

\# Firebase

FIREBASE\_PROJECT\_ID=your-firebase-project

FIREBASE\_PRIVATE\_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

FIREBASE\_CLIENT\_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

\# Cashfree

CASHFREE\_APP\_ID=your\_cashfree\_app\_id

CASHFREE\_SECRET\_KEY=your\_cashfree\_secret

CASHFREE\_ENV=PROD

\# MSG91

MSG91\_API\_KEY=your\_msg91\_key

MSG91\_TEMPLATE\_ID=your\_template\_id

\# SendGrid

SENDGRID\_API\_KEY=SG.xxxxxxxxx

\# Google

GOOGLE\_MAPS\_API\_KEY=AIza...

\# Admin

ADMIN\_EMAIL=admin@yourdomain.com

---

## 13\. Security Checklist

- [ ] All routes behind JWT except public auth endpoints  
- [ ] Role-based middleware on every protected route  
- [ ] File type and size validation before Supabase upload  
- [ ] OTP rate limited — 5 attempts per 10 min per IP  
- [ ] Cashfree webhook signature verified with HMAC-SHA256  
- [ ] Verification documents in private Supabase bucket  
- [ ] Passwords hashed with bcrypt (12 rounds)  
- [ ] SQL injection not possible — Supabase client uses parameterised queries  
- [ ] Helmet.js for HTTP security headers  
- [ ] CORS restricted to known origins  
- [ ] HTTPS enforced via NGINX  
- [ ] Admin actions logged with actor ID and timestamp  
- [ ] Blacklisted users blocked at JWT verify step

---

## 14\. React Native Libraries

| Purpose | Library |
| :---- | :---- |
| Navigation | `@react-navigation/native` \+ `stack` \+ `bottom-tabs` |
| State management | `@reduxjs/toolkit` \+ `react-redux` |
| HTTP client | `axios` |
| Maps | `react-native-maps` |
| Image picker | `react-native-image-picker` |
| Video player | `react-native-video` |
| Push notifications | `@react-native-firebase/messaging` |
| Async storage | `@react-native-async-storage/async-storage` |
| Form handling | `react-hook-form` |
| Validation | `zod` |
| Date/time | `dayjs` |
| OTP input | `react-native-otp-textinput` |
| Toast alerts | `react-native-toast-message` |
| Permissions | `react-native-permissions` |
| Camera | `react-native-camera` |
| PDF viewer | `react-native-pdf` |
| Splash screen | `react-native-splash-screen` |
| Icons | `react-native-vector-icons` |
| Progress bar | `react-native-progress` |

---

## 15\. Business Rules

1. Artists register and apply for auditions for **free**  
2. Hiring users pay **₹10 per audition post** or casting listing  
3. Hiring users cannot post auditions until **admin verification is approved**  
4. Blacklisted users are **blocked at JWT verify** — cannot log in or post  
5. Auditions **auto-expire** after the audition date passes (midnight cron)  
6. Artists get **FCM push \+ in-app notification** on every application status change  
7. All verification documents stored in **private bucket** — accessible only to admin  
8. Fraud reports trigger an **admin notification**  
9. Profile completion percentage **recalculates** on every profile update  
10. Social login creates a new account if email doesn't exist  
11. Hiring user must have **credits ≥ 1** to post — redirected to payment if not  
12. Admin approval/rejection sends **email notification** to the hiring user

---

## 16\. Deployment

### NGINX Config (`/etc/nginx/sites-available/film-app`)

server {

  listen 80;

  server\_name api.yourdomain.com;

  return 301 https://$host$request\_uri;

}

server {

  listen 443 ssl;

  server\_name api.yourdomain.com;

  ssl\_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;

  ssl\_certificate\_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

  location / {

    proxy\_pass http://localhost:5000;

    proxy\_http\_version 1.1;

    proxy\_set\_header Upgrade $http\_upgrade;

    proxy\_set\_header Connection 'upgrade';

    proxy\_set\_header Host $host;

    proxy\_set\_header X-Real-IP $remote\_addr;

    proxy\_cache\_bypass $http\_upgrade;

  }

  client\_max\_body\_size 110M;

}

### PM2 Start

cd /backend

npm install

pm2 start ecosystem.config.js \--env production

pm2 save

pm2 startup

### GitHub Actions CI (`/.github/workflows/deploy.yml`)

name: Deploy to VPS

on:

  push:

    branches: \[main\]

jobs:

  deploy:

    runs-on: ubuntu-latest

    steps:

      \- uses: actions/checkout@v3

      \- name: Deploy via SSH

        uses: appleboy/ssh-action@v1

        with:

          host: ${{ secrets.VPS\_HOST }}

          username: ${{ secrets.VPS\_USER }}

          key: ${{ secrets.VPS\_KEY }}

          script: |

            cd /var/www/film-app/backend

            git pull origin main

            npm install \--production

            pm2 reload film-app-api

---

*This document is the single source of truth for all engineering teams. All changes to routes, schema, services, or business rules must be reflected here first.*

*Prepared by ArgosMob Tech & AI Pvt. Ltd. | Confidential*  
