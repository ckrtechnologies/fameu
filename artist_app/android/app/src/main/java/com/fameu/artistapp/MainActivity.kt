package com.fameu.artistapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: android.os.Bundle?) {
    super.onCreate(null)
    
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      val channelId = "fameu_notifications_channel_v2"
      val channelName = "Fameu Notifications"
      val importance = android.app.NotificationManager.IMPORTANCE_HIGH
      val channel = android.app.NotificationChannel(channelId, channelName, importance)
      channel.description = "Important notifications for Fameu"
      channel.setShowBadge(true)
      
      val soundUri = android.net.Uri.parse("android.resource://" + packageName + "/" + R.raw.fameu_sound)
      val audioAttributes = android.media.AudioAttributes.Builder()
          .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
          .build()
      
      channel.setSound(soundUri, audioAttributes)
      
      val notificationManager = getSystemService(android.app.NotificationManager::class.java)
      notificationManager.createNotificationChannel(channel)
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ArtistApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
